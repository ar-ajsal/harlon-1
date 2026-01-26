import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    // Invoice Details
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    }, // Format: INV-2024-001

    date: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending'
    },

    paymentMethod: {
        type: String,
        enum: ['WhatsApp', 'Cash', 'UPI'],
        default: 'WhatsApp'
    },

    // Customer Info
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String }
    },

    // Itemized Product List (Snapshot of data at time of order)
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Optional, in case product is deleted
        name: { type: String, required: true },
        price: { type: Number, required: true },  // Selling price
        costPrice: { type: Number, default: 0 },  // Cost price for profit calculation (admin-only)
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true }
    }],

    // Financials
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true },

    notes: { type: String }
}, { timestamps: true });

// Ensure invoiceNumber is unique
orderSchema.index({ invoiceNumber: 1 }, { unique: true });

export default mongoose.model('Order', orderSchema);
