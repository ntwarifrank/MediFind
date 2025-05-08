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
  getHospitalAdmins
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to MediFind API!'
  });
});

// API routes
router.post('/api/upload', upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No files uploaded',
      });
    }
    const urls = files.map((file) => `http://localhost:5001/uploads/${file.filename}`);
    res.status(200).json({
      status: 'success',
      data: { urls },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to upload images: ${error.message}`,
    });
  }
});
router.post('/api/createhospital', createHospital);
router.put('/api/updatehospital', updateHospital);
router.delete('/api/deletehospital', deleteHospital);
router.get("/api/getHospitalAdmins", getHospitalAdmins)
router.get('/api/hospital', getHospital);
router.get('/api/hospitals', getAllHospitals);
router.get('/api/hospital/search', getSearchedHospitals);

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