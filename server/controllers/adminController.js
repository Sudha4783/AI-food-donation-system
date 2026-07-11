import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Claim from '../models/Claim.js';
import Notification from '../models/Notification.js';
import { sendSuccess, sendPaginated } from '../utils/responseHandler.js';

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
// GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isBanned, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  sendPaginated(res, users, total, page, limit);
});

// ─── UPDATE USER ROLE / BAN ───────────────────────────────────────────────────
// PATCH /api/admin/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const { role, isBanned, isActive } = req.body;

  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot modify your own admin account');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(isBanned !== undefined && { isBanned }), ...(isActive !== undefined && { isActive }) },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (isBanned) {
    await Notification.create({
      recipient: user._id,
      type: 'user_banned',
      title: 'Account Suspended',
      message: 'Your account has been suspended by an administrator. Please contact support.',
    });
  }

  sendSuccess(res, 200, 'User updated successfully', { user });
});

// ─── DELETE USER ──────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Cannot delete an admin account');
  }
  await user.deleteOne();
  sendSuccess(res, 200, 'User deleted successfully');
});

// ─── ADMIN PLATFORM STATS ─────────────────────────────────────────────────────
// GET /api/admin/stats
export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalDonors, totalNGOs, totalVolunteers,
    totalDonations, activeDonations, deliveredDonations,
    totalClaims, pendingClaims,
  ] = await Promise.all([
    User.countDocuments({ isBanned: false }),
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'ngo' }),
    User.countDocuments({ role: 'volunteer' }),
    Donation.countDocuments(),
    Donation.countDocuments({ status: 'available' }),
    Donation.countDocuments({ status: 'delivered' }),
    Claim.countDocuments(),
    Claim.countDocuments({ status: { $in: ['pending', 'approved'] } }),
  ]);

  // Total people served
  const servedAgg = await Claim.aggregate([
    { $match: { status: 'delivered', peopleServed: { $exists: true } } },
    { $group: { _id: null, total: { $sum: '$peopleServed' } } },
  ]);
  const totalPeopleServed = servedAgg[0]?.total || 0;

  // Last 7 days donations
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentDonations = await Donation.find({ createdAt: { $gte: sevenDaysAgo } })
    .populate('donor', 'name')
    .sort('-createdAt')
    .limit(10);

  // Donations per food type
  const donationsByType = await Donation.aggregate([
    { $group: { _id: '$foodType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Monthly trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyTrend = await Donation.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  sendSuccess(res, 200, 'Admin stats fetched', {
    overview: {
      totalUsers, totalDonors, totalNGOs, totalVolunteers,
      totalDonations, activeDonations, deliveredDonations,
      totalClaims, pendingClaims, totalPeopleServed,
    },
    recentDonations,
    donationsByType,
    monthlyTrend,
  });
});

// ─── GET ALL DONATIONS (admin view) ──────────────────────────────────────────
// GET /api/admin/donations
export const getAllDonationsAdmin = asyncHandler(async (req, res) => {
  const { status, foodType, city, page = 1, limit = 15 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (foodType) filter.foodType = foodType;
  if (city) filter['location.city'] = { $regex: city, $options: 'i' };

  const total = await Donation.countDocuments(filter);
  const donations = await Donation.find(filter)
    .populate('donor', 'name email organization')
    .populate('claimedBy', 'name organization')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  sendPaginated(res, donations, total, page, limit);
});
