import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';

// Helper function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

// Helper function to create and send token for SuperAdmin
export const createSendTokenForSuperAdmin = (admin, statusCode, res) => {
  const token = signToken(admin._id);

  // Remove password from output
  admin.password = undefined;

  // Prepare response
  const response = {
    status: 'success',
    token,
    user: {
      ...admin._doc,
      role: 'super_admin'
    }
  };

  res.status(statusCode).json(response);
};

// Register SuperAdmin
export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, and password'
      });
    }

    // Check if SuperAdmin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use. Please use a different email address.'
      });
    }

    // Create new SuperAdmin
    const superAdminData = {
      name,
      email,
      password,
      phone: phone || '',
      role: 'super_admin'
    };

    const newSuperAdmin = await SuperAdmin.create(superAdminData);

    createSendTokenForSuperAdmin(newSuperAdmin, 201, res);
  } catch (err) {
    console.error('SuperAdmin registration error:', err);

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        status: 'fail',
        message: errors.join('. ')
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email address is already in use. Please use a different email.'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// SuperAdmin login
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // Find SuperAdmin by email
    const superAdmin = await SuperAdmin.findOne({ email }).select('+password');

    // Check if SuperAdmin exists and password is correct
    if (!superAdmin || !(await superAdmin.correctPassword(password, superAdmin.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    createSendTokenForSuperAdmin(superAdmin, 200, res);
  } catch (err) {
    console.error('SuperAdmin login error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login. Please try again.'
    });
  }
};

// Get current SuperAdmin
export const getCurrentSuperAdmin = async (req, res) => {
  try {
    // SuperAdmin ID is attached to req by the auth middleware
    const superAdmin = await SuperAdmin.findById(req.admin._id);
    
    if (!superAdmin) {
      return res.status(404).json({
        status: 'fail',
        message: 'SuperAdmin not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: superAdmin
      }
    });
  } catch (err) {
    console.error('Error fetching current SuperAdmin:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching SuperAdmin data'
    });
  }
};
