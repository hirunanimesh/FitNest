/**
 * Configuration utilities for FitNest application
 */

/**
 * Get the base URL for the application
 * In production, uses the deployed domain
 * In development, uses the current window location
 */
export const getBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return process.env.NODE_ENV === 'production' 
      ? 'https://fit-nest.app' 
      : 'http://localhost:3010';
  }
  
  // Client-side
  return process.env.NODE_ENV === 'production' 
    ? 'https://fit-nest.app' 
    : window.location.origin;
};

/**
 * Get the API Gateway URL
 */
export const getApiGatewayUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';
};

/**
 * Production configuration
 */
export const config = {
  production: {
    frontendUrl: 'https://fit-nest.app',
    // Update this with your actual production API Gateway URL
    apiGatewayUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://your-production-api-gateway-url'
  },
  development: {
    frontendUrl: 'http://localhost:3010',
    apiGatewayUrl: 'http://localhost:3000'
  }
} as const;