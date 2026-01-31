import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const doCheck = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const p = await Product.findById('697782fae5388dba844f59a2');
        if (p) {
            console.log(`STOCK_RESULT: ${p.stock}`);
            console.log(`INSTOCK_RESULT: ${p.inStock}`);
        } else {
            console.log('NOT_FOUND');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

doCheck();
