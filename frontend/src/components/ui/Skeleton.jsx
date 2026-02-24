/**
 * Skeleton — shimmer loading placeholders
 * Usage:
 *   <Skeleton.ProductGrid count={4} />  — product grid
 *   <Skeleton.Line width="60%" />       — single line
 *   <Skeleton.Card />                   — generic card
 */
import React from 'react';

/* ── Primitive shimmer line ─────────────────────────────── */
const Line = ({ width = '100%', height = 12, className = '', style = {} }) => (
    <div
        className={`hl-shimmer skeleton-line ${className}`}
        style={{ width, height, ...style }}
        aria-hidden="true"
    />
);

/* ── Generic card (image + lines) ───────────────────────── */
const Card = () => (
    <div className="skeleton-card" aria-hidden="true">
        <div className="skeleton-image hl-shimmer" />
        <div className="skeleton-body">
            <Line width="40%" height={10} />
            <Line width="80%" height={14} />
            <Line width="100%" height={10} />
        </div>
    </div>
);

/* ── Product grid of N cards ────────────────────────────── */
const ProductGrid = ({ count = 4 }) => (
    <div className="products-grid" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: count }).map((_, i) => (
            <Card key={i} />
        ))}
    </div>
);

/* ── Admin stat card placeholder ────────────────────────── */
const StatCard = () => (
    <div
        className="hl-shimmer"
        style={{ borderRadius: 16, height: 110 }}
        aria-hidden="true"
    />
);

const Skeleton = { Line, Card, ProductGrid, StatCard };
export default Skeleton;
