import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.model.js';
import redis from '../utils/redis.js';
import { signupSchema, signinSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret', {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    { expiresIn: '12h' }
  );

  return { accessToken, refreshToken };
};

export const signup = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    let baseUsername = validatedData.email.split('@')[0];
    let username = baseUsername;

    // Simple deduplication for username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newUser = await User.create({
      ...validatedData,
      username,
      password: hashedPassword,
    });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis (expires in 10 minutes)
    await redis.setex(`egcn:otp:${newUser.email}`, 600, otp);

    // Send Email
    await sendVerificationEmail(newUser.email, otp);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email to continue.',
      email: newUser.email,
      username: newUser.username
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error('Signup Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = verifyEmailSchema.parse(req.body);

    const cachedOtp = await redis.get(`egcn:otp:${email}`);
    if (!cachedOtp || cachedOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;

    // Generate Tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Save refresh token to user
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    // Delete OTP
    await redis.del(`egcn:otp:${email}`);

    // Set new refresh token in HttpOnly cookie (12 hours)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        businessName: user.businessName,
        businessType: user.businessType,
        businessScale: user.businessScale,
        address: user.address,
        city: user.city,
        state: user.state,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        planExpiry: user.planExpiry
      }
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error('Verify Email Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

    // email could be an actual email or a username
    const user = await User.findOne({
      $or: [
        { email: email },
        { username: email }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first', requiresVerification: true });
    }

    // Generate Tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        businessName: user.businessName,
        businessType: user.businessType,
        businessScale: user.businessScale,
        address: user.address,
        city: user.city,
        state: user.state,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        planExpiry: user.planExpiry
      }
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error('Signin Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // Check if token is blacklisted in Redis
    const isBlacklisted = await redis.get(`egcn:bl_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Token blacklisted. Please log in again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret');
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || !user.refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Invalidate old refresh token
    await redis.setex(`egcn:bl_${token}`, 7 * 24 * 60 * 60, 'true');

    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken
    });

  } catch (error) {
    console.error('Refresh Token Error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await redis.setex(`egcn:bl_${token}`, 7 * 24 * 60 * 60, 'true');

      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
      }
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Error sending email' });
    }

    res.status(200).json({ success: true, message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    if (error.errors) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.errors) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        businessScale: user.businessScale,
        address: user.address,
        city: user.city,
        state: user.state,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        planExpiry: user.planExpiry
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
