const express = require('express');
const mongoose = require('mongoose');
const { requireAuth, requireAdmin } = require('../src/middleware/auth');
const PushSubscription = require('../models/PushSubscription');
const { sendPushToAll } = require('../src/utils/pushNotifications');

const router = express.Router();

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

router.get('/public-key', (req, res) => {
  const publicKey = String(process.env.VAPID_PUBLIC_KEY || '').trim();
  if (!publicKey) {
    return res.status(503).json({
      success: false,
      message: 'Push notifications are not configured on the server.'
    });
  }

  return res.json({
    success: true,
    publicKey
  });
});

router.use(requireAuth);

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

    const endpoint = String(subscription.endpoint || '').trim();

    await PushSubscription.findOneAndUpdate(
      { userId, endpoint },
      { userId, endpoint, subscription, createdAt: new Date() },
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
    const endpoint = String(req.body?.endpoint || '').trim();

    if (!userId || !isValidUserId(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (endpoint) {
      await PushSubscription.deleteOne({ userId, endpoint });
    } else {
      await PushSubscription.deleteMany({ userId });
    }

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
