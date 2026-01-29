import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

// Import configurations
import corsOptions from './config/corsOptions.js';
import connectDB from './config/dbConn.js';

// Import middleware
import { logger } from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import verifyJWT from './middleware/verifyJWT.js';
import credentials from './middleware/credentials.js';

// Import routes
import subdirRoutes from './Routes/subdir.js';
import adminRegisterRoutes from './Routes/adminRegister.js';
import authRoutes from './Routes/auth.js';
import refreshRoutes from './Routes/refresh.js';
import logoutRoutes from './Routes/logout.js';
import inventoryRoutes from './Routes/API/inventoryRoutes.js';
import pdfGenRoutes from './Routes/API/pdfGen.js';
import companyRoutes from './Routes/API/companyRoutes.js';
import userRoutes from './Routes/API/userRoutes.js';
import dashBoardCompanyRoutes from './Routes/API/dashCompany.js';

// Load environment variables
dotenv.config();

// Get directory paths (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Trust proxy (important for Vercel)
app.set('trust proxy', 1);

// CORS - Must be first to handle preflight and errors
app.use(credentials);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use(logger);

// Database connection middleware (for serverless)
app.use(async (req, res, next) => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 0) {
      // Not connected, try to connect
      await connectDB();
    } else if (mongoose.connection.readyState === 3) {
      // Connection was lost, try to reconnect
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    // Pass error to error handler (CORS headers already set)
    next(error);
  }
});

// ============================================
// ROUTES
// ============================================

// Public routes (no authentication required)
app.use('/', subdirRoutes);
app.use('/register', adminRegisterRoutes);
app.use('/auth', authRoutes);
app.use('/refresh', refreshRoutes);
app.use('/logout', logoutRoutes);

// Protected routes (require JWT authentication)
app.use(verifyJWT);
app.use('/inventory', inventoryRoutes);
app.use('/reports', pdfGenRoutes);
app.use('/companies', companyRoutes);
app.use('/company', dashBoardCompanyRoutes);
app.use('/users', userRoutes);

// 404 handler for undefined routes
app.all('*', (req, res) => {
  // Check if it's an API route
  const isApiRoute = req.path.startsWith('/auth') ||
    req.path.startsWith('/register') ||
    req.path.startsWith('/refresh') ||
    req.path.startsWith('/logout') ||
    req.path.startsWith('/inventory') ||
    req.path.startsWith('/reports') ||
    req.path.startsWith('/companies') ||
    req.path.startsWith('/company') ||
    req.path.startsWith('/users');

  if (isApiRoute) {
    res.status(404).json({ message: 'Route not found' });
  } else if (!process.env.VERCEL) {
    // Only serve static files in local development
    try {
      res.sendFile(path.join(__dirname, 'views', 'index.html'));
    } catch (error) {
      res.status(404).json({ message: 'Not found' });
    }
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

// Error handler (must be last)
app.use(errorHandler);

// ============================================
// LOCAL DEVELOPMENT SERVER
// ============================================

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3500;

  // Initialize database connection
  connectDB()
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to database:', err.message);
      process.exit(1);
    });
}

// ============================================
// VERCEL SERVERLESS FUNCTION EXPORT
// ============================================

export default app;
