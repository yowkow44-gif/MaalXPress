const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * ADMIN → Send notification to user by nickname
 */
exports.sendNotification = async (req, res) => {
  try {
    const { nickname, title, message, type } = req.body;

    if (!nickname || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ nickname });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Notification.create({
      user: user._id,
      title,
      message,
      type,
    });

    res.json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * USER → Get notifications (pagination)
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments({ user: userId });

    res.json({
      success: true,
      notifications,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/**
 * USER → Unread count
 */
exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  res.json({ success: true, unreadCount: count });
};

/**
 * USER → Mark single as read
 */
exports.markAsRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isRead: true }
  );

  res.json({ success: true });
};

/**
 * USER → Mark all as read
 */
exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true });
};
