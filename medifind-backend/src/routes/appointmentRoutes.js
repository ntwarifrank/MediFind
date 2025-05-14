// appointmentRoutes.js
import express from 'express'; 
import * as appointmentController from '../controllers/appointmentController.js'; // Assuming you use named exports
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all appointments (with filters)
export const getAllAppointments = router.get('/', auth, appointmentController.getAllAppointments);

// Get today's appointments
export const getTodayAppointments = router.get('/today', auth, appointmentController.getTodayAppointments);

// Get user's appointments
export const getMyAppointments = router.get('/my-appointments', auth, appointmentController.getMyAppointments);

// Get available appointment times
export const getAvailableTimes = router.get('/available-times', appointmentController.getAvailableTimes);

// Get a specific appointment
export const getAppointment = router.get('/:id', auth, appointmentController.getAppointment);

// Create new appointment
export const createAppointment = router.post('/', auth, appointmentController.createAppointment);

// Update appointment status
export const updateAppointmentStatus = router.patch('/:id/status', auth, appointmentController.updateAppointmentStatus);

// Update appointment details
export const updateAppointment = router.patch('/:id', auth, appointmentController.updateAppointment);

// Delete appointment
export const deleteAppointment = router.delete('/:id', auth, appointmentController.deleteAppointment);
