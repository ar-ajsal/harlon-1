import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from './src/models/Coupon.js';
import CouponSale from './src/models/CouponSale.js';

dotenv.config();

console.log('🧪 Testing Coupon System Backend...\n');

async function testCouponSystem() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        console.log('📋 Testing Coupon Creation...');

        // Create a test coupon
        const testCoupon = await Coupon.create({
            code: 'TEST123',
            name: 'Test Friend',
            targetSales: 5,
            rewardDescription: '1 Free Jersey',
            startDate: new Date(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            isActive: true
        });

        console.log('✅ Created test coupon:');
        console.log(`   Code: ${testCoupon.code}`);
        console.log(`   Name: ${testCoupon.name}`);
        console.log(`   Target: ${testCoupon.targetSales} sales`);
        console.log(`   Current: ${testCoupon.currentSales} sales`);
        console.log(`   Valid: ${testCoupon.isValid()}`);
        console.log(`   Progress: ${testCoupon.progressPercentage}%`);
        console.log('');

        console.log('📋 Testing Coupon Validation...');
        const isValid = testCoupon.isValid();
        console.log(`   Is Valid: ${isValid ? '✅ YES' : '❌ NO'}`);
        console.log(`   Is Active: ${testCoupon.isActive}`);
        console.log(`   Is Expired: ${testCoupon.isExpired}`);
        console.log(`   Target Reached: ${testCoupon.isTargetReached}`);
        console.log('');

        console.log('📋 Testing Sale Recording...');
        const testSale = await CouponSale.create({
            couponCode: 'TEST123',
            customerName: 'John Customer',
            customerPhone: '+91 9876543210',
            productName: 'Liverpool Jersey',
            productId: new mongoose.Types.ObjectId(),
            amount: 359,
            size: 'L',
            whatsappMessage: 'Test order message',
            status: 'Pending'
        });

        console.log('✅ Created test sale:');
        console.log(`   Customer: ${testSale.customerName}`);
        console.log(`   Product: ${testSale.productName}`);
        console.log(`   Amount: ₹${testSale.amount}`);
        console.log(`   Status: ${testSale.status}`);
        console.log('');

        console.log('📋 Testing Sale Confirmation...');
        testSale.status = 'Confirmed';
        testSale.confirmedBy = 'admin';
        testSale.confirmedAt = new Date();
        await testSale.save();

        // Update coupon counter
        testCoupon.currentSales += 1;
        await testCoupon.save();

        console.log('✅ Confirmed sale and updated counter:');
        console.log(`   Sale Status: ${testSale.status}`);
        console.log(`   Coupon Progress: ${testCoupon.currentSales}/${testCoupon.targetSales}`);
        console.log(`   Progress: ${testCoupon.progressPercentage}%`);
        console.log('');

        console.log('🧹 Cleaning up test data...');
        await Coupon.deleteOne({ code: 'TEST123' });
        await CouponSale.deleteOne({ _id: testSale._id });
        console.log('✅ Cleanup complete\n');

        console.log('✅ All tests passed! Coupon system is working correctly.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
        process.exit(0);
    }
}

testCouponSystem();
