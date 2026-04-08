const webpush = require('web-push');

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const isPushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

if (isPushConfigured) {
  webpush.setVapidDetails('mailto:admin@me.com', vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('Push notifications disabled: VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is missing.');
}

webpush.isPushConfigured = isPushConfigured;

module.exports = webpush;
