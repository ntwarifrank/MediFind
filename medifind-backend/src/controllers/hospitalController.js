import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import Admin from '../models/hospitalAdmin.js';
import mongoose from 'mongoose';
import {v2 as cloudinary} from "cloudinary";
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Image upload route
export const uploadImages = async (req, res) => {
  // Verify Cloudinary config
  if (!cloudinary.config().api_key) {
    console.error("Cloudinary not configured!");
    return res.status(500).json({
      success: false,
      message: "Server configuration error"
    });
  }

  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const urls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'hospitals'
      });
      urls.push(result.secure_url);
    }

    return res.status(200).json({
      success: true,
      urls
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// Get all hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().select('-__v');
    res.status(200).json({
      status: 'success',
      hospitals: { hospitals },
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch hospitals',
    });
  }
};

// Get hospital by ID
export const getHospital = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid hospital ID',
      });
    }
    const hospital = await Hospital.findById(req.params.id).select('-__v');
    if (!hospital) {
      return res.status(404).json({
        status: 'fail',
        message: 'No hospital found with that ID',
      });
    }
    res.status(200).json({
      status: 'success',
      Hospital: { hospital },
    });
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch hospital',
    });
  }
};

export const getSpecificHospital = async (req, res) => {
  try {
    // Get user data from authenticated request
    const { _id: userId } = req.user;
    const originalUser = req.user;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID',
      });
    }
    
    // Determine if user is a hospital admin by checking both models
    let isAdmin = false;
    let adminData = null;
    
    // Check if this is a hospital admin from the Admin model
    if (originalUser.adminName) {
      // This is likely from the Admin model
      isAdmin = true;
      adminData = originalUser;
    } else {
      // Check if user has hospital_admin role
      isAdmin = originalUser.role === 'hospital_admin' || originalUser.role === 'super_admin';
    }
    
    if (!isAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this resource',
      });
    }
    
    let hospital;
    
    // First try to find hospital where this user is the admin
    hospital = await Hospital.findOne({ hospitalAdmin: userId });
    
    // If not found and user is from Admin model, try to find by admin's hospitalName
    if (!hospital && adminData && adminData.hospitalName) {
      hospital = await Hospital.findOne({ name: adminData.hospitalName });
    }
    
    if (!hospital) {
      // Also check if the user has hospital reference
      const user = await User.findById(userId).populate('hospital');
      if (user && user.hospital) {
        hospital = user.hospital;
      }
    }
    
    // Handle super_admin case separately
    if (!hospital && originalUser.role === 'super_admin') {
      // For super_admin, if hospitalId is provided in query, use that
      const { hospitalId } = req.query;
      if (hospitalId && mongoose.Types.ObjectId.isValid(hospitalId)) {
        hospital = await Hospital.findById(hospitalId);
      } else {
        // Otherwise return first hospital
        hospital = await Hospital.findOne({});
      }
    }
    if (!hospital) {
      return res.status(404).json({
        status: 'fail',
        message: 'No hospital found with That Admin ID',
      });
    }
    res.status(200).json({
      status: 'success',
      Hospital: { hospital },
    });
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch hospital',
    });
  }
};


export const createHospital = async (req, res) => {
  try {
    // 1. Input Validation
    const requiredFields = ['name', 'district', 'sector', 'cell', 'type', 'description', 'email', 'phone', 'specialties', 'services'];
    const missingFields = requiredFields.filter((field) => !req.body[field] && req.body[field] !== '');
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        fields: missingFields,
      });
    }
    
    // Check if the hospitalAdmin field exists - it's optional for superadmins creating hospitals
    // but we'll always need to associate a hospital with an admin
    const hospitalAdminId = req.body.hospitalAdmin;
    let adminExists = false;
    
    if (hospitalAdminId) {
      // Validate if the hospital admin exists
      if (!mongoose.Types.ObjectId.isValid(hospitalAdminId)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid hospital admin ID format'
        });
      }
      
      // Check if admin exists
      const admin = await Admin.findById(hospitalAdminId);
      if (!admin) {
        return res.status(404).json({
          status: 'fail',
          message: 'Hospital admin not found with the provided ID'
        });
      }
      
      adminExists = true;
    } else if (req.user && req.user.role !== 'superadmin') {
      // If no hospitalAdmin provided and current user is not a superadmin
      return res.status(400).json({
        status: 'fail',
        message: 'Hospital admin ID is required'
      });
    }

    // 2. Email Validation
    if (!req.body.email || typeof req.body.email !== 'string' || req.body.email.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Email must be a non-empty string',
        field: 'email',
      });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(req.body.email.trim())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email must be a valid email address',
        field: 'email',
      });
    }

    // 3. Phone Validation
    if (!req.body.phone || typeof req.body.phone !== 'string' || req.body.phone.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Phone number must be a non-empty string',
        field: 'phone',
      });
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(req.body.phone.trim())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Phone number must be a valid phone number',
        field: 'phone',
      });
    }

    // 4. Normalize Name for Case-Insensitive Uniqueness
    const normalizedName = req.body.name.trim().toLowerCase();

    // 5. Check for Existing Hospital by Name
    const existingHospital = await Hospital.findOne({
      name: { $regex: `^${normalizedName}$`, $options: 'i' }
    });
    if (existingHospital) {
      return res.status(409).json({
        status: 'fail',
        message: 'Hospital with this name already exists',
        field: 'name',
      });
    }

    // 6. Validate Type
    const validTypes = [
      'Referral Hospital',
      'District Hospital',
      'Private Hospital',
      'Specialized Hospital',
      'Health Center'
    ];
    if (!validTypes.includes(req.body.type)) {
      return res.status(400).json({
        status: 'fail',
        message: `Type must be one of: ${validTypes.join(', ')}`,
        field: 'type',
      });
    }

    // 7. Data Transformation
    const arrayFields = ['specialties', 'services', 'facilities', 'images'];
    const transformedBody = { ...req.body, name: req.body.name.trim() }; // Preserve original name case
    arrayFields.forEach((field) => {
      if (transformedBody[field] && typeof transformedBody[field] === 'string') {
        transformedBody[field] = transformedBody[field]
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
      if (transformedBody[field] && !Array.isArray(transformedBody[field])) {
        transformedBody[field] = [transformedBody[field]];
      }
    });

    // 8. Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return cloudinary.uploader.upload(file.path, {
          folder: 'hospitals'
        });
      });

      const results = await Promise.all(uploadPromises);
      transformedBody.images = results.map(result => result.secure_url);
    }

    // 9. Validate Array Fields
    if (!Array.isArray(transformedBody.specialties) || transformedBody.specialties.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'At least one specialty is required',
        field: 'specialties',
      });
    }
    if (!Array.isArray(transformedBody.services) || transformedBody.services.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'At least one service is required',
        field: 'services',
      });
    }

    // 10. Rating Validation
    if (transformedBody.rating && (transformedBody.rating < 0 || transformedBody.rating > 5)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rating must be between 0 and 5',
        field: 'rating',
      });
    }

    // 11. Working Days Validation
    if (transformedBody.workingDays) {
      const validDays = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      const invalidDays = Object.keys(transformedBody.workingDays).filter(
        (day) => !validDays.includes(day)
      );
      if (invalidDays.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: `Invalid working days: ${invalidDays.join(', ')}`,
          fields: invalidDays.map((day) => `workingDays.${day}`),
        });
      }
      for (const day of validDays) {
        if (
          transformedBody.workingDays[day] !== undefined &&
          typeof transformedBody.workingDays[day] !== 'boolean'
        ) {
          return res.status(400).json({
            status: 'fail',
            message: `workingDays.${day} must be a boolean`,
            field: `workingDays.${day}`,
          });
        }
      }
    }

    // 12. URL Validation for logo and website
    const urlFields = ['logo', 'website'];
    for (const field of urlFields) {
      if (
        transformedBody[field] &&
        !/^https?:\/\/\S+$/.test(transformedBody[field])
      ) {
        return res.status(400).json({
          status: 'fail',
          message: `${field} must be a valid URL`,
          field,
        });
      }
    }

    // 13. Other Validations
    if (transformedBody.beds && transformedBody.beds < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Number of beds cannot be negative',
        field: 'beds',
      });
    }
    if (transformedBody.founded) {
      const currentYear = new Date().getFullYear();
      if (transformedBody.founded < 1800 || transformedBody.founded > currentYear) {
        return res.status(400).json({
          status: 'fail',
          message: `Founded year must be between 1800 and ${currentYear}`,
          field: 'founded',
        });
      }
    }
    if (transformedBody.status && !['active', 'inactive', 'pending'].includes(transformedBody.status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Status must be one of: active, inactive, pending',
        field: 'status',
      });
    }

    // 14. Create Hospital
    const newHospital = await Hospital.create(transformedBody);

    // 15. Response
    res.status(201).json({
      status: 'success',
      data: { hospital: newHospital },
    });
  } catch (error) {
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(409).json({
        status: 'fail',
        message: `Duplicate value for field: ${JSON.stringify(error.keyValue)}`,
        field: Object.keys(error.keyValue)[0],
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((el) => ({
        field: el.path,
        message: el.message,
      }));
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors,
      });
    }
    console.error('Error creating hospital:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating hospital',
    });
  }
};

// Update hospital
export const updateHospital = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid hospital ID',
      });
    }

    // Transform array fields
    const arrayFields = ['specialties', 'services', 'facilities', 'images'];
    const transformedBody = { ...req.body };
    arrayFields.forEach((field) => {
      if (transformedBody[field] && typeof transformedBody[field] === 'string') {
        transformedBody[field] = transformedBody[field]
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
    });

    // Handle image uploads to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return cloudinary.uploader.upload(file.path, {
          folder: 'hospitals'
        });
      });

      const results = await Promise.all(uploadPromises);
      transformedBody.images = results.map(result => result.secure_url);
    }

    // Validate workingDays if provided
    if (transformedBody.workingDays) {
      const validDays = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      const invalidDays = Object.keys(transformedBody.workingDays).filter(
        (day) => !validDays.includes(day)
      );
      if (invalidDays.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: `Invalid working days: ${invalidDays.join(', ')}`,
          fields: invalidDays.map((day) => `workingDays.${day}`),
        });
      }
      for (const day of validDays) {
        if (
          transformedBody.workingDays[day] !== undefined &&
          typeof transformedBody.workingDays[day] !== 'boolean'
        ) {
          return res.status(400).json({
            status: 'fail',
            message: `workingDays.${day} must be a boolean`,
            field: `workingDays.${day}`,
          });
        }
      }
    }

    // Validate URLs
    const urlFields = ['logo', 'website'];
    for (const field of urlFields) {
      if (
        transformedBody[field] &&
        !/^https?:\/\/\S+$/.test(transformedBody[field])
      ) {
        return res.status(400).json({
          status: 'fail',
          message: `${field} must be a valid URL`,
          field,
        });
      }
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      transformedBody,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hospital) {
      return res.status(404).json({
        status: 'fail',
        message: 'No hospital found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { hospital },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((el) => ({
        field: el.path,
        message: el.message,
      }));
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors,
      });
    }
    console.error('Error updating hospital:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update hospital',
    });
  }
};

// Delete hospital
export const deleteHospital = async (req, res) => {
  const { id } = req.params;
  console.log("hospital id to b deleted" + id);
  try { 

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'No ID provided'
      });
    }

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    const hospital = await Hospital.findById({_id: id});
    if (!hospital) {
      return res.status(404).json({
        status: 'fail',
        message: 'No hospital found with that ID',
      });
    }

    // Delete images from Cloudinary
    if (hospital.images && hospital.images.length > 0) {
      const deletePromises = hospital.images.map(imageUrl => {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        return cloudinary.uploader.destroy(`hospitals/${publicId}`);
      });
      await Promise.all(deletePromises);
    }

    await Hospital.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting hospital:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete hospital',
    });
  }
};

// Search hospitals
export const getSearchedHospitals = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Search query is required',
      });
    }

    const hospitals = await Hospital.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { district: { $regex: query, $options: 'i' } },
        { sector: { $regex: query, $options: 'i' } },
        { cell: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } },
        { services: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: hospitals.length,
      data: { hospitals },
    });
  } catch (error) {
    console.error('Error searching hospitals:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search hospitals'
    });
  }
};


export const getHospitalAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID format"
      });
    }

    const admin = await Admin.findById(id).select('adminName email phone hospitalName');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      success: true,
      Admin: admin // Consistent casing (Admin vs admin)
    });

  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}