import Hospital from '../models/Hospital.js';
import mongoose from 'mongoose';

/**
 * Middleware to restrict hospital admins to only manage their own hospital
 * This checks if the logged-in admin is linked to the hospital they're trying to access
 * Super admins (role: 'superadmin') can access any hospital
 */
const restrictToHospital = async (req, res, next) => {
  try {
    // Get the hospital ID from the URL parameter or query
    const hospitalId = req.params.hospitalId || req.query.hospitalId || req.body.hospitalId;
    
    // Skip this middleware if no hospital ID is provided or if it's 'undefined' string
    if (!hospitalId || hospitalId === 'undefined') {
      console.log('No valid hospital ID provided, skipping restriction check');
      return next();
    }
    
    // Validate that hospitalId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid hospital ID format'
      });
    }

    // Get the current user from the auth middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Super admins can access any hospital
    if (user.role === 'superadmin' || user.role === 'super_admin') {
      console.log('Super admin access granted for hospital:', hospitalId);
      
      try {
        // Still fetch the hospital for later use
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
          return res.status(404).json({
            status: 'fail',
            message: 'Hospital not found with this ID'
          });
        }
        
        req.hospital = hospital;
      } catch (err) {
        console.error('Error finding hospital for super admin:', err);
        // Even if there's an error finding the hospital, allow super admins to proceed
      }
      
      return next();
    }

    // For regular hospital admins, check if they're associated with this hospital
    try {
      // First, find all hospitals associated with this admin to improve UX
      const adminHospitals = await Hospital.find({ hospitalAdmin: user._id });
      
      if (adminHospitals.length === 0) {
        console.log(`No hospitals found for admin ${user._id}`);
        return res.status(403).json({
          status: 'fail',
          message: 'You are not associated with any hospitals. Please contact a super admin.'
        });
      }
      
      // Now check if this specific hospital belongs to the admin
      const hospital = adminHospitals.find(h => h._id.toString() === hospitalId);
      
      if (!hospital) {
        // Double-check if the hospital exists at all
        const hospitalExists = await Hospital.findById(hospitalId);
        
        if (!hospitalExists) {
          return res.status(404).json({
            status: 'fail',
            message: 'Hospital not found with this ID'
          });
        }
        
        // If we get here, the hospital exists but doesn't belong to this admin
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to access this hospital. You can only manage your own hospital.',
          yourHospitals: adminHospitals.map(h => ({ id: h._id, name: h.name })) // Provide list of their hospitals
        });
      }
      
      req.hospital = hospital;
    } catch (err) {
      console.error('Error checking hospital authorization:', err);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while checking hospital permissions'
      });
    }

    // At this point, the hospital should be stored in req.hospital by one of the above code paths
    if (!req.hospital && hospitalId && hospitalId !== 'undefined') {
      console.warn(`Warning: Hospital ID ${hospitalId} was not properly assigned to req.hospital`);
      try {
        // As a failsafe, try to look it up one more time
        const hospital = await Hospital.findById(hospitalId);
        if (hospital) {
          req.hospital = hospital;
        }
      } catch (err) {
        // Just log the error but continue
        console.error('Error in hospital failsafe lookup:', err);
      }
    }
    
    if (req.hospital) {
      console.log(`User ${user._id} granted access to hospital ${req.hospital._id} (${req.hospital.name})`);
    } else {
      console.log(`User ${user._id} proceeding without specific hospital context`);
    }
    
    next();
  } catch (error) {
    console.error('Error in restrictToHospital middleware:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong when checking hospital permissions.'
    });
  }
};

export default restrictToHospital;
