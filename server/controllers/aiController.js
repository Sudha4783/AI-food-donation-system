import asyncHandler from 'express-async-handler';
import { predictFoodQuality, recommendDonations } from '../services/aiService.js';
import Donation from '../models/Donation.js';
import { sendSuccess } from '../utils/responseHandler.js';

// ─── PREDICT FOOD QUALITY ─────────────────────────────────────────────────────
// POST /api/ai/predict-quality
export const predictQuality = asyncHandler(async (req, res) => {
  const { foodType, expiryDate, preparedDate, storageTemp, packaging, servingSize } = req.body;

  if (!foodType || !expiryDate) {
    res.status(400);
    throw new Error('foodType and expiryDate are required');
  }

  const result = predictFoodQuality({
    foodType, expiryDate, preparedDate, storageTemp, packaging, servingSize,
  });

  sendSuccess(res, 200, 'Food quality prediction complete', { prediction: result });
});

// ─── SAVE QUALITY TO DONATION ─────────────────────────────────────────────────
// POST /api/ai/analyze-donation/:id
export const analyzeDonation = asyncHandler(async (req, res) => {
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
    throw new Error('Not authorized to analyze this donation');
  }

  const result = predictFoodQuality({
    foodType: donation.foodType,
    expiryDate: donation.expiryDate,
    preparedDate: donation.preparedDate,
    storageTemp: donation.storageTemp,
    packaging: donation.packaging,
    servingSize: donation.servingSize,
  });

  // Persist AI result to donation record
  donation.aiQualityScore = {
    score: result.score,
    label: result.label,
    recommendation: result.recommendation,
    analyzedAt: new Date(),
  };
  await donation.save();

  sendSuccess(res, 200, 'Donation analyzed and quality score saved', {
    prediction: result,
    donationId: donation._id,
  });
});

// ─── GET RECOMMENDATIONS FOR NGO ─────────────────────────────────────────────
// POST /api/ai/recommend
export const getRecommendations = asyncHandler(async (req, res) => {
  const { preferredCategories, city, urgencyPreference, limit = 10 } = req.body;

  // Fetch available donations
  const filter = { status: 'available' };
  if (city) filter['location.city'] = { $regex: city, $options: 'i' };

  const donations = await Donation.find(filter)
    .populate('donor', 'name organization address')
    .limit(100); // Fetch max 100 to rank from

  if (donations.length === 0) {
    return sendSuccess(res, 200, 'No available donations found', { recommendations: [] });
  }

  const ranked = recommendDonations(donations, {
    preferredCategories: preferredCategories || [],
    city: city || '',
    urgencyPreference: urgencyPreference || false,
  });

  sendSuccess(res, 200, 'Recommendations generated', {
    recommendations: ranked.slice(0, limit),
    totalAvailable: donations.length,
  });
});
