import express from 'express';
import { 
  submitDailyEntry, 
  getTodayEntry, 
  getDailyHistory,
  submitMonthlyTarget,
  getMonthlyTarget,
  getAllMonthlyTargets 
} from '../controllers/target.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All target routes require authentication
router.use(authenticate);

// Daily Target Routes
router.post('/daily', submitDailyEntry);
router.get('/daily', getTodayEntry);
router.get('/daily/history', getDailyHistory);

// Monthly Target Routes
router.post('/monthly', submitMonthlyTarget);
router.get('/monthly/all', getAllMonthlyTargets);
router.get('/monthly/:month', getMonthlyTarget);

export default router;
