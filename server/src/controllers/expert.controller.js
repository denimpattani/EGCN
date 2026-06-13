import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Expert from '../models/Expert.model.js';
import User from '../models/User.model.js';
import Meeting from '../models/Meeting.model.js';
import Advice from '../models/Advice.model.js';
import { sendMeetingScheduledEmail } from '../utils/email.js';

// Helper to generate expert access and refresh tokens
const generateExpertTokens = (expertId) => {
  const accessToken = jwt.sign({ id: expertId, role: 'expert' }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret', {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { id: expertId, role: 'expert' },
    process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    { expiresIn: '12h' }
  );

  return { accessToken, refreshToken };
};

// Expert login handler
export const expertLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    const expert = await Expert.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    }).select('+password');

    if (!expert) {
      return res.status(401).json({ success: false, message: 'Invalid Advisor credentials' });
    }

    const isMatch = await bcrypt.compare(password, expert.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Advisor credentials' });
    }

    const { accessToken, refreshToken } = generateExpertTokens(expert._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Expert authentication successful',
      accessToken,
      user: {
        id: expert._id,
        email: expert.email,
        username: expert.username,
        fullName: expert.fullName,
        expertise: expert.expertise,
        role: 'expert',
      }
    });
  } catch (error) {
    console.error('Expert Login Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get roster of assigned client businesses
export const getAssignedClients = async (req, res) => {
  try {
    const expertId = req.expert._id;

    const clients = await User.find({ assignedExpert: expertId })
      .select('-password')
      .sort({ businessName: 1 });

    return res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Get Assigned Clients Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve clients list' });
  }
};

// Calendar Meetings CRUD
export const getMeetings = async (req, res) => {
  try {
    const expertId = req.expert._id;

    const meetings = await Meeting.find({ expertId })
      .populate('clientId', 'businessName email phone')
      .sort({ scheduledAt: 1 });

    return res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('Get Meetings Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve expert schedule' });
  }
};

export const createMeeting = async (req, res) => {
  try {
    const expertId = req.expert._id;
    const { clientId, title, description, scheduledAt, duration = 60, type = 'video' } = req.body;

    if (!clientId || !title || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'Please provide clientId, title, and schedule date' });
    }

    // Verify client assignment
    const client = await User.findOne({ _id: clientId, assignedExpert: expertId });
    if (!client) {
      return res.status(403).json({ success: false, message: 'You can only schedule meetings with your assigned clients' });
    }

    // Generate consult room ID (format: clientID_expertID)
    const roomId = `${clientId}_${expertId}`;
    const meetingLink = type === 'video' ? `peer_${roomId}` : 'Physical Site Visit';

    const meeting = await Meeting.create({
      roomId,
      clientId,
      expertId,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration: Number(duration),
      type,
      status: 'scheduled',
      meetingLink
    });

    const expertName = req.expert.fullName || req.expert.username;
    const clientName = client.businessName || client.username;
    const meetingTimeStr = new Date(scheduledAt).toLocaleString();
    await sendMeetingScheduledEmail(client.email, clientName, expertName, title, meetingTimeStr);

    return res.status(201).json({
      success: true,
      message: 'Consultation session successfully scheduled',
      data: meeting
    });
  } catch (error) {
    console.error('Create Meeting Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to schedule meeting' });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const expertId = req.expert._id;
    const { id } = req.params;
    const { status, title, description, scheduledAt, duration, type } = req.body;

    const meeting = await Meeting.findOne({ _id: id, expertId });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting session not found' });
    }

    if (status) meeting.status = status;
    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt);
    if (duration) meeting.duration = Number(duration);
    
    if (type) {
      meeting.type = type;
      meeting.meetingLink = type === 'video' ? `peer_${meeting.roomId}` : 'Physical Site Visit';
    }

    await meeting.save();

    return res.status(200).json({
      success: true,
      message: 'Consultation session updated successfully',
      data: meeting
    });
  } catch (error) {
    console.error('Update Meeting Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update meeting details' });
  }
};

// Post B2B Business Bulletins
export const postAdvice = async (req, res) => {
  try {
    const expertId = req.expert._id;
    const { clientId, message } = req.body;

    if (!clientId || !message) {
      return res.status(400).json({ success: false, message: 'Please specify clientId and advice bulletin' });
    }

    // Verify client assignment
    const client = await User.findOne({ _id: clientId, assignedExpert: expertId });
    if (!client) {
      return res.status(403).json({ success: false, message: 'You can only post recommendations to your assigned clients' });
    }

    const advice = await Advice.create({
      userId: clientId,
      expertId,
      message,
    });

    return res.status(201).json({
      success: true,
      message: 'Advisory recommendation successfully published to client dashboard',
      data: advice
    });
  } catch (error) {
    console.error('Post Advice Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish advisory recommendation' });
  }
};

export const getAdviceList = async (req, res) => {
  try {
    const expertId = req.expert._id;
    
    const adviceList = await Advice.find({ expertId })
      .populate('userId', 'businessName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: adviceList
    });
  } catch (error) {
    console.error('Get Advice List Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve advices list' });
  }
};

export const deleteAdvice = async (req, res) => {
  try {
    const expertId = req.expert._id;
    const { id } = req.params;

    const advice = await Advice.findOne({ _id: id, expertId });
    if (!advice) {
      return res.status(404).json({ success: false, message: 'Advisory entry not found' });
    }

    await Advice.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Advisory recommendation deleted successfully',
    });
  } catch (error) {
    console.error('Delete Advice Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete advice bulletin' });
  }
};
