import express from 'express';
import {
  getNGOClaims,
  updateClaimStatus,
  getNGOStats,
  cancelClaim,
} from '../controllers/ngoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ngo'));

router.get('/stats', getNGOStats);
router.get('/claims', getNGOClaims);
router.patch('/claims/:id/status', updateClaimStatus);
router.delete('/claims/:id', cancelClaim);

export default router;
