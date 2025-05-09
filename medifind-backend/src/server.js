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
import { uploadImages } from './controllers/hospitalController.js';
import { login, register, getCurrentUser, registerAdmin, adminlogin} from './controllers/authController.js';
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
  getAllHospitals,
  getSearchedHospitals,
  getHospitalAdmins,
  getHospitalAdmin,
} from './controllers/hospitalController.js';

import { 
  getAllDoctors, 
  getDoctorById, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor, 
  getDoctorSchedule 
} from './routes/doctorRoutes.js';

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


router.post('/api/createhospital',  upload.array('images'), createHospital);
router.put('/api/updatehospital', updateHospital);
router.delete('/api/deletehospital/:id', deleteHospital);
router.get("/api/getHospitalAdmins", getHospitalAdmins);
router.get("/api/getAdmin/:id", getHospitalAdmin);
router.get('/api/hospital', getHospital);
router.get('/api/hospitals', getAllHospitals);
router.get('/api/hospital/search', getSearchedHospitals);
router.post('/api/uploadImages', upload.array('images'), uploadImages);

router.post('/api/createAppointment', createAppointment);
router.get('/api/getMyAppointments/mine', getMyAppointments);
router.patch('/api/updateAppointments/:id/status', updateAppointmentStatus);
router.get('/api/appointments/available-times', getAvailableTimes);
router.get('/api/getAppointments', getAllAppointments);
router.get('/api/getAppointments/today', getTodayAppointments);
router.get('/api/getAppointment/:id', getAppointment);
router.put('/api/updateAppointment/:id', updateAppointment);
router.delete('/api/deleteAppointment/:id', deleteAppointment);

router.post('/api/auth/register', register);
router.post('/api/auth/register/admin', registerAdmin);
router.post('/api/auth/login', login);
router.post('/api/auth/login/admin', adminlogin);
router.get('/api/auth/me', getCurrentUser);

router.get('/api/doctors', getAllDoctors);
router.get('/api/doctors/:id', getDoctorById);
router.post('/api/doctors', createDoctor);
router.put('/api/doctors/:id', updateDoctor);
router.delete('/api/doctors/:id', deleteDoctor);
router.get('/api/doctors/:id/schedule', getDoctorSchedule);

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