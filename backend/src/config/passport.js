import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export function initPassport() {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/user/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value?.toLowerCase();
            if (!email) return done(new Error('No email from Google'), null);

            // Find by google ID first, then by email
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.findOne({ email });
                if (user) {
                    // Link Google to existing email account
                    user.googleId = profile.id;
                    if (!user.avatar) user.avatar = profile.photos?.[0]?.value || '';
                    await user.save();
                } else {
                    // Brand new user via Google
                    user = await User.create({
                        name: profile.displayName || email.split('@')[0],
                        email,
                        googleId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                    });
                }
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    // We use JWT, not sessions — but Passport requires these stubs
    passport.serializeUser((user, done) => done(null, user._id.toString()));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
}
