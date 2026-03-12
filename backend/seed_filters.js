import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Fetch first 5 products
        const products = await Product.find().limit(5);

        if (products.length >= 3) {
            await Product.updateOne({ _id: products[0]._id }, { sleeveLength: 'Full Sleeve', collarType: 'Round', zip: true });
            await Product.updateOne({ _id: products[1]._id }, { sleeveLength: 'Half Sleeve', collarType: 'Polo', zip: false });
            await Product.updateOne({ _id: products[2]._id }, { sleeveLength: 'Five Sleeve', collarType: 'No Collar', zip: false });
            console.log(`Updated product 1 (${products[0].name}): Full Sleeve, Round, With Zip`);
            console.log(`Updated product 2 (${products[1].name}): Half Sleeve, Polo, Without Zip`);
            console.log(`Updated product 3 (${products[2].name}): Five Sleeve, No Collar, Without Zip`);
        }

        console.log('Finished seeding fake filter data.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
