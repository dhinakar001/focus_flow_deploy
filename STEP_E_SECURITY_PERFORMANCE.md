# STEP E: Security & Performance Checklist

## Security Risks & Mitigations

### 1. Authentication & Authorization

**Risk:** Token not verified against database
- **Location:** `server/middlewares/authMiddleware.js:152-159`
- **Issue:** User object created from token without DB verification
- **Fix:**
```javascript
// Verify user exists and is active
const user = await dbService.getUserById(decoded.userId);
if (!user || !user.is_active) {
  return res.status(401).json({ error: 'User not found or inactive' });
}
```

**Risk:** No token blacklist on logout
- **Location:** `server/routes/auth.js:96`
- **Issue:** Logged-out tokens still valid until expiry
- **Fix:** Implement Redis-based token blacklist or store revoked tokens in DB

**Risk:** Missing account lockout after failed login attempts
- **Location:** `server/routes/auth.js:32-39`
- **Issue:** Brute force attacks possible
- **Fix:**
```javascript
// Track failed attempts
const attempts = await dbService.getFailedLoginAttempts(email);
if (attempts >= 5) {
  return res.status(429).json({ error: 'Account locked. Try again in 15 minutes.' });
}
```

---

### 2. Input Validation

**Risk:** SQL injection (mitigated but verify)
- **Location:** All database queries
- **Status:** ✅ Using parameterized queries
- **Verification:** Ensure all queries use `$1, $2, ...` placeholders

**Risk:** XSS in user-generated content
- **Location:** Message previews, notes fields
- **Fix:**
```javascript
// Sanitize user input
const sanitize = require('sanitize-html');
const clean = sanitize(userInput, { allowedTags: [], allowedAttributes: {} });
```

**Risk:** Body size too large (DoS)
- **Location:** `server/index.js:127-137`
- **Status:** ✅ Fixed (reduced to 1mb)
- **Verification:** Limit is now 1mb instead of 10mb

---

### 3. Data Protection

**Risk:** Encryption key generation in dev mode
- **Location:** `server/services/dbService.js:44`
- **Issue:** Random key generated each restart in dev
- **Fix:** Use fixed dev key or fail fast if missing
- **Status:** ✅ Production validation exists

**Risk:** OAuth tokens stored unencrypted
- **Location:** `server/services/dbService.js:63-77`
- **Status:** ✅ Tokens encrypted with AES-256-GCM
- **Verification:** All tokens use `encrypt()` function

**Risk:** Secrets in environment variables
- **Location:** `env.example`
- **Status:** ✅ Placeholders only, no real secrets
- **Fix:** Add comments about generating secrets

---

### 4. API Security

**Risk:** Missing request timeout
- **Location:** `server/index.js`
- **Status:** ✅ Fixed (added timeout middleware)
- **Verification:** 30-second timeout configured

**Risk:** CORS too permissive
- **Location:** `server/index.js:80-86`
- **Status:** ⚠️ Development allows all origins
- **Fix:** Restrict to specific origins in production
```javascript
origin: serverConfig.env.isProduction 
  ? process.env.ALLOWED_ORIGINS?.split(',') 
  : '*'
```

**Risk:** Rate limiting too lenient
- **Location:** `server/index.js:89-119`
- **Status:** ✅ Rate limiting configured
- **Verification:** 100 req/15min general, 10 req/15min auth

---

## Performance Bottlenecks & Fixes

### 1. Database Queries

**Bottleneck:** N+1 queries in stats endpoints
- **Location:** `server/routes/stats.js`
- **Issue:** Fetching user sessions then querying each session's details
- **Fix:**
```sql
-- Use JOIN instead of multiple queries
SELECT fs.*, fm.name, fm.duration_minutes
FROM focus_sessions fs
JOIN focus_modes fm ON fs.mode_label = fm.slug
WHERE fs.user_id = $1
ORDER BY fs.started_at DESC
LIMIT 50;
```

**Bottleneck:** Missing indexes
- **Location:** Database migrations
- **Fix:** Ensure indexes on:
  - `focus_sessions(user_id, started_at)`
  - `mode_transitions(user_id, created_at)`
  - `blocked_messages(user_id, session_id)`

**Bottleneck:** No query result caching
- **Location:** Analytics endpoints
- **Fix:** Add Redis caching layer
```javascript
const cacheKey = `stats:${userId}:${dateRange}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
// ... fetch from DB ...
await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5min cache
```

---

### 2. Frontend Performance

**Bottleneck:** Large bundle size
- **Location:** `frontend/vite.config.js`
- **Status:** ✅ Code splitting implemented
- **Verification:** Check bundle analyzer output

**Bottleneck:** No lazy loading for heavy components
- **Location:** `frontend/src/components/Dashboard/Dashboard.jsx`
- **Status:** ✅ Lazy loading for HowItWorks
- **Fix:** Lazy load AnalyticsPanel if data-heavy

**Bottleneck:** Fetching all data on mount
- **Location:** `frontend/src/components/Analytics/AnalyticsPanel.jsx`
- **Fix:** Implement pagination or virtual scrolling
```javascript
const [page, setPage] = useState(1);
const [limit] = useState(20);
// Fetch only current page
```

---

### 3. API Performance

**Bottleneck:** Synchronous AI service calls
- **Location:** `server/routes/ai.js`
- **Issue:** Blocks request while waiting for AI response
- **Fix:** Use async queue (Bull/BullMQ)
```javascript
const job = await aiQueue.add('focus-coach', { userId, data });
return { jobId: job.id, status: 'processing' };
// Client polls for result
```

**Bottleneck:** No response compression
- **Location:** `server/index.js`
- **Fix:** Add compression middleware
```javascript
const compression = require('compression');
app.use(compression());
```

**Bottleneck:** Health check queries DB every time
- **Location:** `server/index.js:163-194`
- **Fix:** Cache health check result (1 second TTL)
```javascript
let healthCache = { status: null, timestamp: 0 };
if (Date.now() - healthCache.timestamp < 1000) {
  return res.json(healthCache.status);
}
```

---

### 4. Python AI Service

**Bottleneck:** No request caching
- **Location:** `python_service/src/api/routes/ai_routes.py`
- **Fix:** Add Redis caching for similar requests
```python
import redis
r = redis.Redis()
cache_key = f"ai:{endpoint}:{hash(input_data)}"
cached = r.get(cache_key)
if cached:
    return json.loads(cached)
# ... process ...
r.setex(cache_key, 3600, json.dumps(result))  # 1hr cache
```

**Bottleneck:** Synchronous processing
- **Location:** AI model inference
- **Fix:** Use async/await and background tasks
```python
from fastapi import BackgroundTasks
async def process_ai(input_data, background_tasks):
    # Return immediately, process in background
    background_tasks.add_task(heavy_ai_processing, input_data)
    return {"status": "processing", "job_id": job_id}
```

---

## Recommended Indexes

```sql
-- Focus sessions (most queried)
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date 
ON focus_sessions(user_id, started_at DESC);

-- Mode transitions (analytics)
CREATE INDEX IF NOT EXISTS idx_mode_transitions_user_date 
ON mode_transitions(user_id, created_at DESC);

-- Blocked messages (quick lookup)
CREATE INDEX IF NOT EXISTS idx_blocked_messages_user_session 
ON blocked_messages(user_id, session_id, created_at DESC);

-- Composite index for stats queries
CREATE INDEX IF NOT EXISTS idx_focus_sessions_stats 
ON focus_sessions(user_id, ended_at, duration_minutes) 
WHERE ended_at IS NOT NULL;
```

---

## Caching Strategy

### Redis Integration (Recommended)

```javascript
// Cache layer for frequently accessed data
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache stats for 5 minutes
async function getStats(userId, dateRange) {
  const key = `stats:${userId}:${dateRange}`;
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  
  const stats = await dbService.getStats(userId, dateRange);
  await client.setex(key, 300, JSON.stringify(stats));
  return stats;
}

// Cache AI responses for 1 hour
async function getAISuggestion(userId, context) {
  const key = `ai:suggestion:${userId}:${hash(context)}`;
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  
  const suggestion = await aiService.getSuggestion(userId, context);
  await client.setex(key, 3600, JSON.stringify(suggestion));
  return suggestion;
}
```

---

## Performance Targets

- **API Response Time:**
  - Health check: < 100ms
  - Auth endpoints: < 500ms
  - Data endpoints: < 200ms (p95), < 500ms (p99)
  - AI endpoints: < 2s (p95), < 5s (p99)

- **Frontend:**
  - Initial load: < 3s
  - Time to interactive: < 5s
  - Route transitions: < 200ms

- **Database:**
  - Query time: < 50ms (p95)
  - Connection pool: 10-20 connections
  - Idle timeout: 30s

---

## Monitoring Recommendations

1. **Application Performance Monitoring (APM)**
   - Track slow queries
   - Monitor API response times
   - Alert on errors

2. **Health Checks**
   - `/health` endpoint (already implemented)
   - Database connection status
   - External service availability

3. **Logging**
   - Request/response logging (already implemented)
   - Error tracking
   - Performance metrics

4. **Metrics**
   - Request rate
   - Error rate
   - Response time percentiles
   - Database connection pool usage

---

## Quick Wins (High Impact, Low Effort)

1. ✅ Add request timeout (DONE)
2. ✅ Reduce body size limit (DONE)
3. ✅ Add database health check (DONE)
4. ⏳ Add response compression (TODO)
5. ⏳ Add query result caching (TODO)
6. ⏳ Add database indexes (TODO)
7. ⏳ Implement token blacklist (TODO)
8. ⏳ Add account lockout (TODO)

---

**Priority Order:**
1. Database indexes (immediate performance gain)
2. Response compression (reduces bandwidth)
3. Query caching (reduces DB load)
4. Token blacklist (security)
5. Account lockout (security)
6. AI service caching (reduces AI service load)

