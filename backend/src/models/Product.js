import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Name cannot exceed 200 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    costPrice: {
        type: Number,
        min: [0, 'Cost price cannot be negative'],
        default: 0
    },
    description: {
        type: String,
        default: '',
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    sizes: [{
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    }],
    sleeveLength: {
        type: String,
        enum: ['Full Sleeve', 'Half Sleeve', 'Five Sleeve', ''],
        default: ''
    },
    collarType: {
        type: String,
        enum: ['Round', 'Polo', 'No Collar', ''],
        default: ''
    },
    zip: {
        type: Boolean,
        default: false
    },
    images: [{
        type: String
    }],
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    inStock: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    bestSeller: {
        type: Boolean,
        default: false
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    soldOut: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0
    },
    overlayImage: {
        type: String,
        default: ''
    },
    tryOnEnabled: {
        type: Boolean,
        default: false
    },

    // ── Matchday Drop Engine ──────────────────────────────────────────────────
    dropEnabled: { type: Boolean, default: false },
    dropStartTime: { type: Date },
    dropEndTime: { type: Date },
    dropQuantity: { type: Number, default: 0 },
    dropSold: { type: Number, default: 0 },
    dropReminders: [{
        email: { type: String },
        phone: { type: String }, // WhatsApp
        addedAt: { type: Date, default: Date.now }
    }],

    // ── Pre-Order System ─────────────────────────────────────────────────────
    isPreOrder: { type: Boolean, default: false },
    expectedShipDate: { type: Date },
    preorderCount: { type: Number, default: 0 },
    preorderTarget: { type: Number, default: 300 },

    // ── Football Story Commerce ──────────────────────────────────────────────
    storyEnabled: { type: Boolean, default: false },
    storyTitle: { type: String, default: '' },
    storyPlayer: { type: String, default: '' },
    storyYear: { type: String, default: '' },
    storyText: { type: String, default: '' },
    storyVideo: { type: String, default: '' }, // YouTube embed URL
    storyImage: { type: String, default: '' },

    // ── Product Type ─────────────────────────────────────────────────────────
    productType: {
        type: String,
        enum: ['standard', 'mystery-box', 'bundle'],
        default: 'standard'
    },

    // ── Bundle / Outfit Builder ──────────────────────────────────────────────
    bundleItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        label: { type: String } // e.g. 'Scarf', 'Cap'
    }],
    bundleDiscountPercent: { type: Number, default: 0 }

}, {
    timestamps: true
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Text search: name + description
productSchema.index({ name: 'text', description: 'text' });

// Shop listing — most common query: visible products sorted by priority
productSchema.index({ isVisible: 1, priority: -1 });

// Category filter in shop
productSchema.index({ isVisible: 1, category: 1, priority: -1 });

// Homepage featured / best-seller rails
productSchema.index({ featured: 1, isVisible: 1 });
productSchema.index({ bestSeller: 1, isVisible: 1 });


export default mongoose.model('Product', productSchema);
