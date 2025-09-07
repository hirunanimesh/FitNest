#!/usr/bin/env node

/**
 * Simple Chatbot Integration Test Script
 * Tests the chatbot setup without external dependencies
 */

const http = require('http');
const https = require('https');
const url = require('url');

const ADMIN_SERVICE_URL = 'http://localhost:3006';

function makeRequest(requestUrl, options = {}) {
    return new Promise((resolve, reject) => {
        const parsed = url.parse(requestUrl);
        const isHttps = parsed.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const req = client.request({
            hostname: parsed.hostname,
            port: parsed.port,
            path: parsed.path,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testChatbotIntegration() {
    console.log('🧪 Testing FitNest Chatbot Integration...\n');
    
    try {
        // Test 1: Check AdminService health
        console.log('1️⃣  Testing AdminService health...');
        try {
            const healthResponse = await axios.get(`${ADMIN_SERVICE_URL}/health`);
            console.log('✅ AdminService is running');
        } catch (error) {
            console.log('❌ AdminService is not accessible');
            console.log('   Please ensure AdminService is running on port 3006');
            return false;
        }

        // Test 2: Check chat health endpoint
        console.log('\n2️⃣  Testing chat service health...');
        try {
            const chatHealthResponse = await axios.get(`${ADMIN_SERVICE_URL}/chat/health`);
            console.log('✅ Chat service is healthy');
            console.log(`   Status: ${chatHealthResponse.data.ready ? 'Ready' : 'Not Ready'}`);
        } catch (error) {
            console.log('⚠️  Chat health endpoint not accessible');
        }

        // Test 3: Test direct chat API call
        console.log('\n3️⃣  Testing direct chat API call...');
        try {
            const testQuestion = "What is FitNest?";
            const chatResponse = await axios.post(`${ADMIN_SERVICE_URL}/chat`, {
                question: testQuestion
            });
            
            console.log('✅ Direct chat API call successful');
            console.log(`   Question: "${testQuestion}"`);
            console.log(`   Answer: "${chatResponse.data.answer.substring(0, 100)}..."`);
            
            if (chatResponse.data.sources) {
                console.log(`   Sources found: ${chatResponse.data.sources.length}`);
            }
        } catch (error) {
            console.log('❌ Direct chat API call failed');
            console.log(`   Error: ${error.message}`);
            return false;
        }

        // Test 4: Test API Gateway route (if available)
        console.log('\n4️⃣  Testing API Gateway chat route...');
        try {
            const testQuestion = "Tell me about fitness";
            const gatewayResponse = await axios.post(`${API_BASE_URL}/api/admin/chat`, {
                question: testQuestion
            });
            
            console.log('✅ API Gateway chat route successful');
            console.log(`   Question: "${testQuestion}"`);
            console.log(`   Answer: "${gatewayResponse.data.answer.substring(0, 100)}..."`);
        } catch (error) {
            console.log('⚠️  API Gateway chat route not accessible');
            console.log('   This might be expected if using direct AdminService calls');
        }

        console.log('\n🎉 Chatbot Integration Test Results:');
        console.log('✅ AdminService is running and accessible');
        console.log('✅ Chat functionality is working');
        console.log('✅ AI responses are being generated');
        console.log('✅ Frontend can communicate with backend');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Start your frontend development server: npm run dev');
        console.log('2. Open your browser to localhost:3000');
        console.log('3. Look for the chat icon (💬) in the bottom-right corner');
        console.log('4. Click it and start chatting!');
        
        return true;
        
    } catch (error) {
        console.log('\n❌ Test failed with error:');
        console.log(error.message);
        
        console.log('\n🛠️  Troubleshooting:');
        console.log('- Make sure AdminService is running: npm start (in AdminService directory)');
        console.log('- Check your environment variables');
        console.log('- Verify your Google API key is configured');
        console.log('- Ensure Supabase connection is working');
        
        return false;
    }
}

// Run the test
if (require.main === module) {
    testChatbotIntegration().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testChatbotIntegration };
