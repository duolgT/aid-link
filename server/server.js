import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import emergencyGuideRoutes from './routes/emergencyGuideRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { testConnection, initializeDatabase } from './config/db.js';
import { PendingRegistration } from './models/PendingRegistration.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://aidlinkkakuma.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AidLink API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/emergency-guides', emergencyGuideRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to PostgreSQL. Please check your database configuration.');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Schedule cleanup of expired pending registrations (every hour)
    setInterval(async () => {
      try {
        await PendingRegistration.deleteExpired();
        console.log('🧹 Cleaned up expired pending registrations');
      } catch (error) {
        console.error('⚠️ Failed to clean up pending registrations:', error.message);
      }
    }, 60 * 60 * 1000); // 1 hour

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 AidLink API running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: PostgreSQL (Neon)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
