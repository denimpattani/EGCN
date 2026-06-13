import cron from 'node-cron';
import User from '../models/User.model.js';
import DailyEntry from '../models/DailyEntry.model.js';
import Meeting from '../models/Meeting.model.js';
import Notification from '../models/Notification.model.js';
import { sendDailyReminderEmail, sendMeetingReminderEmail, sendPlanExpiryEmail } from '../utils/email.js';

export const initCrons = (io) => {
  // 1. Daily Entry Reminder (Run every day at 18:00 IST)
  // node-cron runs in system timezone, so we configure timezone explicitly
  cron.schedule('0 18 * * *', async () => {
    console.log('⏰ Running Daily Entry Reminder Cron...');
    try {
      // Find all client users
      const clients = await User.find({ role: 'client' });
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const client of clients) {
        // Check if they have an entry for today
        const entry = await DailyEntry.findOne({
          userId: client._id,
          date: { $gte: today }
        });

        if (!entry) {
          // Send Email
          await sendDailyReminderEmail(client.email, client.businessName || client.username);

          // Create In-App Notification
          const notification = await Notification.create({
            userId: client._id,
            title: 'Daily Entry Missing',
            message: 'Don\'t forget to log your sales and bills for today!',
            type: 'reminder',
            link: '/dashboard/target/daily'
          });

          // Emit Socket Event
          if (io) {
            io.to(client._id.toString()).emit('new_notification', notification);
          }
        }
      }
    } catch (error) {
      console.error('Error in Daily Entry Cron:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // 2. Meeting Reminder (Run every 15 minutes)
  cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Running Meeting Reminder Cron...');
    try {
      const now = new Date();
      // Look for meetings between 45 mins and 60 mins from now
      const startTime = new Date(now.getTime() + 45 * 60000);
      const endTime = new Date(now.getTime() + 60 * 60000);

      const upcomingMeetings = await Meeting.find({
        status: 'scheduled',
        scheduledAt: { $gte: startTime, $lt: endTime }
      }).populate('clientId expertId');

      for (const meeting of upcomingMeetings) {
        // Prepare data
        const timeString = meeting.scheduledAt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
        const client = meeting.clientId;
        const expert = meeting.expertId; // Note: expertId ref might be to Expert model, or User model if experts are users. Assume User based on typical structure.

        // Let's assume expert uses the Expert model if populated, which might have different fields, but if it has email/username it works.
        const clientEmail = client.email;
        const clientName = client.businessName || client.username;
        const expertEmail = expert.email;
        const expertName = expert.name || expert.username || 'Expert';

        // Notify Client
        if (clientEmail) {
          await sendMeetingReminderEmail(clientEmail, clientName, meeting.title, timeString, meeting.meetingLink);
          const notif = await Notification.create({
            userId: client._id,
            title: 'Upcoming Meeting',
            message: `Your meeting "${meeting.title}" starts in 1 hour at ${timeString}.`,
            type: 'meeting',
            link: '/dashboard/workspace'
          });
          if (io) io.to(client._id.toString()).emit('new_notification', notif);
        }

        // Notify Expert
        if (expertEmail) {
          await sendMeetingReminderEmail(expertEmail, expertName, meeting.title, timeString, meeting.meetingLink);
          const notif = await Notification.create({
            userId: expert._id,
            title: 'Upcoming Meeting',
            message: `Your meeting "${meeting.title}" with ${clientName} starts in 1 hour at ${timeString}.`,
            type: 'meeting',
            link: '/dashboard/expert-calendar'
          });
          if (io) io.to(expert._id.toString()).emit('new_notification', notif);
        }
      }
    } catch (error) {
      console.error('Error in Meeting Reminder Cron:', error);
    }
  });

  // 3. Plan Expiry Warning (Run every day at midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running Plan Expiry Cron...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const eightDaysFromNow = new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000);

      const expiringUsers = await User.find({
        plan: { $ne: 'free' },
        planExpiry: { $gte: sevenDaysFromNow, $lt: eightDaysFromNow }
      });

      for (const user of expiringUsers) {
        await sendPlanExpiryEmail(user.email, user.businessName || user.username, 7);

        const notification = await Notification.create({
          userId: user._id,
          title: 'Plan Expiring Soon',
          message: 'Your EGCN plan will expire in 7 days. Renew now to avoid losing access.',
          type: 'plan_expiry',
          link: '/dashboard/plans'
        });

        if (io) {
          io.to(user._id.toString()).emit('new_notification', notification);
        }
      }
    } catch (error) {
      console.error('Error in Plan Expiry Cron:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
};
