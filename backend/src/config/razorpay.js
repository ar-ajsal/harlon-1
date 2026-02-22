import Razorpay from 'razorpay';

let _razorpay = null;

/**
 * Returns the Razorpay instance, created lazily on first use so that
 * dotenv has already populated process.env before we read the keys.
 */
function getRazorpay() {
    if (!_razorpay) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('[razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in .env');
        }
        _razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return _razorpay;
}

export default getRazorpay;
