import Inquiry from '../models/Inquiry.js';

// Strip HTML tags for basic sanitization
function sanitize(str) {
    return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * POST /api/inquiries
 */
export const createInquiry = async (req, res) => {
    try {
        const { productId, productName, customer, message } = req.body;

        // Validate required fields
        if (!productId || !productName || !customer?.name || !customer?.phone || !message?.trim()) {
            return res.status(400).json({ success: false, message: 'productId, productName, customer.name, customer.phone, and message are required' });
        }

        const inquiry = await Inquiry.create({
            productId,
            productName: sanitize(productName),
            customer: {
                name: sanitize(customer.name),
                phone: sanitize(customer.phone),
                email: customer.email ? sanitize(customer.email) : ''
            },
            message: sanitize(message).slice(0, 1000)
        });

        return res.status(201).json({ success: true, message: 'Inquiry submitted successfully', inquiryId: inquiry._id });
    } catch (err) {
        console.error('[inquiry] createInquiry error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to submit inquiry' });
    }
};
