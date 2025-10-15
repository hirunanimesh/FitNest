const { supabase } = require('../config/supabase');

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/health',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/confirm',
  '/api/auth/reset-password',
  '/api/payment/webhook', // Stripe webhooks don't send user tokens
];

// Routes that require specific patterns to be public
const PUBLIC_ROUTE_PATTERNS = [
  /^\/api\/auth\/.*/, // All auth routes are public
  /^\/api\/payment\/sessionpayment\/success.*/, // Stripe success callbacks
  /^\/api\/payment\/sessionpayment\/cancel.*/, // Stripe cancel callbacks
];

/**
 * Check if a route should be publicly accessible (no token required)
 * @param {string} path - The request path
 * @returns {boolean} - Whether the route is public
 */
const isPublicRoute = (path) => {
  // Check exact matches
  if (PUBLIC_ROUTES.includes(path)) {
    return true;
  }

  // Check pattern matches
  return PUBLIC_ROUTE_PATTERNS.some(pattern => pattern.test(path));
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - The Authorization header value
 * @returns {string|null} - The extracted token or null
 */
const extractToken = (authHeader) => {
  if (!authHeader) return null;
  
  // Support both "Bearer <token>" and just "<token>" formats
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

/**
 * Authentication middleware for API Gateway
 * Verifies Supabase JWT tokens before forwarding requests to services
 */
const authenticationMiddleware = async (req, res, next) => {
  try {
    const path = req.path;
    
    // Skip authentication for public routes
    if (isPublicRoute(path)) {
      console.log(`[Auth Middleware] Skipping auth for public route: ${path}`);
      return next();
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      console.log(`[Auth Middleware] No token provided for protected route: ${path}`);
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log(`[Auth Middleware] Token verification failed for route: ${path}`, error?.message);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    // Add user info to request for downstream services
    req.user = user.user_metadata.role;
    req.token = token;
    
    // Add user info to headers for downstream services
    req.headers['x-user-id'] = user.id;
    req.headers['x-user-email'] = user.email;
    req.headers['x-auth-token'] = token;

    console.log(`[Auth Middleware] Token verified for user: ${user.email} on route: ${path}`);
    next();

  } catch (error) {
    console.error('[Auth Middleware] Unexpected error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

module.exports = {
  authenticationMiddleware,
  isPublicRoute,
  extractToken
};