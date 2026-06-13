import DailyEntry from '../models/DailyEntry.model.js';
import User from '../models/User.model.js';
import Advice from '../models/Advice.model.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user to get active plan
    const user = await User.findById(userId);
    
    // Aggregate overall stats (sum of all bills and sales)
    const overallAggregation = await DailyEntry.aggregate([
      { $match: { userId: user._id } },
      { 
        $group: {
          _id: null,
          totalBills: { $sum: "$bills" },
          totalSales: { $sum: "$sales" }
        }
      }
    ]);

    const overall = {
      totalBills: overallAggregation[0]?.totalBills || 0,
      totalSales: overallAggregation[0]?.totalSales || 0,
      activePlan: user?.plan || 'free'
    };

    // Fetch today's entry
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const todayEntry = await DailyEntry.findOne({
      userId,
      date: { $gte: start, $lte: end }
    });

    const daily = {
      todayBills: todayEntry?.bills || 0,
      todaySales: todayEntry?.sales || 0,
      targetAchievedPercent: todayEntry?.achievedPct || 0
    };

    // Fetch recent entries with suggestions (last 5)
    const recentEntries = await DailyEntry.find({
      userId,
      suggestion: { $ne: null }
    })
    .sort({ date: -1 })
    .limit(5);

    const recentSuggestions = recentEntries.map(e => ({
      id: e._id,
      date: e.date,
      sales: e.sales,
      targetSales: e.targetSales,
      achievedPct: e.achievedPct,
      suggestion: e.suggestion
    }));

    // Fetch B2B custom advices posted by assigned expert
    const expertAdvices = await Advice.find({ userId: user._id })
      .populate('expertId', 'fullName expertise')
      .sort({ createdAt: -1 })
      .limit(5);

    const adviceFeed = expertAdvices.map(a => ({
      id: a._id,
      expertName: a.expertId?.fullName || 'Assigned Expert',
      expertise: a.expertId?.expertise || 'Growth Advisor',
      message: a.message,
      createdAt: a.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        overall,
        daily,
        recentSuggestions,
        adviceFeed
      }
    });

  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
