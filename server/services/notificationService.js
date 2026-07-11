import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Create a notification for a single recipient
 */
export const createNotification = async ({ recipientId, type, title, message, relatedDonation = null, relatedClaim = null }) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedDonation,
      relatedClaim,
    });

    // Increment unread count on user
    await User.findByIdAndUpdate(recipientId, {
      $inc: { notificationsCount: 1 },
    });

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
  }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId, limit = 20) => {
  return Notification.find({ recipient: userId })
    .sort('-createdAt')
    .limit(limit)
    .populate('relatedDonation', 'title foodType');
};

/**
 * Mark all notifications as read for a user
 */
export const markAllRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  await User.findByIdAndUpdate(userId, { notificationsCount: 0 });
};

/**
 * Mark single notification as read
 */
export const markOneRead = async (notificationId, userId) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId, isRead: false },
    { isRead: true },
    { new: true }
  );
  if (notif) {
    await User.findByIdAndUpdate(userId, { $inc: { notificationsCount: -1 } });
  }
  return notif;
};
