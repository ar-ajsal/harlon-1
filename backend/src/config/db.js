import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        console.log('⚠️ Server running in limited mode (Database not connected)');
        // process.exit(1); // Don't crash, allow server to start for Admin Login
    }
};

export default connectDB;
