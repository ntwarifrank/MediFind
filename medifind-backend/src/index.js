import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import multer from 'multer';
import authMiddleware from './middleware/auth.js';
import authAdminMiddleware from './middleware/authAdmin.js';
import restrictToHospital from './middleware/restrictToHospital.js';
import superAdminAuth from './middleware/superAdminAuth.js';
import superAdminMiddleware from './middleware/superAdminMiddleware.js';
import { uploadImages } from './controllers/hospitalController.js';
import { login, register, getCurrentUser, getCurrentAdmin, registerAdmin, adminlogin} from './controllers/authController.js';
import { registerSuperAdmin, superAdminLogin, getCurrentSuperAdmin } from './controllers/superAdminController.js';
import { getAllAdmins, getAdminById } from './controllers/adminController.js';
import {
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAvailableTimes,
  getAllAppointments,
  getTodayAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment
} from './controllers/appointmentController.js';

import {
  createHospital,
  deleteHospital,
  updateHospital,
  getHospital,
  getSpecificHospital,
  getAllHospitals,
  getSearchedHospitals,
  getHospitalAdmin,
} from './controllers/hospitalController.js';

import { 
  getAllDoctors, 
  getDoctorById, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor, 
  getDoctorSchedule 
} from './controllers/doctorController.js';

import {
  getHospitalDoctors,
  createHospitalDoctor
} from './controllers/simpleDoctorController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize express app
const app = express();

// Store files in memory for Cloudinary upload
const upload = multer({ dest: 'uploads/' });

// Connect to database
connectDB();

// Global middlewares
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use(router);


// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to MediFind API!'
  });
});


// Hospital routes
app.get('/api/hospitals', getAllHospitals);
app.get('/api/hospitals/search', getSearchedHospitals);
app.get('/api/hospitals/:id', getHospital);
app.get('/api/getHospitalAdmin/:id', getHospitalAdmin);
app.get('/api/specificHospital', authAdminMiddleware, authMiddleware, getSpecificHospital);
// Allow both SuperAdmin and hospital admin to create hospitals
app.post('/api/hospitals', (req, res, next) => {
  // Try SuperAdmin auth first, fall back to regular admin auth
  superAdminMiddleware(req, res, (err) => {
    if (!err) return next(); // SuperAdmin authentication succeeded
    // If SuperAdmin auth fails, try regular admin auth
    authAdminMiddleware(req, res, next);
  });
}, createHospital);
app.post('/api/uploadImages', upload.array('images'), uploadImages);
app.post('/api/upload', upload.array('images'), uploadImages); // Adding the route used by all-hospitals-admin
app.delete('/api/hospitals/:id', authAdminMiddleware, restrictToHospital, deleteHospital);
app.patch('/api/hospitals/:id', authAdminMiddleware, restrictToHospital, updateHospital);

app.post('/api/createAppointment', createAppointment);
app.get('/api/getMyAppointments/mine', getMyAppointments);
app.patch('/api/updateAppointments/:id/status', updateAppointmentStatus);
app.get('/api/appointments/available-times', getAvailableTimes);
app.get('/api/getAppointments', getAllAppointments);
app.get('/api/getAppointments/today', getTodayAppointments);
app.get('/api/getAppointment/:id', getAppointment);
app.put('/api/updateAppointment/:id', updateAppointment);
app.delete('/api/deleteAppointment/:id', deleteAppointment);

app.post('/api/auth/register', register);
app.post('/api/auth/register/admin', registerAdmin);
app.post('/api/auth/register/superadmin', registerSuperAdmin); // New SuperAdmin registration endpoint
app.post('/api/auth/login', login);
app.post('/api/auth/login/admin', adminlogin);
app.post('/api/auth/login/superadmin', superAdminLogin); // New SuperAdmin login endpoint
app.get('/api/auth/me', getCurrentUser);
app.get('/api/auth/me/superadmin', superAdminMiddleware, getCurrentSuperAdmin); // Protected SuperAdmin route
app.get('/api/getCurrentUser/Admin/:id', getCurrentAdmin);

// Admin routes
app.get('/api/admins', superAdminMiddleware, getAllAdmins);
app.get('/api/getAdmin/:id', superAdminMiddleware, getAdminById);
app.get('/api/auth/admin/all', superAdminMiddleware, getAllAdmins); // Fallback route for compatibility

// Doctor routes (original routes with middleware)
app.get('/api/hospitals/:hospitalId/doctors-old', authAdminMiddleware, authMiddleware, restrictToHospital, getAllDoctors);
app.get('/api/doctors/:id', authAdminMiddleware, authMiddleware, getDoctorById);
app.post('/api/hospitals/:hospitalId/doctors-old', authAdminMiddleware, authMiddleware, restrictToHospital, createDoctor);
app.patch('/api/doctors/:id', authAdminMiddleware, authMiddleware, updateDoctor);
app.delete('/api/doctors/:id', authAdminMiddleware, authMiddleware, deleteDoctor);
app.get('/api/doctors/:id/schedule', getDoctorSchedule);

// New simplified doctor routes without problematic middleware
app.get('/api/hospitals/:hospitalId/doctors', getHospitalDoctors);
app.post('/api/hospitals/:hospitalId/doctors', createHospitalDoctor);

// Error handling for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  res.status(statusCode).json({
    status,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});


app.get('/', (req, res) => {
  res.send('Hello from Express on Vercel!');
});

// Export the Express app
export default app;