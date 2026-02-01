import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import Order from './src/models/Order.js';

dotenv.config();

console.log('🔍 Starting Comprehensive Backend Check...\n');

const comprehensiveCheck = async () => {
    try {
        // 1. Database Connection
        console.log('1️⃣ Testing Database Connection...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected successfully\n');

        // 2. Check Categories
        console.log('2️⃣ Checking Categories...');
        const categories = await Category.find().limit(10);
        console.log(`   Found ${categories.length} categories`);
        if (categories.length > 0) {
            console.log('   Sample categories:');
            categories.slice(0, 3).forEach(cat => {
                console.log(`   - ${cat.name} (${cat._id})`);
            });
        } else {
            console.log('   ⚠️  No categories found in database');
        }
        console.log('');

        // 3. Check Products
        console.log('3️⃣ Checking Products...');
        const products = await Product.find().limit(10);
        console.log(`   Found ${products.length} products`);
        if (products.length > 0) {
            console.log('   Sample products:');
            products.slice(0, 3).forEach(prod => {
                console.log(`   - ${prod.name} (Price: ₹${prod.price})`);
                console.log(`     Stock: ${prod.stock}, In Stock: ${prod.inStock}`);
            });
        } else {
            console.log('   ⚠️  No products found in database');
        }
        console.log('');

        // 4. Check Orders
        console.log('4️⃣ Checking Orders...');
        const orders = await Order.find().limit(10);
        console.log(`   Found ${orders.length} orders`);
        if (orders.length > 0) {
            console.log('   Sample orders:');
            orders.slice(0, 3).forEach(order => {
                console.log(`   - Order #${order.orderNumber} (${order.status})`);
                console.log(`     Total: ₹${order.total}, Items: ${order.items.length}`);
            });
        } else {
            console.log('   ⚠️  No orders found in database');
        }
        console.log('');

        // 5. Check for data integrity issues
        console.log('5️⃣ Checking Data Integrity...');
        const productsWithoutCategory = await Product.find({ category: { $exists: false } });
        const productsWithInvalidStock = await Product.find({ $or: [{ stock: { $lt: 0 } }, { stock: null }] });

        if (productsWithoutCategory.length > 0) {
            console.log(`   ⚠️  ${productsWithoutCategory.length} products without category`);
        } else {
            console.log('   ✅ All products have categories');
        }

        if (productsWithInvalidStock.length > 0) {
            console.log(`   ⚠️  ${productsWithInvalidStock.length} products with invalid stock`);
        } else {
            console.log('   ✅ All products have valid stock values');
        }
        console.log('');

        // 6. Check Environment Variables
        console.log('6️⃣ Checking Environment Variables...');
        const requiredEnvVars = [
            'MONGODB_URI',
            'CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY',
            'CLOUDINARY_API_SECRET',
            'ADMIN_PASSWORD',
            'PORT'
        ];

        requiredEnvVars.forEach(varName => {
            if (process.env[varName]) {
                console.log(`   ✅ ${varName} is set`);
            } else {
                console.log(`   ❌ ${varName} is MISSING`);
            }
        });
        console.log('');

        // 7. Summary
        console.log('📊 Summary:');
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Products: ${products.length}`);
        console.log(`   Orders: ${orders.length}`);
        console.log('');
        console.log('✅ Backend check completed successfully!');

    } catch (error) {
        console.error('❌ Error during check:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
        process.exit(0);
    }
};

comprehensiveCheck();
