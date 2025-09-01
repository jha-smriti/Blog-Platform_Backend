// backend/auth-backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notifications');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all notifications for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'username')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all as read
router.put('/mark-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});
// Get count of unread notifications
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    console.error('Error getting unread count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
