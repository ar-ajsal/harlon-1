import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Investment amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        enum: ['inventory', 'marketing', 'equipment', 'shipping', 'other'],
        default: 'other'
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

export default mongoose.model('Investment', investmentSchema);
