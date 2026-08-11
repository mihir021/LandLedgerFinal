import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';

// =====================================================
// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
// =====================================================
const getNotifications = async (req, res, next) => {
  try {
    const ownerFilter = { $or: [{ userId: req.user._id }, { receiver: req.user._id }] };
    const notifications = await Notification.find(ownerFilter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved',
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
// =====================================================
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, $or: [{ userId: req.user._id }, { receiver: req.user._id }] },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return next(new ApiError(404, 'Notification not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
// =====================================================
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ userId: req.user._id }, { receiver: req.user._id }], isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
// =====================================================
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { receiver: req.user._id }],
    });

    if (!notification) {
      return next(new ApiError(404, 'Notification not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export { getNotifications, markAsRead, markAllAsRead, deleteNotification };
