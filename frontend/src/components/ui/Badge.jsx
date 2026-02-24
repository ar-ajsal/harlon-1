/**
 * Badge — small label / pill
 * Variants: gold | electric | success | error | warning | ink | muted
 * Also renders the "LATEST" badge used in the tracking timeline
 */
import React from 'react';

const Badge = ({
    children,
    variant = 'muted',
    className = '',
    ...props
}) => {
    const classes = [
        'badge',
        `badge-${variant}`,
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
};

/** Pre-configured "LATEST" timeline badge */
export const LatestBadge = () => (
    <span className="badge-latest">Latest</span>
);

/** Sold-Out overlay ribbon (absolutely positioned inside .product-card) */
export const SoldOutRibbon = () => (
    <div className="sold-out-ribbon" aria-label="Sold Out" role="img" />
);

export default Badge;
