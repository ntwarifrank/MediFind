import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import SuperAdmin from '../models/SuperAdmin.js';

// Middleware to protect routes specifically for super admin access
const superAdminMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check if auth token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if super admin exists
    const currentSuperAdmin = await SuperAdmin.findById(decoded.id);
    if (!currentSuperAdmin) {
      return res.status(401).json({
        status: 'fail',
        message: 'The super admin belonging to this token no longer exists.'
      });
    }
    
    // All SuperAdmins have the correct role by default due to schema design
    // Still, we double check for security
    if (currentSuperAdmin.role !== 'super_admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this resource. Super admin access required.'
      });
    }

    // Grant access to protected route
    req.admin = currentSuperAdmin;
    next();
  } catch (err) {
    console.error('Super admin authentication error:', err);
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token or authorization failed. Please log in again.'
    });
  }
};

export default superAdminMiddleware;
