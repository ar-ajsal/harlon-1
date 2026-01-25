import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import { configureCloudinary } from './src/config/cloudinary.js';
import app from './src/app.js';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

// Configure Cloudinary
configureCloudinary();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
