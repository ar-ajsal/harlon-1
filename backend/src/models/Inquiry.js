import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true, trim: true },

    customer: {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, required: false, trim: true, lowercase: true, default: '' }
    },

    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },

    status: {
        type: String,
        enum: ['new', 'contacted', 'closed'],
        default: 'new'
    }
}, {
    timestamps: true
});

export default mongoose.model('Inquiry', inquirySchema);
