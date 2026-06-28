const cron = require('node-cron');
const Task = require('../models/Task');
const { sendTaskNotification } = require('./notifications');

cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const overdueTasks = await Task.find({
      status: 'pending',
      dueDate: { $lt: now }
    });

    for (const task of overdueTasks) {
      task.status = 'overdue';
      await task.save();
      await sendTaskNotification(task.user, 'overdue', task);
      console.log(`Task marked overdue: ${task.title}`);
    }
  } catch (error) {
    console.error('Overdue checker error:', error);
  }
});

console.log('Overdue checker started');