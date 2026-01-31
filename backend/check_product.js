import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const checkProduct = async () => {
    await connectDB();
    try {
        const product = await Product.findById('697782fae5388dba844f59a2');
        if (product) {
            console.log('--- PRODUCT DETAILS ---');
            console.log(`Name: ${product.name}`);
            console.log(`Price: ${product.price}`);
            console.log(`Stock: ${product.stock}`);
            console.log(`InStock: ${product.inStock}`);
            console.log(`Sizes: ${product.sizes.join(', ')}`);
            console.log('-----------------------');
        } else {
            console.log('Product NOT Found with ID: 697782fae5388dba844f59a2');
        }
    } catch (error) {
        console.error('Error finding product:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkProduct();
