/**
 * Middleware to handle database connection errors and provide better error messages
 */
export function dbErrorHandler(err, req, res, next) {
  // Check if it's a database connection error
  if (
    err.code === 'P1000' ||
    err.code === 'P1001' ||
    err.code === 'P1002' ||
    err.message?.includes('connect') ||
    err.message?.includes('ECONNREFUSED')
  ) {
    console.error('Database connection error:', {
      code: err.code,
      message: err.message,
      path: req.path,
      timestamp: new Date().toISOString()
    });

    return res.status(503).json({
      error: 'Database connection error. Please try again in a moment.',
      code: err.code
    });
  }

  // Check if it's a query timeout
  if (
    err.code === 'P1008' ||
    err.message?.includes('timeout')
  ) {
    console.error('Database query timeout:', {
      message: err.message,
      path: req.path,
      timestamp: new Date().toISOString()
    });

    return res.status(504).json({
      error: 'Database query timed out. Please try again.'
    });
  }

  // Pass to global error handler
  next(err);
}
