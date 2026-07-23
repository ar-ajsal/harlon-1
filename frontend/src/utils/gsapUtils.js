/**
 * GSAP Utility — Harlon
 * Registers ScrollTrigger, exports reusable animation helpers.
 * Performance rules:
 *  - Only transform/opacity (GPU composited)
 *  - ScrollTrigger fires once, then self-destructs
 *  - All helpers are no-ops when reducedMotion = true
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Global defaults — snappy but premium
gsap.defaults({
    ease: 'power3.out',
    duration: 0.6,
})

/** Detect system reduced-motion preference */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Stagger-fade a batch of elements up as they scroll into view.
 * Uses ScrollTrigger.batch for efficiency (one observer for many elements).
 * @param {string|Element[]} targets - CSS selector or element array
 * @param {Object} options
 */
export function fadeUpBatch(targets, options = {}) {
    if (prefersReducedMotion()) return

    const {
        y = 32,
        duration = 0.55,
        stagger = 0.07,
        ease = 'power3.out',
        start = 'top 90%',
        once = true,
    } = options

    // Set initial state
    gsap.set(targets, { opacity: 0, y })

    ScrollTrigger.batch(targets, {
        start,
        once,
        onEnter: (batch) => {
            gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration,
                ease,
                stagger,
                overwrite: true,
            })
        },
    })
}

/**
 * Simple scroll-triggered fade-up for a single element.
 * @param {Element} el
 * @param {Object} options
 */
export function fadeUpOnScroll(el, options = {}) {
    if (!el || prefersReducedMotion()) return

    const {
        y = 28,
        duration = 0.6,
        delay = 0,
        ease = 'power3.out',
        start = 'top 88%',
    } = options

    gsap.fromTo(el,
        { opacity: 0, y },
        {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease,
            scrollTrigger: {
                trigger: el,
                start,
                once: true,
            }
        }
    )
}

/**
 * Instantly animate elements on mount (no scroll trigger).
 * Great for above-the-fold hero content.
 * @param {Element[]} elements - Array of { el, from, to, delay }
 */
export function heroTimeline(elements) {
    if (prefersReducedMotion()) return

    const tl = gsap.timeline()

    elements.forEach(({ el, from, to, delay = 0 }) => {
        if (!el) return
        tl.fromTo(el, from, { ...to, delay }, delay > 0 ? '<' + delay : '<0.05')
    })

    return tl
}

/**
 * Stagger word/span elements inside a container.
 * Split words by inserting <span> wrappers.
 * @param {Element} container
 * @param {Object} options
 */
export function staggerWords(container, options = {}) {
    if (!container || prefersReducedMotion()) return

    const {
        y = 40,
        duration = 0.5,
        stagger = 0.06,
        delay = 0,
        ease = 'power4.out',
    } = options

    const words = container.querySelectorAll('[data-word]')
    if (!words.length) return

    gsap.fromTo(words,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration, stagger, delay, ease }
    )
}

/** Kill all ScrollTrigger instances (call on page unmount) */
export function killAllTriggers() {
    ScrollTrigger.getAll().forEach(t => t.kill())
}

export { gsap, ScrollTrigger }
