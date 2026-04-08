const PushSubscription = require('../../models/PushSubscription');
const webpush = require('../../utils/pushHelper');

const toUniqueIds = (userIds = []) => {
  const set = new Set(
    (Array.isArray(userIds) ? userIds : [])
      .map((id) => (id ? String(id) : ''))
      .filter(Boolean)
  );

  return Array.from(set);
};

const sendPushToUsers = async (userIds = [], notification = {}) => {
  const targets = toUniqueIds(userIds);
  if (!targets.length) {
    return { total: 0, sent: 0, failed: 0, removedExpired: 0 };
  }

  const subscriptions = await PushSubscription.find({ userId: { $in: targets } });

  return sendPushToSubscriptionRecords(subscriptions, notification);
};

const sendPushToAll = async (notification = {}) => {
  const subscriptions = await PushSubscription.find({});

  return sendPushToSubscriptionRecords(subscriptions, notification);
};

const sendPushToSubscriptionRecords = async (subscriptions = [], notification = {}) => {
  const records = Array.isArray(subscriptions) ? subscriptions : [];
  if (!records.length) {
    return { total: 0, sent: 0, failed: 0, removedExpired: 0 };
  }
  if (!webpush.isPushConfigured) {
    throw new Error('Push service is not configured. Missing VAPID keys.');
  }

  let sent = 0;
  let failed = 0;
  let removedExpired = 0;

  const payload = JSON.stringify({
    title: notification.title || 'Notification',
    body: notification.body || '',
    data: notification.data || {}
  });

  for (const record of records) {
    try {
      await webpush.sendNotification(record.subscription, payload, { TTL: 60 });
      sent += 1;
    } catch (error) {
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await PushSubscription.deleteOne({ _id: record._id });
        removedExpired += 1;
      } else {
        failed += 1;
      }
    }
  }

  return {
    total: records.length,
    sent,
    failed,
    removedExpired
  };
};

module.exports = {
  sendPushToUsers,
  sendPushToAll,
  sendPushToSubscriptionRecords
};
