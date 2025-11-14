import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { errorHandler as customErrorHandler } from '@utils/errors';
import { morganMiddleware } from '@utils/logger';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { openFGAService } from '@services/openfga.service';
import communityRoutes from '@api/routes/community.routes';
import userPreferencesRoutes from '@api/routes/userPreferences.routes';
import inviteRoutes from '@api/routes/invite.routes';
import usersRoutes from '@api/routes/users.routes';
import itemsRoutes from '@api/routes/items.routes';
import wealthRoutes from '@api/routes/wealth.routes';
import imagesRoutes from '@api/routes/images.routes';
import trustRoutes from '@api/routes/trust.routes';
// Use explicit relative import to avoid path alias resolution issues at runtime
import trustGlobalRoutes from './api/routes/trustGlobal.routes';
import trustLevelRoutes from '@api/routes/trustLevel.routes';
import forumRoutes from '@api/routes/forum.routes';
import pollRoutes from '@api/routes/poll.routes';
import healthAnalyticsRoutes from '@api/routes/healthAnalytics.routes';
import councilRoutes from '@api/routes/council.routes';
import initiativeRoutes from '@api/routes/initiative.routes';
import needsRoutes from '@api/routes/needs.routes';
import communityEventsRoutes from '@api/routes/communityEvents.routes';
import poolsRoutes from '@api/routes/pools.routes';
import disputeRoutes from '@api/routes/dispute.routes';
// Keycloak authentication routes
import authRoutes from '@api/routes/auth.routes';

dotenv.config();

const app: Application = express();

// Store initialization promise for server startup
export const initPromise = (async () => {
  console.log('[App] Initializing application...');

  // Run database migrations FIRST
  try {
    const { runMigrations } = await import('@db/migrate');
    await runMigrations();
  } catch (error) {
    console.error('[App] CRITICAL: Failed to run database migrations:', error);
    throw new Error('Cannot start application without database migrations');
  }

  // Note: OpenFGA database schema migrations are handled by infrastructure:
  // - Docker Compose: openfga_migrate service
  // - Kubernetes: init containers or pre-deployment Jobs
  // Application only manages authorization models via OpenFGA API

  console.log('[App] Initializing authentication and authorization services...');

  console.log('[App] Authentication: Using Keycloak (no initialization required)');

  // Initialize OpenFGA - this is CRITICAL for authorization
  try {
    await openFGAService.initialize();
    console.log('[App] OpenFGA initialized successfully');
  } catch (error) {
    console.error('[App] CRITICAL: Failed to initialize OpenFGA:', error);
    throw new Error('Cannot start application without OpenFGA authorization service');
  }
})();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API',
      version: '1.0.0',
      description: 'API documentation for the Express.js application. [Download JSON Schema](/openapi/json)',
    },
    servers: [
      {
        url: process.env.API_DOMAIN || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/api/**/*.ts', './src/app.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    process.env.WEBSITE_DOMAIN || 'http://localhost:3001',
    'http://localhost:5000' // Keycloak frontend
  ],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2000, // limit each IP to 2000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: Returns the health status of the API server
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-10-01T00:00:00.000Z
 *       500:
 *         description: Internal server error
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
// Mount Keycloak auth routes
app.use('/api/auth', authRoutes);

// Mount user preferences under /api/v1/users BEFORE the generic users router
// to ensure /users/preferences does not get captured by /users/:id
app.use('/api/v1/users', userPreferencesRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/communities', trustRoutes);
app.use('/api/v1/communities', trustLevelRoutes);
// Mount global trust routes at /api/v1 so routes resolve to:
// - /api/v1/user/trust/events
// - /api/v1/users/trust/communities
app.use('/api/v1', trustGlobalRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/invites', inviteRoutes);
app.use('/api/v1/items', itemsRoutes);
app.use('/api/v1/wealth', wealthRoutes);
app.use('/api/v1/images', imagesRoutes);
app.use('/api/v1', forumRoutes);
app.use('/api/v1/communities', pollRoutes);
app.use('/api/v1/communities', healthAnalyticsRoutes);
app.use('/api/v1/communities', councilRoutes);
app.use('/api/v1/communities', initiativeRoutes);
// Needs routes - consolidated at /api/v1/needs (includes both member and council needs)
app.use('/api/v1/needs', needsRoutes);
// Community events routes
app.use('/api/v1/communities', communityEventsRoutes);
// Pools routes
app.use('/api/v1', poolsRoutes);
// Dispute routes
app.use('/api/v1', disputeRoutes);

// Swagger docs
app.use('/openapi/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Swagger JSON endpoint
app.get('/openapi/json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Custom error handler
app.use(customErrorHandler);

export default app;
