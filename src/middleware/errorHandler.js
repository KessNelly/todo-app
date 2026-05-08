const logger = require('../utils/logger');

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log the error
  if (statusCode >= 500) {
    logger.error(`Server error | status=${statusCode} | path=${req.path} | method=${req.method}`, {
      error: err.message,
      stack: err.stack,
      user: req.session?.userId || 'anonymous',
    });
  } else {
    logger.warn(`Client error | status=${statusCode} | path=${req.path}`, {
      error: err.message,
    });
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    if (req.accepts('html')) {
      req.flash('error', messages.join(', '));
      return res.redirect('back');
    }
    return res.status(400).json({ success: false, errors: messages });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    if (req.accepts('html')) {
      req.flash('error', message);
      return res.redirect('back');
    }
    return res.status(409).json({ success: false, error: message });
  }

  // HTML response for browser requests
  if (req.accepts('html')) {
    return res.status(statusCode).render('error', {
      title: `Error ${statusCode}`,
      statusCode,
      message: statusCode === 404 ? 'Page not found.' : isProduction ? 'Something went wrong.' : err.message,
      layout: 'layouts/main',
    });
  }

  // JSON response for API requests
  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500 ? 'Internal Server Error' : err.message,
  });
};

module.exports = { notFound, errorHandler };
