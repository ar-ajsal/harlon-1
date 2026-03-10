import mongoose from 'mongoose';

const predictionEntrySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    predictedScoreA: { type: Number, required: true },
    predictedScoreB: { type: Number, required: true },
    points: { type: Number, default: 0 },
    couponCode: { type: String, default: '' }, // awarded when result matches
    submittedAt: { type: Date, default: Date.now }
});

const predictionMatchSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true }, // e.g. "Barcelona vs Real Madrid"
    teamA: { type: String, required: true, trim: true },
    teamB: { type: String, required: true, trim: true },
    teamALogo: { type: String, default: '' },
    teamBLogo: { type: String, default: '' },
    matchDate: { type: Date, required: true },
    league: { type: String, default: '' },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'finished'],
        default: 'upcoming'
    },
    // Actual result (filled by admin after match)
    resultScoreA: { type: Number },
    resultScoreB: { type: Number },
    // Prize for winners
    prize: { type: String, default: '10% discount coupon' },
    couponPrefix: { type: String, default: 'PREDICT' }, // prefix for generated coupon codes
    entries: [predictionEntrySchema],
    winnersProcessed: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Indexes
predictionMatchSchema.index({ status: 1, matchDate: -1 });
predictionMatchSchema.index({ matchDate: -1 });

export default mongoose.model('PredictionMatch', predictionMatchSchema);
