import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './src/models/Order.js';

dotenv.config();

async function clean() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("finding orders with bad dropOns...");
    const badOrders = await Order.find({
        $or: [
            { 'items.dropOn': 'All Drops' },
            { 'items.dropOn': 'WhatsApp' }
        ]
    });
    
    console.log("Found:", badOrders.length, "bad orders");
    for (const order of badOrders) {
        let changed = false;
        order.items.forEach(item => {
            if (item.dropOn === 'All Drops' || item.dropOn === 'WhatsApp') {
                console.log(`Fixing order ${order.invoiceNumber}, item ${item.name}, bad dropOn: ${item.dropOn}`);
                item.dropOn = '';
                changed = true;
            }
        });
        if (changed) {
            await order.save();
            console.log("Saved order.");
        }
    }
    
    // Check all drop options again
    const values = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.dropOn': { $nin: [null, ''] } } },
        { $group: { _id: '$items.dropOn' } },
        { $sort: { _id: 1 } }
    ]);
    console.log("Remaining Drop values:", values.map(v => v._id));
    process.exit(0);
}

clean().catch(console.error);
