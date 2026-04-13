const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true
  },
  subscription: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
