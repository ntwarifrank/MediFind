// doctorRoutes.js
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import Admin from '../models/hospitalAdmin.js';
import mongoose from 'mongoose';
import validator from "validator"
import sanitizeHtml from "sanitize-html" 


// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    let query = {};

    // Filter by hospital if provided
    if (req.query.hospitalId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.hospitalId)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid hospital ID format'
        });
      }
      
      const hospital = await Hospital.findById(req.query.hospitalId);
      if (!hospital) {
        return res.status(404).json({
          status: 'fail',
          message: 'Hospital not found'
        });
      }
      
      query.hospital = req.query.hospitalId;
    }

    // Search by name if provided
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }

    const doctors = await Doctor.find(query);

    res.status(200).json({
      status: 'success',
      results: doctors.length,
      Doctors: { doctors }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get single doctor
export const getDoctorById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid doctor ID format'
      });
    }
    
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { doctor }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Create new doctor (hospital admin only)
export const createDoctor = async (req, res) => {
  try {
    // Extract user role from request
    const { role, _id: userId } = req.user;
    
    // Get hospitalId from URL params instead of body
    const hospitalId = req.params.hospitalId;
    const doctorData = req.body;

    // Check user permissions
    const isHospitalAdmin = role === 'hospital_admin';
    const isSuperAdmin = role === 'super_admin';
    if (!isHospitalAdmin && !isSuperAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to add a doctor',
      });
    }

    // Validate hospitalId
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid hospital ID is required',
      });
    }

    // If hospital admin, verify they manage the specified hospital
    if (isHospitalAdmin) {
      const hospital = await Hospital.findById(hospitalId).populate('hospitalAdmin');
      if (!hospital) {
        return res.status(404).json({
          status: 'fail',
          message: 'Hospital not found',
        });
      }
      
      // Check if hospital has admin and if current user is the admin
      if (!hospital.hospitalAdmin) {
        console.error('Hospital missing admin information');
        return res.status(400).json({
          status: 'fail',
          message: 'Hospital is missing admin information',
        });
      }

      // Validate admin permissions - compare ObjectIds as strings
      const adminId = hospital.hospitalAdmin._id || hospital.hospitalAdmin;
      
      console.log('Current user ID:', userId);
      console.log('Hospital admin ID:', adminId);
      
      if (adminId.toString() !== userId.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to add doctors to this hospital',
        });
      }
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'specialty'];
    const missingFields = requiredFields.filter((field) => !doctorData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate email format
    if (!validator.isEmail(doctorData.email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid email format',
      });
    }

    // Check for duplicate email
    const existingDoctor = await Doctor.findOne({ email: doctorData.email });
    if (existingDoctor) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email is already in use',
      });
    }

    // Sanitize input data
    const sanitizedDoctorData = {
      ...doctorData,
      name: sanitizeHtml(doctorData.name, { allowedTags: [], allowedAttributes: {} }),
      email: doctorData.email.toLowerCase().trim(),
      phone: sanitizeHtml(doctorData.phone, { allowedTags: [], allowedAttributes: {} }),
      specialty: sanitizeHtml(doctorData.specialty, { allowedTags: [], allowedAttributes: {} }),
      bio: doctorData.bio ? sanitizeHtml(doctorData.bio, { allowedTags: [], allowedAttributes: {} }) : '',
      languages: doctorData.languages
        ? doctorData.languages.map((lang) => sanitizeHtml(lang, { allowedTags: [], allowedAttributes: {} }))
        : [],
      qualifications: doctorData.qualifications
        ? doctorData.qualifications.map((qual) => ({
            degree: sanitizeHtml(qual.degree, { allowedTags: [], allowedAttributes: {} }),
            institution: sanitizeHtml(qual.institution, { allowedTags: [], allowedAttributes: {} }),
            year: qual.year ? Number(qual.year) : undefined,
          }))
        : [],
      availableDays: doctorData.availableDays
        ? doctorData.availableDays.map((slot) => ({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slots: Number(slot.slots) || 0,
          }))
        : [],
      experience: Number(doctorData.experience) || 0,
      status: doctorData.status || 'active',
      photo: doctorData.photo || 'default-doctor.jpg',
      hospital: hospitalId,
    };

    // Create doctor
    const doctor = await Doctor.create(sanitizedDoctorData);

    // Log successful creation (for monitoring/debugging)
    console.log(`Doctor created: ${doctor._id} for hospital ${hospitalId} by user ${userId}`);

    // Return success response
    res.status(201).json({
      status: 'success',
      message: 'Doctor Added Successfully',
      data: { doctor },
    });
  } catch (err) {
    // Log error for debugging
    console.error('Error creating doctor:', err);

    // Handle specific MongoDB validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors,
      });
    }

    // Handle duplicate key errors (e.g., unique email)
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email is already in use',
      });
    }

    // Generic error response
    res.status(500).json({
      status: 'error',
      message: err.message || 'An error occurred while creating the doctor',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid doctor ID format'
      });
    }
    
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    const isHospitalAdmin = req.user.role === 'hospital_admin';
    const isSuperAdmin = req.user.role === 'super_admin';

    if (isHospitalAdmin) {
      const hospital = await Hospital.findById(doctor.hospital);

      if (!hospital) {
        return res.status(404).json({
          status: 'fail',
          message: 'Hospital not found'
        });
      }

      // Check if adminName exists and matches user ID (fixing potential property mismatch)
      if ((hospital.adminName && hospital.adminName.toString() !== req.user._id.toString()) || 
          (hospital.admin && hospital.admin.toString() !== req.user._id.toString())) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to update this doctor'
        });
      }
    } else if (!isSuperAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update doctor information'
      });
    }

    // Sanitize and validate update data
    const sanitizedUpdate = {};
    const allowedFields = ['name', 'email', 'phone', 'specialty', 'qualifications', 'experience', 
                         'bio', 'languages', 'availableDays', 'status', 'photo'];
    
    // Only allow updating specific fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedUpdate[key] = req.body[key];
      }
    });
    
    // Add updatedAt timestamp
    sanitizedUpdate.updatedAt = Date.now();
    
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      sanitizedUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { doctor: updatedDoctor }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid doctor ID format'
      });
    }
    
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    const isHospitalAdmin = req.user.role === 'hospital_admin';
    const isSuperAdmin = req.user.role === 'super_admin';

    if (isHospitalAdmin) {
      const hospital = await Hospital.findById(doctor.hospital);

      if (!hospital) {
        return res.status(404).json({
          status: 'fail',
          message: 'Hospital not found'
        });
      }

      // Check if adminName or admin exists and matches user ID
      if ((hospital.adminName && hospital.adminName.toString() !== req.user._id.toString()) || 
          (hospital.admin && hospital.admin.toString() !== req.user._id.toString())) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to delete this doctor'
        });
      }
    } else if (!isSuperAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete doctors'
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get doctor's schedule and availability
export const getDoctorSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: 'fail',
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        availableDays: doctor.availableDays
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

