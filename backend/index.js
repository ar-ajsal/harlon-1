import dotenv from 'dotenv';
dotenv.config();   // ← must be BEFORE any import that reads process.env

import connectDB from './src/config/db.js';
import { configureCloudinary } from './src/config/cloudinary.js';
import app from './src/app.js';

// Connect to Database
connectDB();

// Configure Cloudinary
configureCloudinary();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
