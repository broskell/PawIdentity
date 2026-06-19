import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import * as models from './models/index.js';

// Route Imports
import authRoutes from './routes/auth.js';
import petRoutes from './routes/pet.js';
import medicalRoutes from './routes/medical.js';
import vaccinationRoutes from './routes/vaccinations.js';
import lostRoutes from './routes/lost.js';
import scanRoutes from './routes/scan.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/lost', lostRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PawIdentity API Running',
    timestamp: new Date()
  });
});

console.log('Loaded Models:', Object.keys(models));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
