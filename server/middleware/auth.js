import jwt from 'jsonwebtoken';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.userType === 'staff') {
        req.user = await Staff.findById(decoded.id).select('-passwordHash');
        req.userType = 'staff';
      } else if (decoded.userType === 'student') {
        req.user = await Student.findById(decoded.id).select('-passwordHash');
        req.userType = 'student';
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Middleware to restrict by staff role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (req.userType !== 'staff' || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};
