const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'testing', 'completed'],
      default: 'pending'
    },
    acceptanceStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    progressUpdatedAt: {
      type: Date,
      default: null
    },
    progressHistory: [
      {
        date: {
          type: String,
          required: true
        },
        percent: {
          type: Number,
          min: 0,
          max: 100,
          required: true
        },
        note: {
          type: String,
          trim: true,
          default: ''
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
