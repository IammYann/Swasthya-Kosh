export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }
  
  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Unique constraint violation'
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }
  
  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
}
