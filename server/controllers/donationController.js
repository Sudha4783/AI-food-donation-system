import asyncHandler from 'express-async-handler';
import Donation from '../models/Donation.js';
import Claim from '../models/Claim.js';
import Notification from '../models/Notification.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/responseHandler.js';

// ─── CREATE DONATION ─────────────────────────────────────────────────────────
// POST /api/donations
export const createDonation = asyncHandler(async (req, res) => {
  const {
    title, description, foodType, quantity, expiryDate,
    preparedDate, storageTemp, packaging, location,
    isUrgent, servingSize, allergens, notes,
  } = req.body;

  const donation = await Donation.create({
    donor: req.user._id,
    title, description, foodType, quantity, expiryDate,
    preparedDate, storageTemp, packaging, location,
    isUrgent, servingSize, allergens, notes,
  });

  // Notify all NGOs (in production, you'd query and notify NGOs in the same city)
  // For now just create the record
  await Notification.create({
    recipient: req.user._id,
    type: 'donation_created',
    title: 'Donation Listed Successfully',
    message: `Your donation "${title}" is now live and visible to NGOs.`,
    relatedDonation: donation._id,
  });

  sendSuccess(res, 201, 'Donation created successfully', { donation });
});

// ─── GET ALL DONATIONS ────────────────────────────────────────────────────────
// GET /api/donations
export const getDonations = asyncHandler(async (req, res) => {
  const {
    status, foodType, city, isUrgent,
    page = 1, limit = 10, sort = '-createdAt',
  } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (foodType) filter.foodType = foodType;
  if (city) filter['location.city'] = { $regex: city, $options: 'i' };
  if (isUrgent === 'true') filter.isUrgent = true;

  // Donors see only their own donations
  if (req.user.role === 'donor') {
    filter.donor = req.user._id;
  }

  const total = await Donation.countDocuments(filter);
  const donations = await Donation.find(filter)
    .populate('donor', 'name email organization address')
    .populate('claimedBy', 'name organization')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  sendPaginated(res, donations, total, page, limit);
});

// ─── GET SINGLE DONATION ──────────────────────────────────────────────────────
// GET /api/donations/:id
export const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate('donor', 'name email phone organization address')
    .populate('claimedBy', 'name email organization phone');

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  sendSuccess(res, 200, 'Donation fetched', { donation });
});

// ─── UPDATE DONATION STATUS ───────────────────────────────────────────────────
// PATCH /api/donations/:id/status
export const updateDonationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  // Only the donor or admin can update status (NGOs use the claim flow)
  if (
    donation.donor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to update this donation');
  }

  donation.status = status;
  await donation.save();

  sendSuccess(res, 200, 'Donation status updated', { donation });
});

// ─── DELETE DONATION ──────────────────────────────────────────────────────────
// DELETE /api/donations/:id
export const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  if (
    donation.donor.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this donation');
  }

  if (donation.status === 'claimed' || donation.status === 'picked_up') {
    res.status(400);
    throw new Error('Cannot delete a donation that has already been claimed or picked up');
  }

  await donation.deleteOne();
  sendSuccess(res, 200, 'Donation deleted successfully');
});

// ─── CLAIM DONATION (NGO) ─────────────────────────────────────────────────────
// POST /api/donations/:id/claim
export const claimDonation = asyncHandler(async (req, res) => {
  const { pickupScheduled, notes } = req.body;
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  if (donation.status !== 'available') {
    res.status(400);
    throw new Error(`This donation is not available (current status: ${donation.status})`);
  }

  // Check NGO hasn't already claimed it
  const existingClaim = await Claim.findOne({
    donation: donation._id,
    ngo: req.user._id,
  });
  if (existingClaim) {
    res.status(400);
    throw new Error('You have already claimed this donation');
  }

  // Create the claim
  const claim = await Claim.create({
    donation: donation._id,
    ngo: req.user._id,
    pickupScheduled,
    notes,
  });

  // Update donation status
  donation.status = 'claimed';
  donation.claimedBy = req.user._id;
  donation.claimedAt = new Date();
  await donation.save();

  // Notify donor
  await Notification.create({
    recipient: donation.donor,
    type: 'donation_claimed',
    title: 'Your Donation Was Claimed!',
    message: `${req.user.name} (${req.user.organization || 'NGO'}) has claimed your donation "${donation.title}".`,
    relatedDonation: donation._id,
    relatedClaim: claim._id,
  });

  sendSuccess(res, 201, 'Donation claimed successfully', { claim });
});

// ─── GET DONOR STATS ──────────────────────────────────────────────────────────
// GET /api/donations/my-stats
export const getDonorStats = asyncHandler(async (req, res) => {
  const donorId = req.user._id;

  const [total, active, claimed, delivered, expired] = await Promise.all([
    Donation.countDocuments({ donor: donorId }),
    Donation.countDocuments({ donor: donorId, status: 'available' }),
    Donation.countDocuments({ donor: donorId, status: { $in: ['claimed', 'picked_up'] } }),
    Donation.countDocuments({ donor: donorId, status: 'delivered' }),
    Donation.countDocuments({ donor: donorId, status: 'expired' }),
  ]);

  const recent = await Donation.find({ donor: donorId })
    .sort('-createdAt')
    .limit(5)
    .populate('claimedBy', 'name organization');

  sendSuccess(res, 200, 'Donor stats fetched', {
    stats: { total, active, claimed, delivered, expired },
    recentDonations: recent,
  });
});
