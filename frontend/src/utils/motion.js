/**
 * Framer Motion presets with reduced-motion fallbacks
 * Use these instead of inline variant objects for consistency + accessibility
 */

const isReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ─── Atoms ───────────────────────────────────────────────────────────────────
export const fadeIn = isReduced
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.2, ease: 'easeOut' },
    }

export const slideUp = isReduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: 'easeOut' },
    }

export const slideInRight = isReduced
    ? {}
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.25, ease: 'easeOut' },
    }

// ─── Stagger containers ───────────────────────────────────────────────────────
export const staggerContainer = isReduced
    ? {}
    : {
        initial: 'hidden',
        animate: 'show',
        variants: {
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
        },
    }

export const staggerItem = isReduced
    ? {}
    : {
        variants: {
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
        },
    }

// ─── Modal ────────────────────────────────────────────────────────────────────
export const modalOverlay = isReduced
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
    }

export const modalContent = isReduced
    ? {}
    : {
        initial: { opacity: 0, scale: 0.96, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
        transition: { duration: 0.2, ease: 'easeOut' },
    }

// ─── Page transition ──────────────────────────────────────────────────────────
export const pageVariants = isReduced
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0.25, ease: 'easeOut' },
    }

// ─── Bottom sheet ─────────────────────────────────────────────────────────────
export const bottomSheet = isReduced
    ? {}
    : {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { type: 'spring', stiffness: 400, damping: 35 },
    }

// ─── Timing constants ─────────────────────────────────────────────────────────
export const MOTION = {
    fast: { duration: 0.08 },
    normal: { duration: 0.2 },
    slow: { duration: 0.35 },
    spring: { type: 'spring', stiffness: 400, damping: 30 },
    easeOut: [0.0, 0.0, 0.2, 1],
    easeIn: [0.4, 0.0, 1.0, 1],
}
