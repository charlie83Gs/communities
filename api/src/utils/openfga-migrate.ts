import postgres from 'postgres';

/**
 * Run OpenFGA database migrations
 *
 * This utility checks if the OpenFGA database needs migrations and runs them if necessary.
 * It connects directly to the OpenFGA PostgreSQL database and executes the migration command.
 *
 * @throws Error if migrations fail
 */
export async function runOpenFGAMigrations(): Promise<void> {
  // Skip migrations in production/K8s environments where OpenFGA is managed separately
  if (process.env.SKIP_OPENFGA_MIGRATIONS === 'true' || process.env.NODE_ENV === 'production') {
    console.log('[OpenFGA Migrations] Skipping migrations (managed externally)');
    return;
  }

  // Default to Docker network hostname, but allow override for local dev
  const datastoreUri =
    process.env.OPENFGA_DATASTORE_URI ||
    'postgres://openfga_user:openfga_password@postgres_openfga:5432/openfga?sslmode=disable';

  // For local connections (when app runs on host), replace postgres_openfga hostname with localhost:5434
  const localDatastoreUri = datastoreUri.replace('postgres_openfga:5432', 'localhost:5434');

  console.log('[OpenFGA Migrations] Checking if migrations are needed...');

  // Create postgres client for local connection
  const sql = postgres(localDatastoreUri, {
    max: 1, // Single connection for migration checks
    ssl: localDatastoreUri.includes('sslmode=require') ? 'require' : false,
  });

  try {
    // Check if migration is needed by querying the migration table
    // OpenFGA uses a table called 'migration' to track the current schema version
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'migration'
      ) as table_exists
    `;

    let needsMigration = false;

    if (result[0].table_exists) {
      // Check current migration version
      const versionResult = await sql`SELECT version FROM migration LIMIT 1`;
      const currentVersion = versionResult[0]?.version || 0;

      // OpenFGA v1.10.3 requires version 4
      const requiredVersion = 4;

      if (currentVersion < requiredVersion) {
        console.log(
          `[OpenFGA Migrations] Database at revision ${currentVersion}, requires ${requiredVersion}`
        );
        needsMigration = true;
      } else {
        console.log(`[OpenFGA Migrations] Database is up to date (version ${currentVersion})`);
      }
    } else {
      console.log('[OpenFGA Migrations] Migration table does not exist, migrations needed');
      needsMigration = true;
    }

    if (needsMigration) {
      console.log('[OpenFGA Migrations] Running migrations...');

      // Run migrations using the openfga migrate command via exec
      const { spawn } = await import('child_process');

      // Use docker to run the migration
      const dockerNetwork = 'api_app_network';
      const migrationProcess = spawn('docker', [
        'run',
        '--rm',
        '--network',
        dockerNetwork,
        'openfga/openfga:latest',
        'migrate',
        '--datastore-engine',
        'postgres',
        '--datastore-uri',
        datastoreUri,
      ]);

      let output = '';
      let errorOutput = '';

      migrationProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      migrationProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      await new Promise<void>((resolve, reject) => {
        migrationProcess.on('close', (code) => {
          if (code === 0) {
            console.log('[OpenFGA Migrations] Migrations completed successfully');
            console.log(output);
            resolve();
          } else {
            reject(new Error(`Migration failed with code ${code}: ${errorOutput}`));
          }
        });

        migrationProcess.on('error', (err) => {
          reject(new Error(`Failed to spawn migration process: ${err.message}`));
        });
      });
    }
  } catch (error) {
    console.error('[OpenFGA Migrations] Failed to run migrations:', error);
    throw error;
  } finally {
    await sql.end();
  }
}
