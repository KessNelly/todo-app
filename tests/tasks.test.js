/**
 * Task controller logic tests (no DB required)
 */
require('./setup');
const { TASK_STATUSES } = require('../src/models/Task');

describe('Task filtering logic', () => {
  const allTasks = [
    { _id: '1', title: 'Task A', status: 'pending' },
    { _id: '2', title: 'Task B', status: 'completed' },
    { _id: '3', title: 'Task C', status: 'pending' },
    { _id: '4', title: 'Task D', status: 'deleted' },
  ];

  const filterTasks = (tasks, filter) => {
    if (filter === 'pending') return tasks.filter(t => t.status === 'pending');
    if (filter === 'completed') return tasks.filter(t => t.status === 'completed');
    return tasks.filter(t => t.status !== 'deleted');
  };

  test('filter=pending returns only pending tasks', () => {
    const result = filterTasks(allTasks, 'pending');
    expect(result.every(t => t.status === 'pending')).toBe(true);
    expect(result.length).toBe(2);
  });

  test('filter=completed returns only completed tasks', () => {
    const result = filterTasks(allTasks, 'completed');
    expect(result.every(t => t.status === 'completed')).toBe(true);
    expect(result.length).toBe(1);
  });

  test('filter=all excludes deleted tasks', () => {
    const result = filterTasks(allTasks, 'all');
    expect(result.some(t => t.status === 'deleted')).toBe(false);
    expect(result.length).toBe(3);
  });
});

describe('Task status update authorization', () => {
  const canUpdateTask = (task, requestingUserId) => {
    return task.user.toString() === requestingUserId.toString();
  };

  test('owner can update task', () => {
    const task = { _id: 'task1', user: 'user1' };
    expect(canUpdateTask(task, 'user1')).toBe(true);
  });

  test('non-owner cannot update task', () => {
    const task = { _id: 'task1', user: 'user1' };
    expect(canUpdateTask(task, 'user2')).toBe(false);
  });
});

describe('Valid status values', () => {
  const isValidStatus = (status) => Object.values(TASK_STATUSES).includes(status);

  test('pending is valid', () => expect(isValidStatus('pending')).toBe(true));
  test('completed is valid', () => expect(isValidStatus('completed')).toBe(true));
  test('deleted is valid', () => expect(isValidStatus('deleted')).toBe(true));
  test('random string is invalid', () => expect(isValidStatus('archived')).toBe(false));
  test('empty string is invalid', () => expect(isValidStatus('')).toBe(false));
});
