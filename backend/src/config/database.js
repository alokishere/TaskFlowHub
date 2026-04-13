const mongoose = require('mongoose');
const PushSubscription = require('../../models/PushSubscription');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    try {
      const indexes = await PushSubscription.collection.indexes();
      const hasLegacyUniqueUserIndex = indexes.some(
        (index) =>
          index?.name === 'userId_1' &&
          index?.unique &&
          Object.keys(index.key || {}).length === 1 &&
          index.key.userId === 1
      );

      if (hasLegacyUniqueUserIndex) {
        await PushSubscription.collection.dropIndex('userId_1');
        console.log('Removed legacy push subscription index: userId_1');
      }

      await PushSubscription.syncIndexes();
    } catch (indexError) {
      console.warn('Push subscription index sync warning:', indexError.message);
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
