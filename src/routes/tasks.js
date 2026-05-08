const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getTasks, createTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { isAuthenticated } = require('../middleware/auth');

const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters.'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters.'),
];

router.use(isAuthenticated);

router.get('/', getTasks);
router.post('/', taskValidation, createTask);
router.post('/:id/status', updateTaskStatus);
router.post('/:id/delete', deleteTask);

module.exports = router;
