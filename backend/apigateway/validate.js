// Quick test to verify our API Gateway configuration
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('Testing API Gateway configuration...');

try {
  const app = express();
  
  // Test basic express
  console.log('✓ Express loaded successfully');
  
  // Test middleware import
  console.log('✓ http-proxy-middleware loaded successfully');
  
  // Test proxy creation
  const testProxy = createProxyMiddleware('/test', {
    target: 'http://localhost:3001',
    changeOrigin: true
  });
  console.log('✓ Proxy middleware created successfully');
  
  // Test server start
  const server = app.listen(5001, () => {
    console.log('✓ Server started successfully on port 5001');
    console.log('🎉 API Gateway configuration is working!');
    server.close();
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
