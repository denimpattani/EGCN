import nodemailer from 'nodemailer';
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getDailyReminderEmailTemplate,
  getTargetAchievementEmailTemplate,
  getPlanExpiryEmailTemplate,
  getMeetingReminderEmailTemplate,
  getExpertAssignedEmailTemplate,
  getPlanUpgradeEmailTemplate,
  getMeetingScheduledEmailTemplate,
  getExpertChangedEmailTemplate,
} from '../templates/emails/index.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'egcnetworkofficial@gmail.com',
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000, // 5 seconds max wait to prevent hanging
  greetingTimeout: 5000,
});

export const sendVerificationEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: 'EGCN - Verify Your Email',
    html: getVerificationEmailTemplate(otp),
  };

  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Email to:', toEmail, '| OTP:', otp);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error (Render Free Tier blocks SMTP):', error.message);
    console.log(`\n=========================================\n🚨 EMERGENCY OTP FOR ${toEmail}: ${otp}\n=========================================\n`);
    return false;
  }
};

export const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: 'EGCN - Password Reset',
    html: getPasswordResetEmailTemplate(resetUrl),
  };

  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Reset Email to:', toEmail, '| Link:', resetUrl);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};

export const sendDailyReminderEmail = async (toEmail, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: 'EGCN - Daily Target Reminder',
    html: getDailyReminderEmailTemplate(name, process.env.FRONTEND_URL || 'http://localhost:5173' + '/dashboard/target/daily'),
  };
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Daily Reminder Email to:', toEmail);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};

export const sendTargetAchievementEmail = async (toEmail, name, percentage) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: '🎉 Amazing Progress! You hit a milestone!',
    html: getTargetAchievementEmailTemplate(name, percentage),
  };
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Achievement Email to:', toEmail);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};

export const sendPlanExpiryEmail = async (toEmail, name, daysLeft) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: 'Action Required: Your EGCN Plan is Expiring Soon',
    html: getPlanExpiryEmailTemplate(name, daysLeft, process.env.FRONTEND_URL || 'http://localhost:5173' + '/dashboard/plans'),
  };
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Plan Expiry Email to:', toEmail);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};

export const sendMeetingReminderEmail = async (toEmail, name, meetingTitle, timeString, joinLink) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: `Upcoming Meeting Reminder: ${meetingTitle}`,
    html: getMeetingReminderEmailTemplate(name, meetingTitle, timeString, joinLink || (process.env.FRONTEND_URL || 'http://localhost:5173') + '/dashboard/workspace'),
  };
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Meeting Reminder Email to:', toEmail);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};

export const sendExpertAssignedEmail = async (toEmail, clientName, expertName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: 'An Expert has been assigned to you!',
    html: getExpertAssignedEmailTemplate(clientName, expertName, process.env.FRONTEND_URL || 'http://localhost:5173' + '/dashboard/workspace'),
  };
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Expert Assigned Email to:', toEmail);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};

export const sendPlanUpgradeEmail = async (toEmail, name, planName, price) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: 'Welcome to your new EGCN Plan!',
    html: getPlanUpgradeEmailTemplate(name, planName, price, process.env.FRONTEND_URL || 'http://localhost:5173' + '/dashboard'),
  };
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Plan Upgrade Email to:', toEmail);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};

export const sendMeetingScheduledEmail = async (toEmail, clientName, expertName, meetingTitle, timeString) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: 'New Meeting Scheduled!',
    html: getMeetingScheduledEmailTemplate(clientName, expertName, meetingTitle, timeString, process.env.FRONTEND_URL || 'http://localhost:5173' + '/dashboard/workspace'),
  };
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Meeting Scheduled Email to:', toEmail);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};

export const sendExpertChangedEmail = async (toEmail, clientName, expertName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"EGCN Support" <support@egcn.in>',
    to: toEmail,
    subject: 'Update: New Expert Advisor Assigned',
    html: getExpertChangedEmailTemplate(clientName, expertName, process.env.FRONTEND_URL || 'http://localhost:5173' + '/dashboard/workspace'),
  };
  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASS) {
      console.log('📧 [DEV MODE] Sending Mock Expert Changed Email to:', toEmail);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email Send Error:', error);
    return false;
  }
};
