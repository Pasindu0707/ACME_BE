import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import corsOptions from './config/corsOptions.js';
import connectDB from './config/dbConn.js';
import mongoose from 'mongoose';
import { logger } from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import verifyJWT from './middleware/verifyJWT.js';
import cookieParser from 'cookie-parser';
import credentials from './middleware/credentials.js';
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

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please ensure all required environment variables are set in your .env file or deployment environment.');
    if (!process.env.VERCEL) {
        process.exit(1);
    }
    // In Vercel, we'll let it fail on first request with a better error message
}

// Get the current file name and directory name (works in both CommonJS and ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Only serve static files if the directory exists (for local development)
if (!process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, '/client/dist')));
}

const PORT = process.env.PORT || 3500;

// CORS must be set early so errors can include CORS headers
// Handle options credentials check-before cors
app.use(credentials);

// CORS - Set before database connection so errors have CORS headers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Custom middleware
app.use(logger);

// Middleware to ensure database connection (for serverless)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection error in middleware:', error);
    next(error);
  }
}); 

// Adding middleware
app.use(express.urlencoded({ extended: false })); // to get form data to res body
app.use(express.json()); // to get json data
app.use(cookieParser());

// Public routes
app.use('/', subdirRoutes);
app.use('/register', adminRegisterRoutes);
app.use('/auth', authRoutes); // login
app.use('/refresh', refreshRoutes); // Refresh
app.use('/logout', logoutRoutes); // logout

// Protected routes
app.use(verifyJWT);
app.use('/inventory', inventoryRoutes);
app.use('/reports', pdfGenRoutes);
app.use('/companies', companyRoutes);
app.use('/company', dashBoardCompanyRoutes);
app.use('/users', userRoutes);

// 404 handler - only for non-API routes
app.get('*', (req, res) => {
  // Skip 404 for API routes
  if (req.path.startsWith('/auth') || 
      req.path.startsWith('/register') || 
      req.path.startsWith('/refresh') || 
      req.path.startsWith('/logout') ||
      req.path.startsWith('/inventory') ||
      req.path.startsWith('/reports') ||
      req.path.startsWith('/companies') ||
      req.path.startsWith('/company') ||
      req.path.startsWith('/users')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  
  // For other routes, try to send index.html (only if not in Vercel)
  if (!process.env.VERCEL) {
    try {
      res.sendFile(path.join(__dirname, 'views', 'index.html'));
    } catch (error) {
      res.status(404).json({ message: 'Not found' });
    }
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

app.use(errorHandler);

// Initialize database connection for local development
if (!process.env.VERCEL) {
  connectDB().catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

  // For local development, start the server
  mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Running on port ${PORT}`));
  });
}

// Export the app for Vercel serverless functions
export default app; 