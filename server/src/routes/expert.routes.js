import express from 'express';
import { authenticateExpert } from '../middleware/auth.middleware.js';
import {
  expertLogin,
  getAssignedClients,
  getMeetings,
  createMeeting,
  updateMeeting,
  postAdvice,
  getAdviceList,
  deleteAdvice,
} from '../controllers/expert.controller.js';

const router = express.Router();

// Public login route
router.post('/auth/login', expertLogin);

// Protected routes (Expert role only verified via authenticateExpert)
router.use(authenticateExpert);

router.get('/clients', getAssignedClients);

// Calendar Sessions CRUD
router.get('/meetings', getMeetings);
router.post('/meetings', createMeeting);
router.put('/meetings/:id', updateMeeting);

// Direct B2B Advice Bulletins CRUD
router.get('/advices', getAdviceList);
router.post('/advices', postAdvice);
router.delete('/advices/:id', deleteAdvice);

export default router;
