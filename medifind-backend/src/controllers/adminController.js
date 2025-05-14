import Admin from '../models/hospitalAdmin.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

// Helper function to verify if the user is authorized to access hospital data
const verifyHospitalAccess = async (req) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return { authorized: false, error: 'No authentication token provided' };
    }

    // Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // Find the admin by decoded id
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return { authorized: false, error: 'Admin not found or token invalid' };
    }
    
    // Store admin information in request for later use
    req.admin = admin;
    return { authorized: true, admin };
  } catch (error) {
    console.error('Authorization error:', error);
    return { authorized: false, error: error.message };
  }
};

// Get all hospital admins
export const getAllAdmins = async (req, res) => {
  try {
    //const auth = await verifyHospitalAccess(req);
    
    // if (!auth.authorized) {
    //   return res.status(401).json({
    //     status: 'fail',
    //     message: auth.error
    //   });
    // }

    const admins = await Admin.find().select('-password');
    
    res.status(200).json({
      status: 'success',
      admins
    });
  } catch (error) {
    console.error('Error fetching all admins:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a specific admin by ID
export const getAdminById = async (req, res) => {
  try {
    // Removed authentication check to allow public access
    // const auth = await verifyHospitalAccess(req);
    // 
    // if (!auth.authorized) {
    //   return res.status(401).json({
    //     status: 'fail',
    //     message: auth.error
    //   });
    // }

    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid admin ID format'
      });
    }

    const admin = await Admin.findById(id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        status: 'fail',
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      status: 'success',
      Admin: admin
    });
  } catch (error) {
    console.error('Error fetching admin by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
