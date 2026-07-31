import express from 'express';
import cors from 'cors';
import path from 'path';
import { bucketsRouter } from './routes/buckets';
import { filesRouter } from './routes/files';
import { presignRouter } from './routes/presign';
import { searchRouter } from './routes/search';
import { errorHandler } from './middleware/errorHandler';
import { basicAuth } from './middleware/basicAuth';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Gate everything (API + static SPA) behind basic auth when credentials are configured
app.use(basicAuth);

// API Routes
app.use('/api/buckets', bucketsRouter);
app.use('/api/files', filesRouter);
app.use('/api/presign', presignRouter);
app.use('/api/search', searchRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from client build in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback - serve index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handler
app.use(errorHandler);
