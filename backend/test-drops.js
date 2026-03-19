import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './src/models/Order.js';

dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("finding dropOns...");
    const values = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.dropOn': { $nin: [null, ''] } } },
        { $group: { _id: '$items.dropOn' } },
        { $sort: { _id: 1 } }
    ]);
    console.log("Values:", values);
    process.exit(0);
}

test().catch(console.error);
