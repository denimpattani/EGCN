import express from 'express';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import {
  adminLogin,
  getStats,
  getUsers,
  getUserDetail,
  overrideUserPlan,
  assignExpertToClient,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getExperts,
  createExpert,
  deleteExpert,
} from '../controllers/admin.controller.js';

const router = express.Router();

// Public login route
router.post('/auth/login', adminLogin);

// Protected routes (Admin role only verified via authenticateAdmin)
router.use(authenticateAdmin);

router.get('/stats', getStats);

// User/Client Management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/plan', overrideUserPlan);
router.post('/assign-expert', assignExpertToClient);

// Dynamic Plans CRUD
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// Experts Management
router.get('/experts', getExperts);
router.post('/experts', createExpert);
router.delete('/experts/:id', deleteExpert);

export default router;
