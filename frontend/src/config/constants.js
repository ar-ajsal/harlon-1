// App constants and configuration

// WhatsApp Configuration
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919562313752';

/**
 * Build WhatsApp URL with order message
 * @param {Object} params - Order parameters
 * @param {string} params.productName - Product name
 * @param {string} params.size - Selected size
 * @param {number} params.price - Product price
 * @param {string} params.customMessage - Optional custom message
 * @returns {string} WhatsApp URL
 */
export const buildWhatsAppUrl = ({ productName, size, price, customMessage }) => {
    const message = customMessage ||
        `🛒 *New Order from Harlon*\n\n` +
        `📦 Product: ${productName}\n` +
        `📏 Size: ${size}\n` +
        `💰 Price: ₹${price}\n\n` +
        `I want to order this jersey!`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// Site Configuration
export const SITE_NAME = 'Harlon';
export const SITE_DESCRIPTION = 'Premium Jersey Store';

// Size Options
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Categories (can be fetched from API, but fallback here)
export const DEFAULT_CATEGORIES = [
    { id: 'football', name: 'Football Jerseys' },
    { id: 'cricket', name: 'Cricket Jerseys' },
    { id: 'basketball', name: 'Basketball Jerseys' },
];
