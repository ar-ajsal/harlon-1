import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/harlon');
        const res = await Product.updateMany({}, { $set: { inStock: true, stock: 50 } });
        console.log(`Updated ${res.modifiedCount} products.`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
fix();
