import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

const generateSales = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing orders for clean test? No, let's just add to them.

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-indexed

        console.log(`Generating sales for ${today.toLocaleString('default', { month: 'long' })} ${year}...`);

        const orders = [];

        // Generate random orders for the current month
        for (let day = 1; day <= today.getDate(); day++) {
            // Randomly decide if we have sales this day (80% chance)
            if (Math.random() > 0.2) {
                // Generate 1-3 orders for this day
                const numOrders = Math.floor(Math.random() * 3) + 1;

                for (let i = 0; i < numOrders; i++) {
                    const orderDate = new Date(year, month, day, 10 + i, 30, 0); // 10:30 AM + i hours

                    const amount = Math.floor(Math.random() * 2000) + 500; // 500 - 2500
                    const isPaid = Math.random() > 0.3; // 70% paid

                    orders.push({
                        invoiceNumber: `TEST-${year}-${month + 1}-${day}-${i}`,
                        date: orderDate,
                        status: isPaid ? 'Paid' : 'Pending',
                        paymentMethod: 'UPI',
                        customer: {
                            name: 'Test Customer',
                            phone: '9999999999'
                        },
                        items: [
                            {
                                name: 'Test Jersey',
                                price: amount,
                                quantity: 1,
                                total: amount
                            }
                        ],
                        subtotal: amount,
                        finalTotal: amount,
                        createdAt: orderDate,
                        updatedAt: orderDate
                    });
                }
            }
        }

        await Order.insertMany(orders);
        console.log(`✅ Successfully added ${orders.length} test orders!`);
        console.log('Refresh your Admin Dashboard to see the graph.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

generateSales();
