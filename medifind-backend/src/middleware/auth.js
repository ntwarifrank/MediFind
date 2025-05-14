import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HospitalAdmin from '../models/hospitalAdmin.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed. Please log in again.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // First try to find the user in the User model
    let user = await User.findById(decoded.id);
    let isAdmin = false;

    // If not found in User model, try HospitalAdmin model
    if (!user) {
      const admin = await HospitalAdmin.findById(decoded.id);
      if (admin) {
        user = admin;
        isAdmin = true;
      } else {
        return res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token no longer exists.'
        });
      }
    }

    // Check if user is active (skip for Admin model as it might not have this field)
    if (!isAdmin && !user.active) {
      return res.status(401).json({
        status: 'fail',
        message: 'This user account has been deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication failed. Please log in again.'
    });
  }
};

export default authMiddleware;
