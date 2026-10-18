import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import callsRoutes from './routes/callsRoutes';
import { healthCheck } from './controllers/callsController';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/env';

export const createApp = (): Express => {
  const app = express();

  // CORS configuration
  const allowedOrigins = config.frontendOrigin.split(',').map((o: string) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes('*') ||
          origin.endsWith('.vercel.app') ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // Body parser with safe size limit (1MB max payload)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Root health check endpoint (required by Render and Section 9)
  app.get('/health', healthCheck);

  // API Routes
  app.use('/api/calls', callsRoutes);

  // 404 Catch-All
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
