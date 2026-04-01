const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    punchIn: {
      type: String, // HH:MM:SS
      default: null
    },
    punchOut: {
      type: String, // HH:MM:SS
      default: null
    },
    workedMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'absent'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
