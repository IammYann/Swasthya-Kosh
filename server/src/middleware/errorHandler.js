export function errorHandler(err, req, res, next) {
  console.error('Error:', err?.message || err);
  
  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors
    });
  }
  
  // Prisma connection errors
  if (err.code === 'P1000' || err.code === 'P1001' || err.code === 'P1002') {
    console.error('Database connection error:', err.message);
    return res.status(503).json({
      error: 'Database connection failed. Please try again.'
    });
  }
  
  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Unique constraint violation'
    });
  }
  
  // Prisma resource not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }
  
  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Unknown error'
  });
}
