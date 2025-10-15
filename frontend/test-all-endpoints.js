// Comprehensive API endpoint testing script
const axios = require('axios');

const Base_URL = 'http://localhost:3000';

// Test endpoints across all services
const testEndpoints = [
    // Health endpoints (should work without auth)
    { name: 'API Gateway Health', method: 'GET', url: `${Base_URL}/health`, requiresAuth: false },
    { name: 'Auth Service Health', method: 'GET', url: `${Base_URL}/api/auth/health`, requiresAuth: false },
    
    // Auth endpoints (public)
    { name: 'Auth User Status', method: 'GET', url: `${Base_URL}/api/auth/user`, requiresAuth: false },
    
    // Gym Service (requires auth)
    { name: 'Get All Gyms', method: 'GET', url: `${Base_URL}/api/gym/getallgyms`, requiresAuth: true },
    { name: 'Get Gym Plan Details', method: 'POST', url: `${Base_URL}/api/gym/getgymplandetails`, data: { planIds: ['test'] }, requiresAuth: true },
    
    // Payment Service (requires auth)
    { name: 'Get System Revenue', method: 'GET', url: `${Base_URL}/api/payment/getsystemrevenue`, requiresAuth: true },
    
    // User Service (requires auth)
    { name: 'Get User by ID', method: 'GET', url: `${Base_URL}/api/user/getuserbyid/123`, requiresAuth: true },
    
    // Trainer Service (requires auth)
    { name: 'Get All Trainers', method: 'GET', url: `${Base_URL}/api/trainer/getalltrainers`, requiresAuth: true },
    
    // Admin Service (requires auth)
    { name: 'Get Dashboard Stats', method: 'GET', url: `${Base_URL}/api/admin/dashboard/stats`, requiresAuth: true },
];

async function testEndpoint(endpoint) {
    try {
        console.log(`\n🧪 Testing: ${endpoint.name}`);
        console.log(`   ${endpoint.method} ${endpoint.url}`);
        
        const config = {
            method: endpoint.method,
            url: endpoint.url,
            timeout: 5000,
            validateStatus: () => true // Don't throw on any status code
        };
        
        if (endpoint.data) {
            config.data = endpoint.data;
            config.headers = { 'Content-Type': 'application/json' };
        }
        
        const response = await axios(config);
        
        if (response.status === 200) {
            console.log(`   ✅ SUCCESS: ${response.status} - ${response.statusText}`);
            if (response.data?.message) {
                console.log(`   📝 Message: ${response.data.message}`);
            }
        } else if (response.status === 401 && endpoint.requiresAuth) {
            console.log(`   🔐 AUTH REQUIRED: ${response.status} - Expected for protected endpoint`);
        } else if (response.status === 404) {
            console.log(`   ❓ NOT FOUND: ${response.status} - Endpoint may not exist`);
        } else if (response.status >= 500) {
            console.log(`   ❌ SERVER ERROR: ${response.status} - ${response.statusText}`);
            if (response.data?.message) {
                console.log(`   📝 Error: ${response.data.message}`);
            }
        } else {
            console.log(`   ⚠️  UNEXPECTED: ${response.status} - ${response.statusText}`);
            if (response.data?.message) {
                console.log(`   📝 Response: ${response.data.message}`);
            }
        }
        
        return { endpoint: endpoint.name, status: response.status, success: response.status < 500 };
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log(`   💀 CONNECTION REFUSED: Service may be down`);
        } else if (error.code === 'ECONNABORTED') {
            console.log(`   ⏱️  TIMEOUT: Request took too long`);
        } else {
            console.log(`   💥 NETWORK ERROR: ${error.message}`);
        }
        return { endpoint: endpoint.name, status: 'ERROR', success: false };
    }
}

async function runAllTests() {
    console.log('🚀 Starting comprehensive API endpoint tests...\n');
    
    const results = [];
    
    for (const endpoint of testEndpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    
    console.log('\n\n📊 TEST SUMMARY:');
    console.log('================');
    
    const working = results.filter(r => r.success);
    const failing = results.filter(r => !r.success);
    
    console.log(`✅ Working endpoints: ${working.length}`);
    working.forEach(r => console.log(`   - ${r.endpoint} (${r.status})`));
    
    console.log(`\n❌ Failing endpoints: ${failing.length}`);
    failing.forEach(r => console.log(`   - ${r.endpoint} (${r.status})`));
    
    console.log(`\n🎯 Success rate: ${Math.round((working.length / results.length) * 100)}%`);
}

runAllTests().catch(console.error);