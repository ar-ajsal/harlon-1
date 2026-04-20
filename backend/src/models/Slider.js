import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
    url: { type: String, required: true },          // Cloudinary URL
    publicId: { type: String, default: '' },        // Cloudinary public_id for deletion
    title: { type: String, default: '' },           // Optional overlay title
    subtitle: { type: String, default: '' },        // Optional subtitle
    link: { type: String, default: '/shop' },       // CTA link
    order: { type: Number, default: 0 },            // Display order
    active: { type: Boolean, default: true },       // Show/hide
}, { timestamps: true });

export default mongoose.model('Slider', sliderSchema);
