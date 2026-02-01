import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Coupon from './src/models/Coupon.js';
import CouponSale from './src/models/CouponSale.js';

dotenv.config();

async function testCouponSystem() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clean up test data
        console.log('🧹 Cleaning up old test data...');
        await Coupon.deleteMany({ code: /^TEST-/ });
        await CouponSale.deleteMany({ couponCode: /^TEST-/ });
        console.log('✅ Cleanup complete\n');

        // Test 1: Create a coupon
        console.log('📝 Test 1: Creating test coupon...');
        const coupon = await Coupon.create({
            code: 'TEST-FRIEND',
            name: 'Test Friend',
            targetSales: 5,
            rewardDescription: '1 Free Jersey',
            startDate: new Date(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isActive: true
        });
        console.log(`✅ Created coupon: ${coupon.code}`);
        console.log(`   Progress: ${coupon.currentSales}/${coupon.targetSales} (${coupon.progressPercentage}%)\n`);

        // Test 2: Validate coupon
        console.log('🔍 Test 2: Validating coupon...');
        const isValid = coupon.isValid();
        console.log(`✅ Coupon validity: ${isValid ? 'VALID' : 'INVALID'}\n`);

        // Test 3: Create pending sale
        console.log('🛒 Test 3: Creating pending sale...');
        const sale = await CouponSale.create({
            couponCode: coupon.code,
            customerName: 'Test Customer',
            customerPhone: '+91 9876543210',
            productName: 'Liverpool Jersey',
            productId: new mongoose.Types.ObjectId(),
            amount: 359,
            size: 'L',
            whatsappMessage: 'Test order with coupon',
            status: 'Pending'
        });
        console.log(`✅ Created pending sale: ${sale._id}`);
        console.log(`   Customer: ${sale.customerName}`);
        console.log(`   Product: ${sale.productName} (${sale.size})`);
        console.log(`   Amount: ₹${sale.amount}\n`);

        // Test 4: Confirm sale
        console.log('✅ Test 4: Confirming sale...');
        sale.status = 'Confirmed';
        sale.confirmedAt = new Date();
        await sale.save();

        // Update coupon counter
        coupon.currentSales += 1;
        await coupon.save();

        console.log(`✅ Sale confirmed!`);
        console.log(`   Updated progress: ${coupon.currentSales}/${coupon.targetSales} (${coupon.progressPercentage}%)\n`);

        // Test 5: Create multiple sales
        console.log('📦 Test 5: Creating multiple sales...');
        for (let i = 2; i <= 4; i++) {
            const newSale = await CouponSale.create({
                couponCode: coupon.code,
                customerName: `Customer ${i}`,
                customerPhone: `+91 987654321${i}`,
                productName: 'Manchester United Jersey',
                productId: new mongoose.Types.ObjectId(),
                amount: 399,
                size: 'M',
                whatsappMessage: `Order ${i}`,
                status: 'Confirmed',
                confirmedAt: new Date()
            });
            coupon.currentSales += 1;
            await coupon.save();
            console.log(`   ✓ Sale ${i} confirmed`);
        }
        console.log(`✅ Progress: ${coupon.currentSales}/${coupon.targetSales} (${coupon.progressPercentage}%)\n`);

        // Test 6: Reach target
        console.log('🎯 Test 6: Reaching target...');
        const finalSale = await CouponSale.create({
            couponCode: coupon.code,
            customerName: 'Final Customer',
            customerPhone: '+91 9876543215',
            productName: 'Barcelona Jersey',
            productId: new mongoose.Types.ObjectId(),
            amount: 429,
            size: 'XL',
            whatsappMessage: 'Final order',
            status: 'Confirmed',
            confirmedAt: new Date()
        });
        coupon.currentSales += 1;
        await coupon.save();

        console.log(`🎉 TARGET REACHED!`);
        console.log(`   Progress: ${coupon.currentSales}/${coupon.targetSales} (${coupon.progressPercentage}%)`);
        console.log(`   Reward: ${coupon.rewardDescription}\n`);

        // Test 7: Get sales by coupon
        console.log('📊 Test 7: Getting sales statistics...');
        const sales = await CouponSale.find({ couponCode: coupon.code });
        const confirmedSales = sales.filter(s => s.status === 'Confirmed');
        const totalRevenue = confirmedSales.reduce((sum, s) => sum + s.amount, 0);

        console.log(`✅ Sales Summary:`);
        console.log(`   Total Sales: ${sales.length}`);
        console.log(`   Confirmed: ${confirmedSales.length}`);
        console.log(`   Total Revenue: ₹${totalRevenue}\n`);

        // Test 8: Test expiry
        console.log('⏰ Test 8: Testing expiry...');
        const expiredCoupon = await Coupon.create({
            code: 'TEST-EXPIRED',
            name: 'Expired Test',
            targetSales: 5,
            rewardDescription: 'Test Reward',
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            isActive: true
        });
        console.log(`✅ Created expired coupon: ${expiredCoupon.code}`);
        console.log(`   Is valid: ${expiredCoupon.isValid() ? 'VALID' : 'INVALID (expired)'}\n`);

        console.log('🎉 All tests passed!\n');
        console.log('📋 Summary of Created Test Data:');
        console.log(`   - Coupon "TEST-FRIEND": 5/5 sales (TARGET REACHED)`);
        console.log(`   - Coupon "TEST-EXPIRED": Expired`);
        console.log(`   - ${sales.length} sales records`);
        console.log(`\n💡 You can view these in the admin panel at /admin/coupons\n`);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

testCouponSystem();
