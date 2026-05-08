const logger = require('../utils/logger');

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  logger.warn(`Unauthenticated access attempt | path=${req.path} | ip=${req.ip}`);
  req.flash('error', 'Please log in to access this page.');
  res.redirect('/auth/login');
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/tasks');
  }
  next();
};

module.exports = { isAuthenticated, isGuest };
