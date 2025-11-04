import app, { initPromise } from './app';
import cron from 'node-cron';
import { communityRepository } from './repositories/community.repository';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Wait for OpenFGA initialization before accepting requests
    console.log('[Server] Waiting for initialization to complete...');
    await initPromise;
    console.log('[Server] All services initialized successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/openapi/docs`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/health`);

      // Cleanup job: Run daily at midnight to hard delete communities soft-deleted >90 days ago
      cron.schedule('0 0 * * *', async () => {
        try {
          const count = await communityRepository.cleanupOldDeleted();
          console.log(`Cleanup job completed: Hard deleted ${count} old communities`);
        } catch (err) {
          console.error('Cleanup job failed:', err);
        }
      });

      console.log('🧹 Cleanup job scheduled: Daily at midnight for old deleted communities');
    });
  } catch (error) {
    console.error('[Server] FATAL: Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;