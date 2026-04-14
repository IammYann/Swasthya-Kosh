/**
 * Utility for retrying queries that fail due to connection issues
 */
export async function retryQuery(queryFn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (err) {
      lastError = err;
      
      // Check if it's a connection error
      const isConnectionError = 
        err.code?.startsWith('P1') || 
        err.message?.includes('connect') ||
        err.message?.includes('disconnect') ||
        err.message?.includes('timeout');
      
      if (!isConnectionError) {
        // Not a connection error, throw immediately
        throw err;
      }
      
      console.error(`Query failed (attempt ${i + 1}/${maxRetries}):`, err.message);
      
      if (i < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  
  console.error('Query failed after all retries:', lastError.message);
  throw lastError;
}
