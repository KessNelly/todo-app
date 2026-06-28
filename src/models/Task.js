const mongoose = require('mongoose');

const TASK_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  DELETED: 'deleted',
  OVERDUE: 'overdue',  
};

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    dueDate: {
      type: Date,
      required: false,                   
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TASK_STATUSES),
        message: 'Status must be pending, completed, deleted, or overdue',
      },
      default: TASK_STATUSES.PENDING,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user+status queries
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

// Auto-set completedAt when status changes to completed
taskSchema.pre('save', function (next) {
  if (this.isModified('status') || this.isModified('dueDate')) {
    const now = new Date();

    if (this.dueDate && this.dueDate < now && this.status === TASK_STATUSES.PENDING) {
      this.status = TASK_STATUSES.OVERDUE;
    }

    if (this.status === TASK_STATUSES.COMPLETED && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== TASK_STATUSES.COMPLETED) {
      this.completedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_STATUSES = TASK_STATUSES;