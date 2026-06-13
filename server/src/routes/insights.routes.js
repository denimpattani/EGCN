import express from 'express';
import { 
  getDailyReport, 
  getMonthlyReport, 
  getAnnualReport 
} from '../controllers/insights.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Enforce authentication on all insights routes
router.use(authenticate);

router.get('/daily', getDailyReport);
router.get('/monthly/:month', getMonthlyReport);
router.get('/annual/:year', getAnnualReport);

export default router;
