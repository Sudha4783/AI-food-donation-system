import express from 'express';
import {
  createDonation,
  getDonations,
  getDonationById,
  updateDonationStatus,
  deleteDonation,
  claimDonation,
  getDonorStats,
} from '../controllers/donationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All donation routes require authentication
router.use(protect);

// Stats (must be before :id routes)
router.get('/my-stats', authorize('donor'), getDonorStats);

// Main CRUD
router.route('/')
  .get(getDonations)
  .post(authorize('donor'), createDonation);

router.route('/:id')
  .get(getDonationById)
  .delete(authorize('donor', 'admin'), deleteDonation);

router.patch('/:id/status', authorize('donor', 'admin'), updateDonationStatus);

// Claim a donation (NGO only)
router.post('/:id/claim', authorize('ngo'), claimDonation);

export default router;
