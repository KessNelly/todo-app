const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getSignup, postSignup, getLogin, postLogin, postLogout } = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/auth');

const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.get('/signup', isGuest, getSignup);
router.post('/signup', isGuest, signupValidation, postSignup);
router.get('/login', isGuest, getLogin);
router.post('/login', isGuest, loginValidation, postLogin);
router.post('/logout', isAuthenticated, postLogout);

module.exports = router;
