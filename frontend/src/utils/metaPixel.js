// src/utils/metaPixel.js

const PIXEL_ID = '1557676629387860';

/**
 * Initializes the Meta (Facebook) Pixel.
 * Called once on app load. Safe to call again — internally guarded.
 */
export const initMetaPixel = () => {
    if (window.fbq) return;

    /* eslint-disable */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', PIXEL_ID);
};

/**
 * Tracks a page view.
 * Called automatically by MetaPixelTracker on every route change.
 */
export const pageView = () => {
    if (window.fbq) {
        window.fbq('track', 'PageView');
    }
};

/**
 * ViewContent — fires when a customer views a product detail page.
 *
 * CRITICAL: content_ids must be an ARRAY of strings that exactly
 * match the <g:id> in the catalog XML feed (which is product._id.toString()).
 *
 * Usage:
 *   viewContent({ content_ids: [product._id], content_name: product.name, value: product.price, currency: 'INR' })
 *
 * @param {Object} data
 * @param {string[]} data.content_ids   — MongoDB _id strings (MUST match catalog g:id)
 * @param {string}   data.content_name  — Product name
 * @param {number}   data.value         — Price shown to customer (after discount if any)
 * @param {string}   [data.currency]    — Defaults to 'INR'
 */
export const viewContent = (data) => {
    if (!window.fbq) return;
    const payload = {
        currency: 'INR',        // default currency — caller can override
        content_type: 'product',// required for catalog matching
        ...data,
        // Normalise content_ids to always be an array of strings
        content_ids: (data.content_ids || []).map(String),
    };
    window.fbq('track', 'ViewContent', payload);
};

/**
 * AddToCart — fires when a customer adds a product to their cart.
 *
 * Usage:
 *   addToCart({ content_ids: [product._id], content_name: product.name, value: product.price, currency: 'INR' })
 *
 * @param {Object} data
 * @param {string[]} data.content_ids   — MongoDB _id strings (MUST match catalog g:id)
 * @param {string}   data.content_name  — Product name
 * @param {number}   data.value         — Item price
 * @param {string}   [data.currency]    — Defaults to 'INR'
 */
export const addToCart = (data) => {
    if (!window.fbq) return;
    const payload = {
        currency: 'INR',
        content_type: 'product',
        ...data,
        content_ids: (data.content_ids || []).map(String),
    };
    window.fbq('track', 'AddToCart', payload);
};

/**
 * InitiateCheckout — fires when a customer enters the checkout flow.
 *
 * Usage:
 *   initiateCheckout({ content_ids: ['id1','id2'], num_items: 2, value: 1998, currency: 'INR' })
 *
 * @param {Object} data
 * @param {string[]} data.content_ids   — All product _id strings in the cart
 * @param {number}   data.num_items     — Total number of items
 * @param {number}   data.value         — Cart total
 * @param {string}   [data.currency]    — Defaults to 'INR'
 */
export const initiateCheckout = (data) => {
    if (!window.fbq) return;
    const payload = {
        currency: 'INR',
        content_type: 'product',
        ...data,
        content_ids: (data.content_ids || []).map(String),
    };
    window.fbq('track', 'InitiateCheckout', payload);
};

/**
 * Purchase — fires after a successful order is placed.
 *
 * NOTE: 'value' and 'currency' are REQUIRED by Meta for Purchase events.
 * Missing either will break conversion optimisation and ROAS reporting.
 *
 * Usage:
 *   purchase({ content_ids: ['id1'], value: 999, currency: 'INR' })
 *
 * @param {Object} data
 * @param {string[]} data.content_ids   — All product _id strings purchased
 * @param {number}   data.value         — Total order value (REQUIRED)
 * @param {string}   data.currency      — Currency code (REQUIRED, e.g. 'INR')
 */
export const purchase = (data) => {
    if (!window.fbq) return;
    const payload = {
        currency: 'INR',
        content_type: 'product',
        ...data,
        content_ids: (data.content_ids || []).map(String),
    };
    window.fbq('track', 'Purchase', payload);
};

/**
 * Search — fires when a user performs a search query.
 *
 * Usage:
 *   search('retro jersey')
 *
 * @param {string} search_string — The search term
 */
export const search = (search_string) => {
    if (window.fbq) {
        window.fbq('track', 'Search', { search_string });
    }
};
