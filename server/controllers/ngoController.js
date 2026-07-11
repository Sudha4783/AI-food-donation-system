import asyncHandler from 'express-async-handler';
import Claim from '../models/Claim.js';
import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';
import { sendSuccess, sendPaginated } from '../utils/responseHandler.js';

// ─── GET NGO's CLAIMS ────────────────────────────────────────────────────────
// GET /api/ngo/claims
export const getNGOClaims = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { ngo: req.user._id };
  if (status) filter.status = status;

  const total = await Claim.countDocuments(filter);
  const claims = await Claim.find(filter)
    .populate({
      path: 'donation',
      populate: { path: 'donor', select: 'name email phone organization address' },
    })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  sendPaginated(res, claims, total, page, limit);
});

// ─── UPDATE CLAIM STATUS (NGO marks pickup/delivery) ─────────────────────────
// PATCH /api/ngo/claims/:id/status
export const updateClaimStatus = asyncHandler(async (req, res) => {
  const { status, peopleServed, notes } = req.body;
  const claim = await Claim.findById(req.params.id).populate('donation');

  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }

  if (claim.ngo.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this claim');
  }

  const validTransitions = {
    pending: ['approved', 'cancelled'],
    approved: ['picked_up', 'cancelled'],
    picked_up: ['delivered'],
  };

  if (!validTransitions[claim.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Cannot transition from "${claim.status}" to "${status}"`);
  }

  claim.status = status;
  if (status === 'picked_up') claim.pickedUpAt = new Date();
  if (status === 'delivered') {
    claim.deliveredAt = new Date();
    claim.peopleServed = peopleServed;
  }
  if (notes) claim.notes = notes;
  await claim.save();

  // Sync donation status
  const donationStatusMap = {
    approved: 'claimed',
    picked_up: 'picked_up',
    delivered: 'delivered',
    cancelled: 'available',
  };
  if (donationStatusMap[status]) {
    await Donation.findByIdAndUpdate(claim.donation._id, {
      status: donationStatusMap[status],
      ...(status === 'cancelled' ? { claimedBy: null, claimedAt: null } : {}),
    });
  }

  // Notify donor
  const notifMessages = {
    picked_up: { title: 'Donation Picked Up', msg: `Your donation "${claim.donation.title}" has been picked up!` },
    delivered: { title: 'Donation Delivered! 🎉', msg: `Your donation "${claim.donation.title}" was delivered and fed ${peopleServed || 'many'} people.` },
    cancelled: { title: 'Claim Cancelled', msg: `The claim on your donation "${claim.donation.title}" was cancelled. It's available again.` },
  };

  if (notifMessages[status]) {
    await Notification.create({
      recipient: claim.donation.donor,
      type: status === 'picked_up' ? 'donation_picked_up' : status === 'delivered' ? 'donation_delivered' : 'claim_cancelled',
      title: notifMessages[status].title,
      message: notifMessages[status].msg,
      relatedDonation: claim.donation._id,
      relatedClaim: claim._id,
    });
  }

  sendSuccess(res, 200, `Claim status updated to "${status}"`, { claim });
});

// ─── GET NGO STATS ────────────────────────────────────────────────────────────
// GET /api/ngo/stats
export const getNGOStats = asyncHandler(async (req, res) => {
  const ngoId = req.user._id;

  const [total, pending, pickedUp, delivered, cancelled] = await Promise.all([
    Claim.countDocuments({ ngo: ngoId }),
    Claim.countDocuments({ ngo: ngoId, status: { $in: ['pending', 'approved'] } }),
    Claim.countDocuments({ ngo: ngoId, status: 'picked_up' }),
    Claim.countDocuments({ ngo: ngoId, status: 'delivered' }),
    Claim.countDocuments({ ngo: ngoId, status: 'cancelled' }),
  ]);

  // Total people served
  const servedAgg = await Claim.aggregate([
    { $match: { ngo: ngoId, status: 'delivered', peopleServed: { $exists: true } } },
    { $group: { _id: null, total: { $sum: '$peopleServed' } } },
  ]);
  const totalPeopleServed = servedAgg[0]?.total || 0;

  const recentClaims = await Claim.find({ ngo: ngoId })
    .sort('-createdAt')
    .limit(5)
    .populate('donation', 'title foodType location status');

  sendSuccess(res, 200, 'NGO stats fetched', {
    stats: { total, pending, pickedUp, delivered, cancelled, totalPeopleServed },
    recentClaims,
  });
});

// ─── CANCEL CLAIM ─────────────────────────────────────────────────────────────
// DELETE /api/ngo/claims/:id
export const cancelClaim = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const claim = await Claim.findById(req.params.id).populate('donation');

  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }

  if (claim.ngo.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (['delivered', 'cancelled'].includes(claim.status)) {
    res.status(400);
    throw new Error('This claim cannot be cancelled');
  }

  claim.status = 'cancelled';
  claim.cancelReason = reason;
  await claim.save();

  // Make donation available again
  await Donation.findByIdAndUpdate(claim.donation._id, {
    status: 'available',
    claimedBy: null,
    claimedAt: null,
  });

  sendSuccess(res, 200, 'Claim cancelled successfully');
});
