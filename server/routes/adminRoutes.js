import express from 'express';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAdminStats,
  getAllDonationsAdmin,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/donations', getAllDonationsAdmin);

export default router;
