// Test API endpoints
const API_BASE = 'http://localhost:5000/api';

async function testEndpoint(name, url, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        console.log(`\n✅ ${name}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(data).substring(0, 200) + '...');

        return { success: true, status: response.status, data };
    } catch (error) {
        console.log(`\n❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('🧪 Starting API Endpoint Tests...\n');
    console.log('='.repeat(50));

    // Test health endpoint
    await testEndpoint('Health Check', `http://localhost:5000/health`);

    // Test categories
    await testEndpoint('Get All Categories', `${API_BASE}/categories`);

    // Test products
    await testEndpoint('Get All Products', `${API_BASE}/products`);

    // Test products with limit
    await testEndpoint('Get Limited Products', `${API_BASE}/products?limit=5`);

    // Test orders
    await testEndpoint('Get All Orders', `${API_BASE}/orders`);

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ API Tests Completed!');
}

runTests();
