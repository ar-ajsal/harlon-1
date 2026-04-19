import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    size: { type: String, required: true },
    qty: { type: Number, default: 1, min: 1 },
    key: { type: String, required: true }, // productId-size
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    passwordHash: { type: String, default: null }, // null for Google-only users
    googleId: { type: String, default: null, sparse: true },
    avatar: { type: String, default: '' },
    cart: { type: [cartItemSchema], default: [] },
    address: {
        streetAddress: { type: String, default: '' },
        apartment: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: 'Delhi' },
        pinCode: { type: String, default: '' },
        country: { type: String, default: 'India' },
    },
}, {
    timestamps: true,
});

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

const User = mongoose.model('User', userSchema);
export default User;
