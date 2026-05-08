const { validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');

// GET /auth/signup
const getSignup = (req, res) => {
  res.render('auth/signup', {
    title: 'Create Account',
    errors: [],
    formData: {},
    layout: 'layouts/auth',
  });
};

// POST /auth/signup
const postSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/signup', {
        title: 'Create Account',
        errors: errors.array(),
        formData: { username: req.body.username },
        layout: 'layouts/auth',
      });
    }

    const { username, password } = req.body;

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(409).render('auth/signup', {
        title: 'Create Account',
        errors: [{ msg: 'Username already taken. Please choose another.' }],
        formData: { username },
        layout: 'layouts/auth',
      });
    }

    const user = await User.create({ username: username.toLowerCase(), password });
    req.session.userId = user._id;
    req.session.username = user.username;

    logger.info(`New user registered | username=${user.username} | id=${user._id}`);
    req.flash('success', `Welcome, ${user.username}! Your account has been created.`);
    res.redirect('/tasks');
  } catch (error) {
    next(error);
  }
};

// GET /auth/login
const getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Sign In',
    errors: [],
    formData: {},
    layout: 'layouts/auth',
  });
};

// POST /auth/login
const postLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('auth/login', {
        title: 'Sign In',
        errors: errors.array(),
        formData: { username: req.body.username },
        layout: 'layouts/auth',
      });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      logger.warn(`Failed login attempt | username=${username} | reason=user_not_found`);
      return res.status(401).render('auth/login', {
        title: 'Sign In',
        errors: [{ msg: 'Invalid username or password.' }],
        formData: { username },
        layout: 'layouts/auth',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Failed login attempt | username=${username} | reason=wrong_password`);
      return res.status(401).render('auth/login', {
        title: 'Sign In',
        errors: [{ msg: 'Invalid username or password.' }],
        formData: { username },
        layout: 'layouts/auth',
      });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    logger.info(`User logged in | username=${user.username} | id=${user._id}`);
    req.flash('success', `Welcome back, ${user.username}!`);
    res.redirect('/tasks');
  } catch (error) {
    next(error);
  }
};

// POST /auth/logout
const postLogout = (req, res, next) => {
  const username = req.session.username;
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    logger.info(`User logged out | username=${username}`);
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};

module.exports = { getSignup, postSignup, getLogin, postLogin, postLogout };
