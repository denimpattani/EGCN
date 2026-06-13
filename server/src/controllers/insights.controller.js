import DailyEntry from '../models/DailyEntry.model.js';
import MonthlyTarget from '../models/MonthlyTarget.model.js';
import User from '../models/User.model.js';

// Get start and end of a given date (local time bounds)
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// GET /api/insights/daily
export const getDailyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateParam = req.query.date;
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const { start, end } = getDayBounds(targetDate);

    // Fetch daily entry for the user
    const entry = await DailyEntry.findOne({
      userId,
      date: { $gte: start, $lte: end }
    });

    // Fetch active MonthlyTarget daily expectations
    const currentMonth = targetDate.getMonth() + 1;
    const currentYear = targetDate.getFullYear();
    const activeTarget = await MonthlyTarget.findOne({ userId, month: currentMonth, year: currentYear });

    const targetBills = activeTarget ? activeTarget.requiredDaily.bills : 20;
    const targetSales = activeTarget ? activeTarget.requiredDaily.sales : 50000;

    res.status(200).json({
      success: true,
      data: {
        date: targetDate,
        entry: entry || null,
        targetSales,
        targetBills,
        achievedPct: entry ? entry.achievedPct : 0,
        suggestion: entry?.suggestion || "No daily performance logged for this date yet."
      }
    });
  } catch (error) {
    console.error('Get Daily Report Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/insights/monthly/:month
export const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const queryMonth = Number(req.params.month);
    const today = new Date();
    const queryYear = Number(req.query.year) || today.getFullYear();

    if (!queryMonth || queryMonth < 1 || queryMonth > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month specified' });
    }

    const startOfMonth = new Date(queryYear, queryMonth - 1, 1);
    const endOfMonth = new Date(queryYear, queryMonth, 0, 23, 59, 59, 999);
    const totalDays = endOfMonth.getDate();

    // Fetch MonthlyTarget settings
    const target = await MonthlyTarget.findOne({ userId, month: queryMonth, year: queryYear });

    // Fetch DailyEntry records for the month
    const entries = await DailyEntry.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    let totalSales = 0;
    let totalBills = 0;
    const dailyMap = {};

    entries.forEach(entry => {
      const day = new Date(entry.date).getDate();
      totalSales += entry.sales;
      totalBills += entry.bills;
      dailyMap[day] = entry;
    });

    const targetSales = target ? target.targetSales : 0;
    const targetBills = target ? target.targetBills : 0;
    const workingDays = target ? target.workingDays : 26;

    const salesProgressPct = targetSales > 0 ? Math.min(100, Math.round((totalSales / targetSales) * 100)) : 0;
    const billsProgressPct = targetBills > 0 ? Math.min(100, Math.round((totalBills / targetBills) * 100)) : 0;

    let daysElapsed = 0;
    if (queryYear < today.getFullYear() || (queryYear === today.getFullYear() && queryMonth < (today.getMonth() + 1))) {
      daysElapsed = totalDays;
    } else if (queryYear === today.getFullYear() && queryMonth === (today.getMonth() + 1)) {
      daysElapsed = today.getDate();
    } else {
      daysElapsed = 0;
    }

    const averageDailySales = daysElapsed > 0 ? Math.round(totalSales / daysElapsed) : 0;
    const averageDailyBills = daysElapsed > 0 ? Number((totalBills / daysElapsed).toFixed(1)) : 0;

    // Daily listing array for charts
    const dailyListings = [];
    for (let d = 1; d <= totalDays; d++) {
      const entry = dailyMap[d];
      dailyListings.push({
        day: d,
        actualSales: entry ? entry.sales : 0,
        actualBills: entry ? entry.bills : 0,
        requiredSales: target ? target.requiredDaily.sales : 50000,
        requiredBills: target ? target.requiredDaily.bills : 20,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        month: queryMonth,
        year: queryYear,
        target: target || null,
        totalSales,
        totalBills,
        targetSales,
        targetBills,
        workingDays,
        salesProgressPct,
        billsProgressPct,
        averageDailySales,
        averageDailyBills,
        daysElapsed,
        dailyListings
      }
    });
  } catch (error) {
    console.error('Get Monthly Report Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/insights/annual/:year
export const getAnnualReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const queryYear = Number(req.params.year) || new Date().getFullYear();

    const startOfYear = new Date(queryYear, 0, 1);
    const endOfYear = new Date(queryYear, 11, 31, 23, 59, 59, 999);

    // Fetch User Profile to get turnover baseline (businessScale)
    const user = await User.findById(userId);
    const turnoverBaseline = user ? user.businessScale : 'N/A';

    // Fetch all targets for this year
    const targets = await MonthlyTarget.find({ userId, year: queryYear });
    
    // Fetch all entries for this year
    const entries = await DailyEntry.find({
      userId,
      date: { $gte: startOfYear, $lte: endOfYear }
    });

    // Group actual performance and targets by month (1 to 12)
    const monthlySummary = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month,
        monthName: monthNames[i],
        actualSales: 0,
        actualBills: 0,
        targetSales: 0,
        targetBills: 0,
      };
    });

    entries.forEach(entry => {
      const monthIdx = new Date(entry.date).getMonth();
      monthlySummary[monthIdx].actualSales += entry.sales;
      monthlySummary[monthIdx].actualBills += entry.bills;
    });

    targets.forEach(target => {
      const monthIdx = target.month - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        monthlySummary[monthIdx].targetSales = target.targetSales;
        monthlySummary[monthIdx].targetBills = target.targetBills;
      }
    });

    let totalAnnualSales = 0;
    let totalAnnualBills = 0;
    let targetAnnualSales = 0;
    let targetAnnualBills = 0;

    let bestMonth = null;
    let worstMonth = null;

    monthlySummary.forEach(m => {
      totalAnnualSales += m.actualSales;
      totalAnnualBills += m.actualBills;
      targetAnnualSales += m.targetSales;
      targetAnnualBills += m.targetBills;

      // Achieved Sales Percentage per month
      m.achievedSalesPct = m.targetSales > 0 ? Math.min(100, Math.round((m.actualSales / m.targetSales) * 100)) : 0;

      // Best and worst month calculation based on actual sales > 0
      if (m.actualSales > 0) {
        if (!bestMonth || m.actualSales > bestMonth.actualSales) {
          bestMonth = { month: m.month, monthName: m.monthName, actualSales: m.actualSales };
        }
        if (!worstMonth || m.actualSales < worstMonth.actualSales) {
          worstMonth = { month: m.month, monthName: m.monthName, actualSales: m.actualSales };
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        year: queryYear,
        turnoverBaseline,
        totalAnnualSales,
        totalAnnualBills,
        targetAnnualSales,
        targetAnnualBills,
        bestMonth: bestMonth || { monthName: 'N/A', actualSales: 0 },
        worstMonth: worstMonth || { monthName: 'N/A', actualSales: 0 },
        months: monthlySummary
      }
    });
  } catch (error) {
    console.error('Get Annual Report Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
