import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';
import Admin from '../models/hospitalAdmin.js';
import Hospital from '../models/Hospital.js';


// Helper function to sign JWT token
export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

// Helper function to create and send token
export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user
  });
};


export const createSendTokenForAdmin = (admin, statusCode, res, hospital = null) => {
  const token = signToken(admin._id);

  // Remove password from output
  admin.password = undefined;

  // Prepare response including hospital information if available
  const response = {
    status: 'success',
    token,
    user: {
      ...admin._doc,
      role: 'hospital_admin' // Explicitly set role for frontend authorization
    }
  };

  // Add hospital information if available
  if (hospital) {
    response.hospital = hospital;
  }

  res.status(statusCode).json(response);
};


// Register a new user
export const register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);

    const { name, email, password, phone, address, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, and password'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use. Please use a different email address.'
      });
    }

    const userData = {
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'patient'
    };

    if (address) {
      userData.address = address;
    }

    if (['hospital_admin', 'doctor', 'staff'].includes(userData.role) && name) {
      userData.hospital = {
        name,
        address: address || ''
      };
    }

    console.log('Creating user with data:', { ...userData, password: '[REDACTED]' });

    const newUser = await User.create(userData);

    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('Registration error:', err);

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

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login. Please try again.'
    });
  }
};

// Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token or authorization failed. Please log in again.'
    });
  }
};

// Middleware to restrict actions based on roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

//get current admin
export const getCurrentAdmin = async (req, res) => {
  const adminId = req.params.id;

  if(!adminId){
    res.status(404).json({sucess: false, message: "Admin Id Required"})
  }

  try {
    const adminData = await Admin.findById({_id: adminId});

    if(!adminData){
      res.status.json({sucess: false, message:"No DataAdmin Available"})
      return;
    }

    res.status(200).json({
      status: 'success',
      Admin: adminData
    });

  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user information'
    });
  }
};

// Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      user: req.user
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user information'
    });
  }
};

//register admin
export const registerAdmin = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);

    const { hospitalName, adminName, email, password, phone, address, role } = req.body;

    if (!hospitalName || !adminName || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, and password'
      });
    }

    const existingUser = await Admin.findOne({ email , hospitalName  });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use. Please use a different email address.'
      });
    }

    const userData = {
      hospitalName,
      adminName,
      email,
      password,
      phone: phone || '',
      role: role
    };

    if (address) {
      userData.address = address;
    }


    console.log('Creating user with data:', { ...userData, password: '[REDACTED]' });

    // Create the admin user
    const newAdmin = await Admin.create(userData);
    
    // Check if a hospital with this name already exists
    let hospital = await Hospital.findOne({ name: hospitalName });
    
    // If hospital doesn't exist, create it
    if (!hospital) {
      hospital = await Hospital.create({
        name: hospitalName,
        hospitalAdmin: newAdmin._id,
        address: address || '',
        email: email, // Using admin email as initial hospital email
        phone: phone || '',
        description: `Hospital managed by ${adminName}`,
        district: '',
        sector: '',
        cell: '',
        type: 'General',
        specialties: [],
        services: [],
        facilities: [],
        workingDays: {},
        images: [],
        patientCount: 0,
        revenue: 0,
      });
      
      console.log(`Created new hospital with ID: ${hospital._id} and linked to admin ${newAdmin._id}`);
    } else {
      // Update hospital to link to this admin
      hospital.hospitalAdmin = newAdmin._id;
      await hospital.save();
      console.log(`Linked existing hospital ${hospital._id} to admin ${newAdmin._id}`);
    }
    
    createSendTokenForAdmin(newAdmin, 201, res, hospital);
  } catch (err) {
    console.error('Registration error:', err);

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

//admin login
export const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // Only look for admins in the hospitalAdmin schema
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.correctPassword(password, admin.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }
    
    // Find the hospital associated with this admin
    const hospital = await Hospital.findOne({ hospitalAdmin: admin._id });

    // Create and send the authentication token
    createSendTokenForAdmin(admin, 200, res, hospital);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login. Please try again.'
    });
  }
};

