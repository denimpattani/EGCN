import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.model.js';
import Expert from '../models/Expert.model.js';
import User from '../models/User.model.js';
import Plan from '../models/Plan.model.js';
import Subscription from '../models/Subscription.model.js';
import Notification from '../models/Notification.model.js';
import { sendExpertAssignedEmail, sendExpertChangedEmail, sendPlanUpgradeEmail } from '../utils/email.js';

// Helper to generate access and refresh tokens
const generateAdminTokens = (adminId) => {
  const accessToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret', {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { id: adminId, role: 'admin' },
    process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    { expiresIn: '12h' }
  );

  return { accessToken, refreshToken };
};

// Admin login handler
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    const admin = await Admin.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    }).select('+password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials' });
    }

    const { accessToken, refreshToken } = generateAdminTokens(admin._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      accessToken,
      user: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: 'admin',
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Retrieve platform metrics (MRR, active plans, total users)
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalExperts = await Expert.countDocuments();

    // Calculate Monthly Recurring Revenue (MRR) from active, paid subscriptions
    const now = new Date();
    const activeSubscriptions = await Subscription.find({
      status: 'paid',
      endDate: { $gt: now }
    });

    const mrr = activeSubscriptions.reduce((acc, sub) => acc + (sub.amount / 100), 0);
    const activeSubCount = activeSubscriptions.length;

    // Plans distribution breakdown
    const planBreakdown = await User.aggregate([
      { $match: { role: 'client' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    const plansBreakdownMap = { free: 0, business: 0, pro: 0, vip: 0 };
    planBreakdown.forEach((pb) => {
      plansBreakdownMap[pb._id || 'free'] = pb.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalExperts,
        mrr,
        activeSubscriptionsCount: activeSubCount,
        planBreakdown: plansBreakdownMap
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to aggregate platform stats' });
  }
};

// Users management (list standard clients)
export const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'client' };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    const skipIndex = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .populate('assignedExpert', 'fullName email phone expertise')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skipIndex);

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: users,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch platform users' });
  }
};

// Retrieve single client full profile and logs
export const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').populate('assignedExpert', 'fullName email phone expertise');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch subscription transactions
    const transactions = await Subscription.find({ userId: id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        user,
        transactions,
      }
    });
  } catch (error) {
    console.error('Get User Detail Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
};

// Plan override directly updating a client's plan & expiry date
export const overrideUserPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, durationDays = 30 } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let planExpiry = null;
    if (plan !== 'free') {
      planExpiry = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    }

    user.plan = plan;
    user.planExpiry = planExpiry;
    await user.save();

    // Create an override Subscription ledger log
    await Subscription.create({
      userId: user._id,
      plan: plan,
      razorpayOrderId: `override_${Date.now()}`,
      razorpayPayId: `override_pay_${Math.random().toString(36).substring(7)}`,
      amount: 0,
      status: 'paid',
      startDate: new Date(),
      endDate: planExpiry,
    });

    await Notification.create({
      userId: user._id,
      title: 'Plan Updated',
      message: `Your account has been upgraded to the ${plan.toUpperCase()} plan by Admin.`,
      type: 'system',
      link: '/dashboard/plans'
    });

    if (plan !== 'free') {
      await sendPlanUpgradeEmail(user.email, user.businessName || user.username, plan.toUpperCase(), 0);
    }

    return res.status(200).json({
      success: true,
      message: `User plan override successful to ${plan.toUpperCase()}`,
      data: {
        id: user._id,
        plan: user.plan,
        planExpiry: user.planExpiry
      }
    });
  } catch (error) {
    console.error('Override User Plan Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to override user plan' });
  }
};

// Client to Expert Assignment
export const assignExpertToClient = async (req, res) => {
  try {
    const { userId, expertId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId client reference' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Linkage cleanup if reassigning
    if (user.assignedExpert) {
      await Expert.findByIdAndUpdate(user.assignedExpert, {
        $pull: { assignedClients: userId }
      });
    }

    if (expertId) {
      const expert = await Expert.findById(expertId);
      if (!expert) {
        return res.status(404).json({ success: false, message: 'Consulting expert not found' });
      }

      // Determine if it's a new assignment or a change
      const isExpertChanged = user.assignedExpert && user.assignedExpert.toString() !== expertId;

      user.assignedExpert = expertId;
      await user.save();

      // Avoid double inclusion in list
      await Expert.findByIdAndUpdate(expertId, {
        $addToSet: { assignedClients: userId }
      });

      // Create Notification for the client
      await Notification.create({
        userId: userId,
        title: 'Expert Assigned',
        message: `Admin has assigned ${expert.fullName} as your expert advisor.`,
        type: 'system',
        link: '/dashboard/workspace'
      });

      // Send email to client
      if (isExpertChanged) {
        await sendExpertChangedEmail(user.email, user.businessName || user.username, expert.fullName);
      } else {
        await sendExpertAssignedEmail(user.email, user.businessName || user.username, expert.fullName);
      }
    } else {
      // Clear expert linkage
      user.assignedExpert = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Client expert linkage successfully saved',
      data: {
        userId: user._id,
        assignedExpert: user.assignedExpert
      }
    });
  } catch (error) {
    console.error('Assign Expert Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to bind expert to client' });
  }
};

// Dynamic Pricing Plans CRUD
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error('Get Plans Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve plans list' });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { name, displayName, price, description, features, durationDays = 30, isRecommended = false, accentHex = '#d74339' } = req.body;

    if (!name || !displayName || price === undefined || !description || !features) {
      return res.status(400).json({ success: false, message: 'Please provide all plan details' });
    }

    const existingPlan = await Plan.findOne({ name: name.toLowerCase().trim() });
    if (existingPlan) {
      return res.status(400).json({ success: false, message: 'A plan with this unique identifier already exists' });
    }

    const newPlan = await Plan.create({
      name: name.toLowerCase().trim(),
      displayName,
      price: Number(price),
      description,
      features,
      durationDays: Number(durationDays),
      isRecommended,
      accentHex,
    });

    return res.status(201).json({
      success: true,
      message: 'New subscription plan successfully created',
      data: newPlan,
    });
  } catch (error) {
    console.error('Create Plan Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create plan' });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, price, description, features, durationDays, isRecommended, accentHex } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    if (displayName) plan.displayName = displayName;
    if (price !== undefined) plan.price = Number(price);
    if (description) plan.description = description;
    if (features) plan.features = features;
    if (durationDays !== undefined) plan.durationDays = Number(durationDays);
    if (isRecommended !== undefined) plan.isRecommended = isRecommended;
    if (accentHex) plan.accentHex = accentHex;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Update Plan Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Do not delete vital base fallback free plan
    if (plan.name === 'free') {
      return res.status(400).json({ success: false, message: 'Cannot delete the mandatory base free tier' });
    }

    await Plan.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete Plan Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
};

// Experts Account Provisions
export const getExperts = async (req, res) => {
  try {
    const experts = await Expert.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: experts });
  } catch (error) {
    console.error('Get Experts Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve active experts' });
  }
};

export const createExpert = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, expertise, bio } = req.body;

    if (!username || !email || !password || !fullName || !phone || !expertise || !bio) {
      return res.status(400).json({ success: false, message: 'Please provide all expert creation fields' });
    }

    const existingExpert = await Expert.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingExpert) {
      return res.status(409).json({ success: false, message: 'Email or Username already registered for another Expert' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const expert = await Expert.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName,
      phone,
      expertise,
      bio,
    });

    return res.status(201).json({
      success: true,
      message: 'Consulting Expert account successfully provisioned',
      data: {
        id: expert._id,
        username: expert.username,
        email: expert.email,
        fullName: expert.fullName,
        expertise: expert.expertise,
      }
    });
  } catch (error) {
    console.error('Create Expert Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create expert account' });
  }
};

export const deleteExpert = async (req, res) => {
  try {
    const { id } = req.params;

    const expert = await Expert.findById(id);
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Unlink assigned clients
    await User.updateMany(
      { assignedExpert: id },
      { $set: { assignedExpert: null } }
    );

    await Expert.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Expert account revoked and assigned clients unlinked successfully',
    });
  } catch (error) {
    console.error('Delete Expert Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete expert account' });
  }
};
