const http = require('http');

// Test function to make a POST request
function testSignup() {
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'testpass123',
    role: 'user'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 5000 // 5 second timeout
  };

  console.log('Making request to API Gateway...');
  console.log('Options:', options);
  console.log('Data:', postData);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.on('timeout', () => {
    console.error('Request timed out');
    req.destroy();
  });

  req.write(postData);
  req.end();
}

// Also test direct connection to auth service
function testAuthServiceDirect() {
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'testpass123',
    role: 'user'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 5000
  };

  console.log('\nMaking request directly to Auth Service...');
  console.log('Options:', options);

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.on('timeout', () => {
    console.error('Request timed out');
    req.destroy();
  });

  req.write(postData);
  req.end();
}

console.log('Testing API Gateway proxy...');
testSignup();

setTimeout(() => {
  testAuthServiceDirect();
}, 2000);
