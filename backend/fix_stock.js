import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

console.log('🔧 Starting Stock Consistency Fix...\n');

async function fixStock() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Find products with inconsistent stock
        const inconsistentProducts = await Product.find({
            $or: [
                { stock: { $lte: 0 }, inStock: true },
                { stock: { $gt: 0 }, inStock: false },
                { stock: null },
                { stock: { $exists: false } }
            ]
        });

        console.log(`Found ${inconsistentProducts.length} products with stock issues:\n`);

        if (inconsistentProducts.length > 0) {
            inconsistentProducts.forEach(product => {
                console.log(`- ${product.name}`);
                console.log(`  Current: stock=${product.stock}, inStock=${product.inStock}`);
            });
            console.log('');
        }

        // Fix products with stock <= 0
        const result1 = await Product.updateMany(
            { stock: { $lte: 0 } },
            { $set: { inStock: false } }
        );
        console.log(`✅ Updated ${result1.modifiedCount} products with stock <= 0 to inStock: false`);

        // Fix products with stock > 0
        const result2 = await Product.updateMany(
            { stock: { $gt: 0 } },
            { $set: { inStock: true } }
        );
        console.log(`✅ Updated ${result2.modifiedCount} products with stock > 0 to inStock: true`);

        // Fix products with null or missing stock
        const result3 = await Product.updateMany(
            { $or: [{ stock: null }, { stock: { $exists: false } }] },
            { $set: { stock: 0, inStock: false } }
        );
        console.log(`✅ Updated ${result3.modifiedCount} products with null/missing stock to 0`);

        // Verify the fix
        console.log('\n🔍 Verifying fixes...');
        const stillInconsistent = await Product.find({
            $or: [
                { stock: { $lte: 0 }, inStock: true },
                { stock: { $gt: 0 }, inStock: false }
            ]
        });

        if (stillInconsistent.length === 0) {
            console.log('✅ All stock inconsistencies have been fixed!\n');
        } else {
            console.log(`⚠️  Still ${stillInconsistent.length} products with issues\n`);
        }

        // Show summary
        const totalProducts = await Product.countDocuments();
        const inStockCount = await Product.countDocuments({ inStock: true });
        const outOfStockCount = await Product.countDocuments({ inStock: false });

        console.log('📊 Final Stock Summary:');
        console.log(`   Total Products: ${totalProducts}`);
        console.log(`   In Stock: ${inStockCount}`);
        console.log(`   Out of Stock: ${outOfStockCount}`);

    } catch (error) {
        console.error('❌ Error fixing stock:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database disconnected');
        process.exit(0);
    }
}

fixStock();
