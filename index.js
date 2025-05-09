import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import corsOptions from './config/corsOptions.js';
import connectDB from './config/dbConn.js';
import mongoose from 'mongoose';
import { logger } from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import verifyJWT from './middleware/verifyJWT.js';
import cookieParser from 'cookie-parser';
import credentials from './middleware/credentials.js';

// Get the current file name and directory name
const __dirname = path.resolve()

const app = express();
app.use(express.static(path.join(__dirname,'/client/dist')))

const PORT = process.env.PORT || 3500;

// Database connection
connectDB();

// Custom middleware
app.use(logger);

// Handle options credentials check-before cors
app.use(credentials);

// CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// Adding middleware
app.use(express.urlencoded({ extended: false })); // to get form data to res body
app.use(express.json()); // to get json data
app.use(cookieParser());

// Using the routes with ES modules
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

// 404
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'))
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Running on port ${PORT}`));
}); 