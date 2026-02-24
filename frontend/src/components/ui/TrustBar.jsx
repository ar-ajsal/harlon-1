/**
 * TrustBar — inline row of trust signals
 * Used on Home (below hero), Checkout (above payment), PDP (below CTA)
 *
 * Accepts a custom `items` prop or renders defaults.
 */
import React from 'react';

const DEFAULT_ITEMS = [
    { icon: '🔒', label: 'Secure Payments' },
    { icon: '🚚', label: 'Free Delivery ₹999+' },
    { icon: '↩️', label: '7-Day Returns' },
    { icon: '✅', label: '100% Authentic' },
];

const TrustBar = ({ items = DEFAULT_ITEMS }) => (
    <div className="trust-bar" role="complementary" aria-label="Trust signals">
        <div className="container">
            <div className="trust-bar-inner">
                {items.map(({ icon, label }) => (
                    <div key={label} className="trust-item">
                        <span className="trust-item-icon" aria-hidden="true">{icon}</span>
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default TrustBar;
