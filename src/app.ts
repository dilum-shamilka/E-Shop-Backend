import dns from 'node:dns';
dns.setServers (["8.8.8.8", "8.8.4.4"]);

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import cartRoutes from './routes/cartRoutes';
import userRoutes from './routes/userRoutes';

import errorHandler from './middleware/errorHandler';
import './config/database';
import { startCronJobs } from './utils/cronJobs';

dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

// 🔐 CORS Configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

/**
 * 🔥 Body parsers
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ API Routes
 */


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);

/**
 * 🩺 Health Check
 */
app.get('/api/health', (_req, res) => {
  res.status(200).send('Backend is running smoothly!');
});

// ❌ Global Error Handler
app.use(errorHandler);

// ⏱️ Initialize Cron Jobs
startCronJobs();

// 🚀 Start Server with a small fallback if the default port is already occupied.
const startServer = (port: number): void => {
  const server = http.createServer(app);

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
      return;
    }

    console.error('Server failed to start:', error);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
};

startServer(DEFAULT_PORT);