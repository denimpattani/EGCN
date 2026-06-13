import DailyEntry from '../models/DailyEntry.model.js';
import MonthlyTarget from '../models/MonthlyTarget.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import { getSuggestionByAchievement } from '../constants/suggestions.js';
import { sendTargetAchievementEmail } from '../utils/email.js';
import { z } from 'zod';
import { getChatIo } from '../sockets/chat.socket.js'; // Fallback if we need an IO instance, wait...

// Get start and end of a given date (local time bounds)
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Zod validation schema for monthly targets
const monthlyTargetSchema = z.object({
  targetBills: z.number().min(1, 'Target bills must be at least 1'),
  targetSales: z.number().min(1, 'Target sales must be at least 1'),
  workingDays: z.number().min(1, 'Working days must be at least 1').max(31, 'Working days cannot exceed 31').default(26),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2020).optional(),
});

export const submitDailyEntry = async (req, res) => {
  try {
    const { bills, sales, date } = req.body;
    const userId = req.user.id;
    const targetDate = date ? new Date(date) : new Date();

    // Check if an entry already exists for targetDate
    const { start, end } = getDayBounds(targetDate);
    let entry = await DailyEntry.findOne({
      userId,
      date: { $gte: start, $lte: end }
    });

    // Fetch requiredDaily from MonthlyTarget model (Module 05)
    const currentMonth = targetDate.getMonth() + 1;
    const currentYear = targetDate.getFullYear();
    const activeTarget = await MonthlyTarget.findOne({ userId, month: currentMonth, year: currentYear });

    const targetBills = activeTarget ? activeTarget.requiredDaily.bills : 20;
    const targetSales = activeTarget ? activeTarget.requiredDaily.sales : 50000;

    const achievedPct = targetSales > 0 ? (sales / targetSales) * 100 : 0;
    const suggestion = getSuggestionByAchievement(achievedPct);

    if (entry) {
      // Update existing
      entry.bills = bills;
      entry.sales = sales;
      entry.targetBills = targetBills;
      entry.targetSales = targetSales;
      entry.suggestion = suggestion;
      await entry.save();
    } else {
      // Create new
      entry = await DailyEntry.create({
        userId,
        date: start,
        bills,
        sales,
        targetBills,
        targetSales,
        suggestion
      });
    }

    // Module 10: Trigger Notification if Target Hit
    if (achievedPct >= 100) {
      console.log(`[DEBUG] Target hit! achievedPct=${achievedPct}`);
      const notif = await Notification.create({
        userId,
        title: 'Target Achieved! 🎯',
        message: `Congratulations! You've hit ${achievedPct.toFixed(1)}% of your daily sales target today. Great job!`,
        type: 'achievement',
        link: '/dashboard/target/daily'
      });
      console.log(`[DEBUG] Notification created with ID: ${notif._id}`);

      // Send email
      const userDoc = await User.findById(userId);
      if (userDoc) {
        await sendTargetAchievementEmail(userDoc.email, userDoc.businessName || userDoc.username, achievedPct.toFixed(1));
      }

      const io = getChatIo();
      if (io) {
        console.log(`[DEBUG] Socket IO instance found. Active sockets: ${io.sockets.sockets.size}`);
        for (let [id, socket] of io.sockets.sockets) {
          console.log(`[DEBUG] Checking socket ${id}, user: ${socket.user?.id}, looking for: ${userId.toString()}`);
          if (socket.user && socket.user.id === userId.toString()) {
            console.log(`[DEBUG] Match found! Emitting new_notification to ${socket.user.id}`);
            socket.emit('new_notification', notif);
            break;
          }
        }
      } else {
        console.log(`[DEBUG] IO instance is NULL`);
      }
    }

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    console.error('Submit Daily Entry Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getTodayEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const queryDate = req.query.date;
    const targetDate = queryDate ? new Date(queryDate) : new Date();
    const { start, end } = getDayBounds(targetDate);

    const entry = await DailyEntry.findOne({
      userId,
      date: { $gte: start, $lte: end }
    });

    res.status(200).json({ success: true, data: entry || null });
  } catch (error) {
    console.error('Get Today/Daily Entry Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDailyHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const history = await DailyEntry.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Get Daily History Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Module 05: Monthly Target Controllers

export const submitMonthlyTarget = async (req, res) => {
  try {
    const userId = req.user.id;
    const validatedData = monthlyTargetSchema.parse(req.body);

    const today = new Date();
    const month = validatedData.month || (today.getMonth() + 1);
    const year = validatedData.year || today.getFullYear();

    let target = await MonthlyTarget.findOne({ userId, month, year });

    if (target) {
      target.targetBills = validatedData.targetBills;
      target.targetSales = validatedData.targetSales;
      target.workingDays = validatedData.workingDays;
      await target.save();
    } else {
      target = await MonthlyTarget.create({
        userId,
        month,
        year,
        targetBills: validatedData.targetBills,
        targetSales: validatedData.targetSales,
        workingDays: validatedData.workingDays,
      });
    }

    res.status(200).json({ success: true, data: target });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error('Submit Monthly Target Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMonthlyTarget = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const queryMonth = Number(req.params.month) || (today.getMonth() + 1);
    const queryYear = Number(req.query.year) || today.getFullYear();

    const target = await MonthlyTarget.findOne({ userId, month: queryMonth, year: queryYear });
    if (!target) {
      return res.status(200).json({ success: true, data: null });
    }

    const startOfMonth = new Date(queryYear, queryMonth - 1, 1);
    const endOfMonth = new Date(queryYear, queryMonth, 0, 23, 59, 59, 999);
    const totalDays = endOfMonth.getDate();

    // Fetch DailyEntry records for this month
    const entries = await DailyEntry.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    let achievedBills = 0;
    let achievedSales = 0;

    const entriesMap = {};
    entries.forEach(entry => {
      const day = new Date(entry.date).getDate();
      achievedBills += entry.bills;
      achievedSales += entry.sales;
      entriesMap[day] = entry;
    });

    let daysElapsed = 0;
    if (queryYear < today.getFullYear() || (queryYear === today.getFullYear() && queryMonth < (today.getMonth() + 1))) {
      daysElapsed = totalDays;
    } else if (queryYear === today.getFullYear() && queryMonth === (today.getMonth() + 1)) {
      daysElapsed = today.getDate();
    } else {
      daysElapsed = 0;
    }

    const entryCount = entries.length;
    let projectedSales = 0;
    let projectedBills = 0;
    let insufficientDataForProjection = true;

    // Must have at least 3 entries to calculate projection (as per user approval)
    if (entryCount >= 3 && daysElapsed > 0) {
      insufficientDataForProjection = false;
      projectedSales = Math.round((achievedSales / daysElapsed) * totalDays);
      projectedBills = Math.round((achievedBills / daysElapsed) * totalDays);
    }

    // Generate daily comparison data for Recharts Bar Chart
    const dailyComparison = [];
    for (let d = 1; d <= totalDays; d++) {
      const entry = entriesMap[d];
      dailyComparison.push({
        day: d,
        requiredBills: target.requiredDaily.bills,
        requiredSales: target.requiredDaily.sales,
        actualBills: entry ? entry.bills : 0,
        actualSales: entry ? entry.sales : 0
      });
    }

    // Generate projection trend data for Line Chart
    const projectionTrend = [];
    let cumulativeActualSales = 0;
    let cumulativeActualBills = 0;

    const avgDailySales = daysElapsed > 0 ? (achievedSales / daysElapsed) : 0;
    const avgDailyBills = daysElapsed > 0 ? (achievedBills / daysElapsed) : 0;

    for (let d = 1; d <= totalDays; d++) {
      const entry = entriesMap[d];

      if (d <= daysElapsed) {
        cumulativeActualSales += entry ? entry.sales : 0;
        cumulativeActualBills += entry ? entry.bills : 0;
      }

      projectionTrend.push({
        day: d,
        actualSales: d <= daysElapsed ? cumulativeActualSales : null,
        actualBills: d <= daysElapsed ? cumulativeActualBills : null,
        projectedSales: !insufficientDataForProjection ? Math.round(avgDailySales * d) : null,
        projectedBills: !insufficientDataForProjection ? Math.round(avgDailyBills * d) : null,
        targetSalesBaseline: Math.round((target.targetSales / totalDays) * d),
        targetBillsBaseline: Math.round((target.targetBills / totalDays) * d)
      });
    }

    res.status(200).json({
      success: true,
      data: {
        target,
        achievedBills,
        achievedSales,
        projectedSales,
        projectedBills,
        insufficientDataForProjection,
        dailyComparison,
        projectionTrend
      }
    });

  } catch (error) {
    console.error('Get Monthly Target Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllMonthlyTargets = async (req, res) => {
  try {
    const userId = req.user.id;
    const targets = await MonthlyTarget.find({ userId }).sort({ year: -1, month: -1 });
    res.status(200).json({ success: true, data: targets });
  } catch (error) {
    console.error('Get All Monthly Targets Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

