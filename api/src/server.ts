import app, { initPromise } from './app';
import cron from 'node-cron';
import { communityRepository } from './repositories/community.repository';
import { runWealthReplenishmentJob } from './jobs/wealthReplenishment.job';
import { runNeedsReplenishmentJob } from './jobs/needsReplenishment.job';
import { runTrustDecayJob } from './jobs/trustDecay.job';

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

      // Wealth replenishment job: Run daily at 1 AM to replenish recurrent services
      cron.schedule('0 1 * * *', async () => {
        try {
          await runWealthReplenishmentJob();
        } catch (err) {
          console.error('Wealth replenishment job failed:', err);
        }
      });

      // Needs replenishment job: Run daily at 2 AM to update recurring needs tracking
      cron.schedule('0 2 * * *', async () => {
        try {
          await runNeedsReplenishmentJob();
        } catch (err) {
          console.error('Needs replenishment job failed:', err);
        }
      });

      // Trust decay job: Run daily at 3 AM to handle trust decay notifications and OpenFGA sync
      cron.schedule('0 3 * * *', async () => {
        try {
          await runTrustDecayJob();
        } catch (err) {
          console.error('Trust decay job failed:', err);
        }
      });

      console.log('🧹 Cleanup job scheduled: Daily at midnight for old deleted communities');
      console.log('🔄 Wealth replenishment job scheduled: Daily at 1 AM for recurrent services');
      console.log('📋 Needs replenishment job scheduled: Daily at 2 AM for recurring needs tracking');
      console.log('⏳ Trust decay job scheduled: Daily at 3 AM for trust decay and OpenFGA sync');
    });
  } catch (error) {
    console.error('[Server] FATAL: Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;// Trigger release
