import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_access_secret');
    req.user = decoded; // { id, role, ... }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

import Admin from '../models/Admin.model.js';
import Expert from '../models/Expert.model.js';

export const authenticateAdmin = (req, res, next) => {
  authenticate(req, res, async () => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied: Administrators only' });
      }
      const adminExists = await Admin.findById(req.user.id);
      if (!adminExists) {
        return res.status(403).json({ success: false, message: 'Access denied: Admin record not found' });
      }
      req.admin = adminExists;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Internal admin auth error' });
    }
  });
};

export const authenticateExpert = (req, res, next) => {
  authenticate(req, res, async () => {
    try {
      if (req.user.role !== 'expert') {
        return res.status(403).json({ success: false, message: 'Access denied: Experts only' });
      }
      const expertExists = await Expert.findById(req.user.id);
      if (!expertExists) {
        return res.status(403).json({ success: false, message: 'Access denied: Expert record not found' });
      }
      req.expert = expertExists;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Internal expert auth error' });
    }
  });
};
