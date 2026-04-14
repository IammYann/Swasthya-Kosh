# Database Stability Improvements

## Overview
Implemented comprehensive query retry logic and connection pool optimization to eliminate intermittent database disconnections that occurred during health/finance logging and Life Score recalculation.

## Root Causes Identified
1. **Missing db.js Import** - Critical issue where `db.js` was never imported in `index.js`, causing Prisma client to never initialize until first query
2. **Connection Pool Exhaustion** - Heavy Life Score calculations concurrent with logging requests exhausted limited pool
3. **Timing Out Queries** - Complex calculations taking 2-5+ seconds could timeout under load
4. **Health Check Interference** - Aggressive health checks could interrupt active database operations

## Solutions Implemented

### 1. Query Retry Utility (`server/src/utils/queryRetry.js`)
- **Purpose**: Automatic retry mechanism for connection failures
- **Features**:
  - Detects connection errors (P1xxx codes)
  - Retries up to 3 times by default (configurable)
  - Exponential backoff: 1s, 2s, 3s delays between retries
  - Only retries on connection errors, not on data validation errors
  - Comprehensive logging for debugging

### 2. Service Layer Updates

#### Life Score Service (`server/src/services/lifeScore.js`)
Wrapped all 7 database queries with `retryQuery()`:
- `prisma.workoutLog.count()` - Counts workouts in past 7 days
- `prisma.stepLog.findMany()` - Retrieves step data
- `prisma.nutritionLog.findMany()` - Gets nutrition logs with distinct dates
- `prisma.transaction.findMany()` - Retrieves financial transactions (2 calls)
- `prisma.budget.findMany()` - Gets budget data
- `prisma.account.aggregate()` - Calculates net worth
- `prisma.lifeScore.findUnique/update/create()` - Saves calculation results

**Impact**: This is critical since Life Score is triggered after every health/finance log

#### Reports Service (`server/src/services/reports.js`)
Wrapped all 7 database queries with `retryQuery()`:
- `prisma.workoutLog.findMany()` - Monthly workout data
- `prisma.stepLog.findMany()` - Monthly step data
- `prisma.nutritionLog.findMany()` - Monthly nutrition logs
- `prisma.bodyMetric.findMany()` - Monthly body measurements
- `prisma.transaction.findMany()` - Monthly transactions
- `prisma.budget.findMany()` - Monthly budget data
- `prisma.account.findMany()` - Account balances

### 3. Route Layer Updates

#### Health Routes (`server/src/routes/health.js`)
Wrapped critical create/update operations:
- `POST /health/workouts` - Create workout log
- `POST /health/steps` - Create or update daily steps (triggers Life Score)
- `POST /health/body-metrics` - Log body measurements
- `POST /health/nutrition` - Log nutrition data

#### Transaction Routes (`server/src/routes/transactions.js`)
Wrapped transaction operations:
- `POST /transactions` - Create transaction with account balance update
- `DELETE /transactions/:id` - Delete transaction with balance reversion

#### Insights Routes (`server/src/routes/insights.js`)
Wrapped life score queries:
- `GET /insights/history/:days` - Retrieve life score history

### 4. Connection Pool Configuration

Current `.env` settings optimized for heavy operations:
```env
# Connection pool
CONNECTION_POOL_SIZE=20
POOL_TIMEOUT=30000
IDLE_IN_TRANSACTION_SESSION_TIMEOUT=60000
STATEMENT_TIMEOUT=120000
```

**Rationale**:
- **20 connections**: Balanced for typical concurrent requests (5-10 active users)
- **30s pool timeout**: Allows complex queries (Life Score ~2-5s) plus overhead
- **60s idle transaction cleanup**: Prevents stale connections from blocking pool
- **120s statement timeout**: Allows longest operations to complete

### 5. Database Connection Initialization

Updated `server/src/index.js`:
- Added missing `import { prisma } from './lib/db.js'` - **CRITICAL FIX**
- Ensures Prisma Client initializes on server startup
- Registers diagnostic routes for monitoring
- Adds database error handler middleware

### 6. Error Handling Middleware

Created `server/src/middleware/dbErrorHandler.js`:
- Catches Prisma connection errors (P1000-P1002, P1008, P1011)
- Returns HTTP 503 Service Unavailable on connection errors
- Includes detailed logging for debugging
- Allows graceful degradation instead of server crashes

### 7. Diagnostic Endpoints

Created `server/src/routes/diagnostics.js`:
- `GET /api/diagnostics/health` - Pings database, measures response time
- `GET /api/diagnostics/db-info` - Shows connection pool status

Use these to monitor database health during testing.

## Testing the Fixes

### Test Scenario 1: Single Health Log
```bash
# Log a workout
POST /api/health/workouts
{
  "type": "running",
  "durationMinutes": 30,
  "caloriesBurned": 300,
  "date": "2024-01-15T10:00:00Z"
}
# Should complete without disconnection
```

### Test Scenario 2: Rapid Logging
```bash
# Log multiple health entries quickly
1. POST /api/health/steps (triggers Life Score)
2. POST /api/health/nutrition
3. POST /api/health/body-metrics
4. POST /api/transactions (triggers Life Score via finance logging)
# All should succeed with no disconnections
```

### Test Scenario 3: Monitor Diagnostics
```bash
# In another terminal, check database health during logging
GET /api/diagnostics/health
# Response should show successful connection
{
  "status": "connected",
  "responseTime": 15,
  "timestamp": "2024-01-15T10:05:00Z"
}
```

## Expected Improvements

### Before Fixes
- ❌ Disconnections 30-60s after logging health/finance data
- ❌ "Query timeout" errors during heavy operations
- ❌ Partial failures in Life Score calculation
- ❌ Connection pool exhaustion under concurrent load

### After Fixes
- ✅ Automatic retry on transient connection failures
- ✅ Exponential backoff prevents cascading failures
- ✅ Connection pool properly sized for typical load
- ✅ Clear error messages for debugging
- ✅ Monitoring endpoints for health checks

## Monitoring

### Key Metrics to Watch
1. **Response times** for logging endpoints - should be < 500ms
2. **Life Score calculation** - should be < 5s
3. **Connection pool usage** - should stay below 80% max connections
4. **Error rates** - should be near 0% after fixes

### Debug Commands
```bash
# Check current database connections
SELECT count(*) FROM pg_stat_activity;

# Check query performance
EXPLAIN ANALYZE SELECT ...

# View connection pool settings
SHOW max_connections;
```

## Rollback Plan

If issues persist:
1. Reduce `POOL_TIMEOUT` to 15s to fail faster and free connections
2. Increase `CONNECTION_POOL_SIZE` to 25-30
3. Enable query logging: `DATABASE_LOG_QUERIES=true`
4. Check `/api/diagnostics` endpoints for pool status
5. Review application logs for error patterns

## Future Optimizations

1. **Background Job Queue**: Move Life Score calculation to background
   - Prevents user-facing timeouts
   - Better resource utilization
   
2. **Query Optimization**: Add database indexes for common queries
   - Life Score queries scan 7/30 days of data
   - Could benefit from date range indexes
   
3. **Connection Pooling**: Implement pgBouncer for connection management
   - Better pool management across multiple Node instances
   - Faster connection recycling
   
4. **Caching**: Cache Life Score for 1-2 minutes
   - Reduce redundant calculations
   - Improve response times

## Files Modified

| File | Changes |
|------|---------|
| `server/src/utils/queryRetry.js` | New - Query retry utility |
| `server/src/services/lifeScore.js` | Wrapped all queries with retryQuery() |
| `server/src/services/reports.js` | Wrapped all queries with retryQuery() |
| `server/src/routes/health.js` | Wrapped create/update operations |
| `server/src/routes/transactions.js` | Wrapped create/delete operations |
| `server/src/routes/insights.js` | Wrapped history query |
| `server/src/middleware/dbErrorHandler.js` | New - Error handler middleware |
| `server/src/routes/diagnostics.js` | New - Health monitoring endpoints |
| `server/src/index.js` | Added db.js import, error handler, diagnostics |
| `server/.env` | Optimized connection pool settings |

## Summary

The fixes implement a multi-layered approach to database stability:

1. **Quick Recovery**: Query retry utility recovers from transient failures
2. **Better Sizing**: Connection pool configured for realistic load
3. **Clear Visibility**: Diagnostics endpoints reveal pool and query status
4. **Graceful Degradation**: Error middleware prevents crashes

These changes should eliminate intermittent disconnections while maintaining backward compatibility with existing code.
