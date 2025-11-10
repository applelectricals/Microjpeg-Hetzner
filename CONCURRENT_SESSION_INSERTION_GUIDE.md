# INSERTING CONCURRENT SESSION MIDDLEWARE IN server/routes.ts

## STEP 1: Add at the TOP of routes.ts (after imports, before route definitions)

Find the section with imports and global declarations (around line 50-100), then add:

```typescript
// ============================================================================
// CONCURRENT SESSION TRACKING
// ============================================================================

// In-memory session tracking (use Redis in production)
const activeSessions = new Map<number, Set<string>>(); // userId -> Set of IPs

// Middleware to check concurrent sessions based on seat count
const checkConcurrentSessions = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return next();
  }

  const userId = req.user.id;
  const userIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    // Get user's seat count
    const user = await storage.getUser(userId);
    const allowedSeats = user.seats || 1;
    
    // Get or create session set for this user
    if (!activeSessions.has(userId)) {
      activeSessions.set(userId, new Set());
    }
    
    const userSessions = activeSessions.get(userId)!;
    
    // Add current IP to active sessions
    userSessions.add(userIP);
    
    // Check if exceeded seat limit
    if (userSessions.size > allowedSeats) {
      console.log(`⚠️ Concurrent session limit exceeded for user ${userId}: ${userSessions.size}/${allowedSeats} sessions`);
      
      return res.status(429).json({
        success: false,
        error: `Concurrent session limit exceeded. Your plan allows ${allowedSeats} concurrent session${allowedSeats > 1 ? 's' : ''}.`,
        allowedSeats: allowedSeats,
        activeSessions: userSessions.size
      });
    }
    
    // Log session info
    console.log(`✅ Session allowed for user ${userId}: ${userSessions.size}/${allowedSeats} active sessions`);
    
    // Store session info in request
    req.user.activeIP = userIP;
    req.user.allowedSeats = allowedSeats;
    
    next();
  } catch (error) {
    console.error('Session check error:', error);
    next(); // Don't block on error
  }
};

// Clean up stale sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  activeSessions.forEach((ips, userId) => {
    if (ips.size === 0) {
      activeSessions.delete(userId);
    }
  });
  console.log(`🧹 Session cleanup: ${activeSessions.size} active users`);
}, 30 * 60 * 1000);

// ============================================================================
```

## STEP 2: Apply middleware to protected routes

Find where you define your compression/conversion routes. Look for:

```typescript
app.post('/api/compress', ...)
app.post('/api/convert', ...)
app.post('/api/batch', ...)
```

ADD the middleware BEFORE the route handler:

```typescript
// Apply concurrent session check to all compression/conversion endpoints
app.post('/api/compress', checkConcurrentSessions, async (req, res) => {
  // ... existing compress logic
});

app.post('/api/convert', checkConcurrentSessions, async (req, res) => {
  // ... existing convert logic
});

app.post('/api/batch', checkConcurrentSessions, async (req, res) => {
  // ... existing batch logic
});
```

## STEP 3: Add session cleanup endpoints

Add these endpoints AFTER your existing routes (around where trial-status is):

```typescript
// Session cleanup endpoint (called when user logs out or closes browser)
app.post('/api/session/cleanup', isAuthenticated, (req, res) => {
  const userId = req.user?.id;
  const userIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (userId && activeSessions.has(userId)) {
    const userSessions = activeSessions.get(userId)!;
    userSessions.delete(userIP);
    
    console.log(`🧹 Session cleanup for user ${userId}, IP ${userIP}`);
    
    // Remove map entry if no sessions left
    if (userSessions.size === 0) {
      activeSessions.delete(userId);
    }
  }
  
  res.json({ success: true });
});

// Get active sessions info
app.get('/api/session/info', isAuthenticated, (req, res) => {
  const userId = req.user?.id;
  const user = req.user;
  
  const activeSessionCount = activeSessions.has(userId) 
    ? activeSessions.get(userId)!.size 
    : 0;
  
  res.json({
    allowedSeats: user.seats || 1,
    activeSessions: activeSessionCount,
    currentIP: req.ip || req.connection.remoteAddress || 'unknown',
    activeIPs: activeSessions.has(userId) 
      ? Array.from(activeSessions.get(userId)!) 
      : []
  });
});
```

## STEP 4: Update database schema (if not already done)

Add to your database initialization:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 1;
```

## EXACT LOCATIONS IN routes.ts:

1. **Line ~100** (after imports): Add `activeSessions` Map and `checkConcurrentSessions` middleware
2. **Line ~3500** (where compress/convert routes are): Add middleware to routes
3. **Line ~5500** (near trial-status endpoint): Add cleanup endpoints

## SEARCH MARKERS TO FIND LOCATIONS:

```bash
# Find compress route
grep -n "app.post('/api/compress'" server/routes.ts

# Find trial status route (insert cleanup endpoints nearby)
grep -n "trial-status" server/routes.ts

# Find imports section
grep -n "import.*express" server/routes.ts
```

## TESTING:

```bash
# Test session info
curl http://localhost:5000/api/session/info

# Test with multiple IPs (should block after seat limit)
# First session: OK
# Second session (different IP): If seats=1, should get 429 error
```

## PRODUCTION NOTE:

For production, replace in-memory Map with Redis:

```typescript
import Redis from 'ioredis';
const redis = new Redis();

// Store with TTL
await redis.sadd(`sessions:${userId}`, userIP);
await redis.expire(`sessions:${userId}`, 1800); // 30 min TTL
```
