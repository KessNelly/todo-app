/**
 * Unit tests for Task model logic and TASK_STATUSES (no DB required)
 */
require('./setup');
const { TASK_STATUSES } = require('../src/models/Task');

describe('Task status constants', () => {
  test('TASK_STATUSES has pending, completed, deleted', () => {
    expect(TASK_STATUSES.PENDING).toBe('pending');
    expect(TASK_STATUSES.COMPLETED).toBe('completed');
    expect(TASK_STATUSES.DELETED).toBe('deleted');
  });

  test('all status values are strings', () => {
    Object.values(TASK_STATUSES).forEach(v => expect(typeof v).toBe('string'));
  });
});

describe('Task title validation logic', () => {
  const isValidTitle = (title) => typeof title === 'string' && title.trim().length > 0 && title.length <= 200;

  test('valid title passes', () => {
    expect(isValidTitle('Buy groceries')).toBe(true);
  });

  test('empty title fails', () => {
    expect(isValidTitle('')).toBe(false);
    expect(isValidTitle('   ')).toBe(false);
  });

  test('title over 200 chars fails', () => {
    expect(isValidTitle('a'.repeat(201))).toBe(false);
  });

  test('exactly 200 char title passes', () => {
    expect(isValidTitle('a'.repeat(200))).toBe(true);
  });
});

describe('Task status transition logic', () => {
  const applyStatusTransition = (task, newStatus) => {
    const updated = { ...task, status: newStatus };
    if (newStatus === TASK_STATUSES.COMPLETED && !task.completedAt) {
      updated.completedAt = new Date();
    } else if (newStatus !== TASK_STATUSES.COMPLETED) {
      updated.completedAt = null;
    }
    return updated;
  };

  test('marking pending -> completed sets completedAt', () => {
    const task = { status: 'pending', completedAt: null };
    const updated = applyStatusTransition(task, 'completed');
    expect(updated.completedAt).toBeInstanceOf(Date);
  });

  test('marking completed -> pending clears completedAt', () => {
    const task = { status: 'completed', completedAt: new Date() };
    const updated = applyStatusTransition(task, 'pending');
    expect(updated.completedAt).toBeNull();
  });

  test('marking completed -> deleted clears completedAt', () => {
    const task = { status: 'completed', completedAt: new Date() };
    const updated = applyStatusTransition(task, 'deleted');
    expect(updated.completedAt).toBeNull();
  });
});


describe('Due Date & Overdue Logic', () => {
  test('should set overdue status if dueDate is in the past', () => {
    const pastDate = new Date(Date.now() - 86400000);
    const task = new Task({
      title: 'Test Task',
      user: '507f1f77bcf86cd799439011',
      dueDate: pastDate,
      status: 'pending'
    });

    task.validateSync();
    expect(task.status).toBe('overdue');
  });

  test('should not change status if dueDate is in future', () => {
    const futureDate = new Date(Date.now() + 86400000); // tomorrow
    const task = new Task({
      title: 'Future Task',
      user: '507f1f77bcf86cd799439011',
      dueDate: futureDate,
      status: 'pending'
    });

    task.validateSync();
    expect(task.status).toBe('pending');
  });

  test('should allow manual overdue status', () => {
    const task = new Task({
      title: 'Manual Overdue',
      user: '507f1f77bcf86cd799439011',
      status: 'overdue'
    });

    expect(task.status).toBe('overdue');
  });
});