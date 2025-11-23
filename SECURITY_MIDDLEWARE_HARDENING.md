# Security Middleware Hardening

Enhanced security middleware configuration for FocusFlow server.

## Current Implementation

The server already has basic security middleware. This document provides enhanced hardening recommendations.

## Enhanced Security Middleware Code

### Updated server/index.js

Add this enhanced security configuration to your `server/index.js` file:

```javascript
// Enhanced Security Middleware Configuration
// Add this after the existing helmet configuration (around line 76)

// Enhanced Helmet configuration with additional security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", serverConfig.app.frontendUrl],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: serverConfig.env.isProduction ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false,
  expectCt: {
    maxAge: 86400,
    enforce: true
  }
}));

// Enhanced CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || 
  (serverConfig.env.isProduction ? [serverConfig.app.frontendUrl] : ['*']);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Session-Id',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'X-CSRF-Token',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Enhanced Rate Limiting with IP-based tracking
const createRateLimiter = (windowMs, max, message, keyGenerator) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    // Use IP address or user ID for rate limiting
    keyGenerator: keyGenerator || ((req) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    }),
    // Skip successful requests from rate limit count (optional)
    skipSuccessfulRequests: false,
    // Skip failed requests (optional)
    skipFailedRequests: false,
    // Store rate limit info in memory (use Redis in production)
    store: new rateLimit.MemoryStore(),
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          message: message.error?.message || 'Too many requests',
          code: message.error?.code || 'ERR_RATE_LIMIT',
          retryAfter: Math.ceil(windowMs / 1000)
        }
      });
    }
  });
};

// General rate limiter (enhanced)
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  Number.parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'ERR_RATE_LIMIT'
    }
  },
  (req) => {
    // Use IP address for rate limiting
    const ip = req.ip || 
               req.headers['x-forwarded-for']?.split(',')[0] || 
               req.connection.remoteAddress || 
               'unknown';
    return `rate-limit:${ip}`;
  }
);

// Stricter auth rate limiter
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10), // Reduced to 5
  {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'ERR_AUTH_RATE_LIMIT'
    }
  },
  (req) => {
    // Use IP + email/username for auth endpoints
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const identifier = req.body?.emailOrUsername || req.body?.email || 'unknown';
    return `auth-limit:${ip}:${identifier}`;
  }
);

// API rate limiter (for /api/* routes)
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  Number.parseInt(process.env.API_RATE_LIMIT_MAX || '200', 10),
  {
    success: false,
    error: {
      message: 'API rate limit exceeded',
      code: 'ERR_API_RATE_LIMIT'
    }
  }
);

// Apply rate limiting
app.use('/auth', authLimiter);
app.use('/api', apiLimiter);
app.use('/', generalLimiter);

// Skip rate limiting for health checks
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  generalLimiter(req, res, next);
});
```

## Additional Security Middleware

### Request ID Middleware

Add request tracking:

```javascript
// Add after body parsing middleware
const { v4: uuidv4 } = require('uuid');

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});
```

### Security Headers Middleware

Add custom security headers:

```javascript
// Custom security headers
app.use((req, res, next) => {
  // Remove X-Powered-By header (Express default)
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Add server identification (optional)
  res.setHeader('Server', 'FocusFlow');
  
  next();
});
```

### Body Size Limiting

Enhance body size limits:

```javascript
// Enhanced body parsing with size limits
app.use(express.json({ 
  limit: serverConfig.http.bodyLimit || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
  // Reject malformed JSON
  strict: true
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: serverConfig.http.bodyLimit || '10mb',
  parameterLimit: 1000 // Limit number of parameters
}));
```

### IP Whitelisting (Optional)

For admin endpoints:

```javascript
// IP whitelist middleware (for admin routes)
const ipWhitelist = (allowedIPs) => {
  return (req, res, next) => {
    const clientIP = req.ip || 
                    req.headers['x-forwarded-for']?.split(',')[0] || 
                    req.connection.remoteAddress;
    
    if (allowedIPs.includes(clientIP) || allowedIPs.includes('*')) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      error: {
        message: 'Access denied',
        code: 'ERR_IP_NOT_ALLOWED'
      }
    });
  };
};

// Use for admin routes
app.use('/admin', ipWhitelist(process.env.ADMIN_IP_WHITELIST?.split(',') || []));
```

## Environment Variables for Security

Add to your `.env`:

```bash
# Rate Limiting
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
API_RATE_LIMIT_MAX=200

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com

# Security
TRUST_PROXY=true
BODY_LIMIT=10mb

# Admin IP Whitelist (comma-separated)
ADMIN_IP_WHITELIST=127.0.0.1,::1
```

## Testing Security Headers

Test your security headers:

```bash
# Test security headers
curl -I http://localhost:4000/health

# Should see:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Production Checklist

- [ ] Helmet configured with CSP
- [ ] CORS restricted to allowed origins
- [ ] Rate limiting enabled on all routes
- [ ] Stricter rate limits on auth endpoints
- [ ] Request ID tracking enabled
- [ ] Security headers set
- [ ] Body size limits configured
- [ ] IP whitelisting for admin (if needed)
- [ ] Trust proxy configured (if behind reverse proxy)
- [ ] All security middleware tested

## Next Steps

1. Review current `server/index.js` implementation
2. Apply enhanced security middleware code above
3. Test all endpoints with security headers
4. Update environment variables
5. Deploy and verify in production

---

**Note**: These enhancements build upon the existing security middleware. Review and integrate carefully to avoid breaking existing functionality.



