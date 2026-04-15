import mongoose from 'mongoose';

/**
 * Singleton settings document — only one doc ever exists (key: 'global').
 * Use Settings.getSettings() to read, Settings.updateSettings() to write.
 */
const settingsSchema = new mongoose.Schema({
    _key: { type: String, default: 'global', unique: true },

    // Order channel toggles
    whatsappOrderEnabled: { type: Boolean, default: true },
    onlinePaymentEnabled: { type: Boolean, default: true },
}, { timestamps: true });

settingsSchema.statics.getSettings = async function () {
    let doc = await this.findOne({ _key: 'global' });
    if (!doc) doc = await this.create({ _key: 'global' });
    return doc;
};

settingsSchema.statics.updateSettings = async function (updates) {
    const doc = await this.findOneAndUpdate(
        { _key: 'global' },
        { $set: updates },
        { upsert: true, new: true }
    );
    return doc;
};

export default mongoose.model('Settings', settingsSchema);
