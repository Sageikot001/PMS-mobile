// Error handling middleware
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
  };
  
  // Custom error class
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = { errorHandler, AppError };