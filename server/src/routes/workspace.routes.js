import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import {
  getRoom,
  getMessages,
  sendMessage,
  uploadMedia,
  markSeen,
  getUnreadCount,
  getMeetings,
  createMeeting,
  updateMeeting,
  getCalendar,
} from '../controllers/workspace.controller.js';

const router = express.Router();

// Apply authenticate middleware to all workspace endpoints
router.use(authenticate);

// Rooms
router.get('/room', getRoom);

// Chat & Messages
router.get('/messages/unread', getUnreadCount);
router.get('/messages/:roomId', getMessages);
router.post('/messages', sendMessage);
router.post('/upload', upload.single('file'), uploadMedia);
router.patch('/messages/:id/seen', markSeen);

// Meetings & Calendar
router.get('/meetings', getMeetings);
router.post('/meetings', createMeeting);
router.put('/meetings/:id', updateMeeting);
router.get('/calendar', getCalendar);

export default router;
