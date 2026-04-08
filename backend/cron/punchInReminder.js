const cron = require('node-cron');
const { sendPushToAll } = require('../src/utils/pushNotifications');

const punchInReminderTask = cron.schedule(
  '0 10 * * 1-5',
  async () => {
    try {
      await sendPushToAll({
        title: '⏰ Punch-In Reminder',
        body: 'Please login and mark attendance',
        data: {
          url: '/employee/attendance'
        }
      });
    } catch (error) {
      console.error('Punch-in reminder cron failed:', error.message);
    }
  },
  {
    timezone: 'Asia/Kolkata'
  }
);

module.exports = punchInReminderTask;
