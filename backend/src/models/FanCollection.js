import mongoose from 'mongoose';

const fanCollectionSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9_]{3,20}$/, 'Username must be 3-20 chars: letters, numbers, underscores only']
    },
    displayName: { type: String, default: '', trim: true },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 200 },
    isPublic: { type: Boolean, default: true },
    shareToken: { type: String, unique: true, sparse: true }, // for share links
    jerseys: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        note: { type: String, default: '' },
        addedAt: { type: Date, default: Date.now }
    }],
    // Contact (optional, for leaderboard notifications)
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
}, {
    timestamps: true
});

// Indexes
fanCollectionSchema.index({ username: 1 });
fanCollectionSchema.index({ shareToken: 1 });
// Leaderboard: count jerseys by sorting on virtual or by array length
fanCollectionSchema.index({ isPublic: 1 });

// Virtual: jersey count for leaderboard
fanCollectionSchema.virtual('jerseyCount').get(function () {
    return this.jerseys.length;
});

fanCollectionSchema.set('toJSON', { virtuals: true });
fanCollectionSchema.set('toObject', { virtuals: true });

export default mongoose.model('FanCollection', fanCollectionSchema);
