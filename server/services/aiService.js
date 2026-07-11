/**
 * ─────────────────────────────────────────────────────────────────
 *  AI SERVICE — Food Donation Intelligence Engine
 *  No external API required — self-contained heuristic algorithms
 * ─────────────────────────────────────────────────────────────────
 *
 *  1. predictFoodQuality()  — Score food safety & freshness (0–100)
 *  2. recommendDonations()  — Rank available donations for an NGO
 * ─────────────────────────────────────────────────────────────────
 */

// ─── QUALITY PREDICTOR ────────────────────────────────────────────────────────

/**
 * Base freshness scores by food type (how quickly they degrade)
 */
const FOOD_TYPE_BASE_SCORE = {
  cooked_meal: 70,
  raw_vegetables: 80,
  fruits: 78,
  packaged_food: 92,
  dairy: 72,
  bakery: 75,
  beverages: 88,
  grains_pulses: 95,
  snacks: 90,
  other: 75,
};

/**
 * Storage temperature score modifier
 */
const STORAGE_TEMP_MODIFIER = {
  frozen: +10,
  refrigerated: +5,
  room_temp: 0,
};

/**
 * Packaging score modifier
 */
const PACKAGING_MODIFIER = {
  sealed: +8,
  partially_open: -5,
  open: -15,
};

/**
 * Score label thresholds
 */
const getLabel = (score) => {
  if (score >= 80) return 'Fresh';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Borderline';
  return 'Unsafe';
};

/**
 * Generate human-readable recommendation based on score and label
 */
const getRecommendation = (label, foodType, hoursToExpiry) => {
  const recommendations = {
    Fresh: `This ${foodType.replace('_', ' ')} is in excellent condition. Safe for immediate distribution. Estimated consumption window: ${hoursToExpiry > 0 ? Math.min(hoursToExpiry, 48) + ' hours' : 'soon'}.`,
    Good: `This ${foodType.replace('_', ' ')} is suitable for donation. Distribute within the next ${Math.min(hoursToExpiry, 24)} hours for best quality.`,
    Borderline: `Quality is acceptable but marginal. Only donate if NGO can distribute immediately (within 4–6 hours). Verify condition before accepting.`,
    Unsafe: `This item does not meet quality standards for donation. Risk of foodborne illness. Do not distribute.`,
  };
  return recommendations[label];
};

/**
 * Main food quality predictor
 * @param {Object} params
 * @returns {{ score: number, label: string, recommendation: string, breakdown: Object }}
 */
export const predictFoodQuality = ({
  foodType,
  expiryDate,
  preparedDate,
  storageTemp = 'room_temp',
  packaging = 'sealed',
  servingSize,
}) => {
  let score = FOOD_TYPE_BASE_SCORE[foodType] || 75;

  // ── Expiry factor (0–30 points) ──────────────────────────────────
  const now = new Date();
  const expiry = new Date(expiryDate);
  const hoursToExpiry = (expiry - now) / (1000 * 60 * 60);

  let expiryScore = 0;
  if (hoursToExpiry <= 0) {
    expiryScore = -40; // Already expired
  } else if (hoursToExpiry < 2) {
    expiryScore = -20;
  } else if (hoursToExpiry < 6) {
    expiryScore = -10;
  } else if (hoursToExpiry < 12) {
    expiryScore = -5;
  } else if (hoursToExpiry < 24) {
    expiryScore = 0;
  } else if (hoursToExpiry < 48) {
    expiryScore = +5;
  } else {
    expiryScore = +10;
  }

  // ── Prep time factor (if preparedDate provided) ──────────────────
  let prepScore = 0;
  if (preparedDate) {
    const hoursSincePrep = (now - new Date(preparedDate)) / (1000 * 60 * 60);
    const freshThreshold = {
      cooked_meal: 4,
      raw_vegetables: 48,
      fruits: 72,
      packaged_food: 9999,
      dairy: 24,
      bakery: 24,
      beverages: 9999,
      grains_pulses: 9999,
      snacks: 9999,
      other: 24,
    };
    const threshold = freshThreshold[foodType] || 24;
    const ratio = hoursSincePrep / threshold;

    if (ratio <= 0.25) prepScore = +8;
    else if (ratio <= 0.5) prepScore = +4;
    else if (ratio <= 1) prepScore = 0;
    else if (ratio <= 1.5) prepScore = -8;
    else if (ratio <= 2) prepScore = -15;
    else prepScore = -25;
  }

  // ── Storage & Packaging modifiers ────────────────────────────────
  const storageScore = STORAGE_TEMP_MODIFIER[storageTemp] || 0;
  const packagingScore = PACKAGING_MODIFIER[packaging] || 0;

  // ── Final calculation ─────────────────────────────────────────────
  score = score + expiryScore + prepScore + storageScore + packagingScore;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const label = getLabel(score);
  const recommendation = getRecommendation(label, foodType, hoursToExpiry);

  return {
    score,
    label,
    recommendation,
    breakdown: {
      baseScore: FOOD_TYPE_BASE_SCORE[foodType] || 75,
      expiryAdjustment: expiryScore,
      prepTimeAdjustment: prepScore,
      storageAdjustment: storageScore,
      packagingAdjustment: packagingScore,
      hoursToExpiry: Math.round(hoursToExpiry * 10) / 10,
    },
  };
};

// ─── RECOMMENDATION ENGINE ────────────────────────────────────────────────────

/**
 * Weights for recommendation scoring
 */
const RECOMMENDATION_WEIGHTS = {
  qualityScore: 0.35,    // Higher quality → higher priority
  urgency: 0.20,         // isUrgent donations get boosted
  expiryProximity: 0.25, // Closer to expiry → needs pickup sooner
  categoryMatch: 0.15,   // Matches NGO's preferred food categories
  quantityScore: 0.05,   // More quantity → serves more people
};

/**
 * Recommend and rank available donations for an NGO
 * @param {Object[]} donations - Available donation objects from DB
 * @param {Object} preferences - NGO preferences
 * @returns {Object[]} - Scored and ranked donations
 */
export const recommendDonations = (donations, preferences = {}) => {
  const {
    preferredCategories = [],
    city = '',
    urgencyPreference = false, // true if NGO prefers urgent items
  } = preferences;

  const now = new Date();

  const scored = donations.map((donation) => {
    let totalScore = 0;

    // 1. AI Quality score (normalized 0–1)
    const qualityNorm = (donation.aiQualityScore?.score || 60) / 100;
    totalScore += qualityNorm * RECOMMENDATION_WEIGHTS.qualityScore;

    // 2. Urgency boost
    const urgencyVal = donation.isUrgent ? 1 : 0;
    totalScore += urgencyVal * RECOMMENDATION_WEIGHTS.urgency;

    // 3. Expiry proximity score (donate soonest-to-expire first)
    const expiry = new Date(donation.expiryDate);
    const hoursLeft = (expiry - now) / (1000 * 60 * 60);
    let expiryScore = 0;
    if (hoursLeft > 0 && hoursLeft <= 6) expiryScore = 1.0;
    else if (hoursLeft <= 12) expiryScore = 0.8;
    else if (hoursLeft <= 24) expiryScore = 0.6;
    else if (hoursLeft <= 48) expiryScore = 0.4;
    else expiryScore = 0.2;
    totalScore += expiryScore * RECOMMENDATION_WEIGHTS.expiryProximity;

    // 4. Category match
    const categoryMatch =
      preferredCategories.length === 0 ||
      preferredCategories.includes(donation.foodType)
        ? 1
        : 0.3;
    totalScore += categoryMatch * RECOMMENDATION_WEIGHTS.categoryMatch;

    // 5. Quantity score (normalized against 50 servings as max reference)
    const servings = donation.servingSize || 1;
    const quantityNorm = Math.min(servings / 50, 1);
    totalScore += quantityNorm * RECOMMENDATION_WEIGHTS.quantityScore;

    // Scale to 0–100
    const finalScore = Math.round(totalScore * 100);

    const reasons = [];
    if (qualityNorm >= 0.8) reasons.push('High quality food');
    if (donation.isUrgent) reasons.push('Urgent — needs pickup soon');
    if (hoursLeft <= 12) reasons.push('Expiring within 12 hours');
    if (categoryMatch === 1 && preferredCategories.length > 0) reasons.push('Matches your preferences');
    if (servings >= 20) reasons.push(`Feeds ~${servings} people`);

    return {
      donation,
      recommendationScore: finalScore,
      reasons,
      hoursToExpiry: Math.round(hoursLeft * 10) / 10,
    };
  });

  // Sort by recommendation score descending
  return scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
};
