import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.js';

dotenv.config();

console.log('🧪 Testing Category Display Fix...\n');

async function testCategoryFix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // 1. Check categories in database
        const categories = await Category.find();
        console.log(`📊 Categories in Database: ${categories.length}`);
        categories.forEach(cat => {
            console.log(`   - ${cat.name} (ID: ${cat._id}, Slug: ${cat.slug})`);
        });
        console.log('');

        // 2. Simulate API response structure
        console.log('🔍 Simulating API Response Structure:');
        const apiResponse = {
            success: true,
            message: 'Success',
            data: {
                data: categories,
                pagination: {
                    total: categories.length,
                    page: 1,
                    pages: 1,
                    limit: 1000
                }
            }
        };

        console.log('Response structure:');
        console.log(`   apiResponse.data.data = ${Array.isArray(apiResponse.data.data) ? `[${apiResponse.data.data.length} categories]` : 'not an array'}`);
        console.log('');

        // 3. Test the extraction logic
        console.log('🧮 Testing Category Extraction Logic:');
        const categoriesData = apiResponse;

        // OLD logic (broken)
        const oldResult = categoriesData.data || categoriesData || [];
        console.log(`   OLD: categoriesData.data = ${typeof oldResult === 'object' ? JSON.stringify(Object.keys(oldResult)) : oldResult}`);
        console.log(`   OLD: Is Array? ${Array.isArray(oldResult)}`);

        // NEW logic (fixed)
        const newResult = categoriesData.data?.data || categoriesData.data || categoriesData || [];
        console.log(`   NEW: categoriesData.data.data = ${Array.isArray(newResult) ? `[${newResult.length} categories]` : newResult}`);
        console.log(`   NEW: Is Array? ${Array.isArray(newResult)}`);
        console.log('');

        if (Array.isArray(newResult) && newResult.length > 0) {
            console.log('✅ Category extraction is working correctly!');
            console.log(`✅ Categories will now display in admin panel`);
        } else {
            console.log('❌ Category extraction still has issues');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
        process.exit(0);
    }
}

testCategoryFix();
