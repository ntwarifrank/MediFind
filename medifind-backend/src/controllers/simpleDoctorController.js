import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import mongoose from 'mongoose';
import validator from "validator";
import sanitizeHtml from "sanitize-html";
import jwt from 'jsonwebtoken';

// A simpler version of getting all doctors for a hospital
export const getHospitalDoctors = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    // Validate hospital ID format
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid hospital ID is required'
      });
    }
    
    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hospital not found'
      });
    }
    
    // Find doctors for this hospital
    const doctors = await Doctor.find({ hospital: hospitalId });
    
    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: { doctors }
    });
  } catch (err) {
    console.error('Error fetching hospital doctors:', err);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching doctors'
    });
  }
};

// Create a new doctor with simplified authentication
export const createHospitalDoctor = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const doctorData = req.body;
    
    // Extract token and validate user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired token'
      });
    }
    
    // Validate hospital ID format
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid hospital ID is required'
      });
    }
    
    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hospital not found'
      });
    }
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'specialty'];
    const missingFields = requiredFields.filter(field => !doctorData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate email format
    console.log('Validating email:', doctorData.email);
    try {
      // Ensure email exists and is a string before validation
      if (!doctorData.email || typeof doctorData.email !== 'string') {
        return res.status(400).json({
          status: 'fail',
          message: 'Email is required and must be a string'
        });
      }
      
      // Trim email before validation
      const trimmedEmail = doctorData.email.trim();
      
      if (!validator.isEmail(trimmedEmail)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid email format'
        });
      }
      
      // Update the email to use the trimmed version
      doctorData.email = trimmedEmail;
    } catch (err) {
      console.error('Email validation error:', err);
      return res.status(400).json({
        status: 'fail',
        message: 'Error validating email'
      });
    }
    
    // Check for duplicate email
    const existingDoctor = await Doctor.findOne({ email: doctorData.email });
    if (existingDoctor) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email is already in use'
      });
    }
    
    // Sanitize input data
    const sanitizedDoctorData = {
      name: sanitizeHtml(doctorData.name, { allowedTags: [], allowedAttributes: {} }),
      email: doctorData.email.toLowerCase().trim(),
      phone: sanitizeHtml(doctorData.phone, { allowedTags: [], allowedAttributes: {} }),
      specialty: sanitizeHtml(doctorData.specialty, { allowedTags: [], allowedAttributes: {} }),
      bio: doctorData.bio ? sanitizeHtml(doctorData.bio, { allowedTags: [], allowedAttributes: {} }) : '',
      photo: doctorData.photo || 'default-doctor.jpg',
      hospital: hospitalId,
      experience: Number(doctorData.experience) || 0,
      status: 'active'
    };
    
    // Add additional fields if provided
    if (doctorData.languages && Array.isArray(doctorData.languages)) {
      sanitizedDoctorData.languages = doctorData.languages.map(lang => 
        sanitizeHtml(lang, { allowedTags: [], allowedAttributes: {} })
      );
    }
    
    if (doctorData.qualifications && Array.isArray(doctorData.qualifications)) {
      sanitizedDoctorData.qualifications = doctorData.qualifications.map(qual => ({
        degree: sanitizeHtml(qual.degree, { allowedTags: [], allowedAttributes: {} }),
        institution: sanitizeHtml(qual.institution, { allowedTags: [], allowedAttributes: {} }),
        year: qual.year ? Number(qual.year) : undefined
      }));
    }
    
    if (doctorData.availableDays && Array.isArray(doctorData.availableDays)) {
      sanitizedDoctorData.availableDays = doctorData.availableDays.map(slot => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slots: Number(slot.slots) || 0
      }));
    }
    
    // Create doctor
    const doctor = await Doctor.create(sanitizedDoctorData);
    
    console.log(`Doctor created: ${doctor._id} for hospital ${hospitalId}`);
    
    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'Doctor Added Successfully',
      data: { doctor }
    });
  } catch (err) {
    console.error('Error creating doctor:', err);
    
    // Handle specific MongoDB validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email is already in use'
      });
    }
    
    // Generic error response
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating doctor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
