import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendSuccess } from '../utils/responseHandler.js';

// ─── REGISTER ────────────────────────────────────────────────────────────────
// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  // Validate request fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { name, email, password, role, phone, organization, address } = req.body;

  // Block direct admin creation via API
  if (role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be created via registration');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'donor',
    phone,
    organization,
    address,
  });

  const token = generateToken(user._id);

  sendSuccess(res, 201, 'Registration successful', {
    user: user.toSafeObject(),
    token,
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { email, password } = req.body;

  // Find user WITH password (select: false on schema)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error('Your account has been banned. Contact support.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  sendSuccess(res, 200, 'Login successful', {
    user: user.toSafeObject(),
    token,
  });
});

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, 200, 'User profile fetched', { user });
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
// PUT /api/auth/update-profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, organization, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, organization, address },
    { new: true, runValidators: true }
  );

  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
// PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully');
});
