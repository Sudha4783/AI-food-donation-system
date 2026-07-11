import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import { sendSuccess } from '../utils/responseHandler.js';
import {
  getUserNotifications,
  markAllRead,
  markOneRead,
} from '../services/notificationService.js';

const router = express.Router();
router.use(protect);

// GET /api/notifications
router.get('/', asyncHandler(async (req, res) => {
  const notifications = await getUserNotifications(req.user._id);
  const unread = notifications.filter(n => !n.isRead).length;
  sendSuccess(res, 200, 'Notifications fetched', { notifications, unread });
}));

// PATCH /api/notifications/read-all
router.patch('/read-all', asyncHandler(async (req, res) => {
  await markAllRead(req.user._id);
  sendSuccess(res, 200, 'All notifications marked as read');
}));

// PATCH /api/notifications/:id/read
router.patch('/:id/read', asyncHandler(async (req, res) => {
  const notif = await markOneRead(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Notification marked as read', { notification: notif });
}));

export default router;
