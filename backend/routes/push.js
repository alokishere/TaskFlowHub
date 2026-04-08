const express = require('express');
const mongoose = require('mongoose');
const { requireAuth, requireAdmin } = require('../src/middleware/auth');
const PushSubscription = require('../models/PushSubscription');
const { sendPushToAll } = require('../src/utils/pushNotifications');

const router = express.Router();
router.use(requireAuth);

const defaultNotification = {
  title: '⏰ Punch-In Reminder',
  body: 'Please login and mark attendance'
};

const isValidUserId = (userId) => mongoose.Types.ObjectId.isValid(userId);
const isValidSubscription = (subscription = {}) => {
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  return Boolean(endpoint && p256dh && auth);
};

router.post('/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user?._id?.toString();

    if (!userId || !isValidUserId(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!isValidSubscription(subscription)) {
      return res.status(400).json({ success: false, message: 'Valid subscription is required' });
    }

    await PushSubscription.findOneAndUpdate(
      { userId },
      { userId, subscription, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, message: 'Push subscription saved' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to save subscription' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId || !isValidUserId(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await PushSubscription.deleteOne({ userId });

    return res.json({ success: true, message: 'Push subscription removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to remove subscription' });
  }
});

router.post('/send-all', requireAdmin, async (req, res) => {
  try {
    const notification = {
      title: req.body?.title || defaultNotification.title,
      body: req.body?.body || defaultNotification.body,
      data: {
        url: req.body?.url || '/employee/attendance'
      }
    };
    const result = await sendPushToAll(notification);

    return res.json({
      success: true,
      message: 'Push notifications processed',
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to send notifications' });
  }
});

module.exports = router;
