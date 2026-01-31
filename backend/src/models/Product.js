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
    priority: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Text search index
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
