import express from 'express';
import { predictQuality, analyzeDonation, getRecommendations } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Any authenticated user can predict quality (used in create donation form)
router.post('/predict-quality', predictQuality);

// Analyze and save quality score to a specific donation
router.post('/analyze-donation/:id', analyzeDonation);

// NGO-only: get smart recommendations
router.post('/recommend', authorize('ngo', 'admin'), getRecommendations);

export default router;
