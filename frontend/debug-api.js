// Debug script to test API connectivity
const axios = require('axios');

const Base_URL = 'http://localhost:3000';

// Test 1: Basic API Gateway health check
async function testGatewayHealth() {
    try {
        console.log('🏥 Testing API Gateway health...');
        const response = await axios.get(`${Base_URL}/health`);
        console.log('✅ Gateway Health:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Gateway Health Failed:', error.message);
        return false;
    }
}

// Test 2: Test gym endpoint without auth (should fail with auth error)
async function testGymEndpointNoAuth() {
    try {
        console.log('🚫 Testing gym endpoint without auth...');
        const response = await axios.post(`${Base_URL}/api/gym/getgymplandetails`, {
            planIds: ['test']
        });
        console.log('✅ Unexpected success:', response.data);
    } catch (error) {
        console.log('✅ Expected auth error:', error.response?.status, error.response?.data || error.message);
    }
}

// Test 3: Test with empty auth headers
async function testGymEndpointEmptyAuth() {
    try {
        console.log('🔐 Testing gym endpoint with empty auth headers...');
        const response = await axios.post(`${Base_URL}/api/gym/getgymplandetails`, {
            planIds: ['test']
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Unexpected success:', response.data);
    } catch (error) {
        console.log('✅ Expected auth error:', error.response?.status, error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('🧪 Starting API connectivity tests...\n');
    
    await testGatewayHealth();
    console.log('');
    
    await testGymEndpointNoAuth();
    console.log('');
    
    await testGymEndpointEmptyAuth();
    console.log('');
    
    console.log('🏁 Tests completed!');
}

runTests();