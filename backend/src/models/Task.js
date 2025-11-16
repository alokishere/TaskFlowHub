const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskTitle: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  taskDescription: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  taskDate: {
    type: Date,
    required: [true, 'Task date is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned to someone']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must be assigned by someone']
  },
  status: {
    type: String,
    enum: ['newTask', 'active', 'completed', 'failed'],
    default: 'newTask'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['newTask', 'active', 'completed', 'failed'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }]
}, {
  timestamps: true
});

taskSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.assignedBy
    });
  }
  next();
});

taskSchema.methods.updateStatus = function(newStatus, changedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy: changedBy
  });
  return this.save();
};

taskSchema.index({ assignedTo: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ taskDate: 1 });

module.exports = mongoose.model('Task', taskSchema);