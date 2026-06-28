const Task = require('../src/models/Task');

describe('Overdue Background Logic', () => {
  test('should identify overdue tasks correctly', async () => {
    const now = new Date();

    // Create test tasks
    await Task.create([
      { title: 'Overdue Task', user: '507f1f77bcf86cd799439011', dueDate: new Date(now - 86400000), status: 'pending' },
      { title: 'Future Task', user: '507f1f77bcf86cd799439011', dueDate: new Date(now + 86400000), status: 'pending' },
      { title: 'Completed Task', user: '507f1f77bcf86cd799439011', status: 'completed' }
    ]);

    const overdueTasks = await Task.find({
      status: 'pending',
      dueDate: { $lt: now }
    });

    expect(overdueTasks.length).toBe(1);
    expect(overdueTasks[0].title).toBe('Overdue Task');
  });
});