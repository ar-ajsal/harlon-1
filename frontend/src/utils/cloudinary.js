/**
 * Cloudinary URL transform helper
 * Generates optimized image URLs (AVIF → WebP → JPEG auto-fallback)
 */

/**
 * @param {string} url - Raw Cloudinary URL from DB
 * @param {Object} opts
 */
export function cloudinaryImg(url, {
    width = 400,
    height = null,
    quality = 'auto',
    format = 'auto',   // auto = AVIF → WebP → JPEG fallback
    crop = 'fill',
    gravity = 'auto',
} = {}) {
    if (!url || !url.includes('cloudinary.com')) return url

    const transforms = [
        `w_${width}`,
        height ? `h_${height}` : null,
        `c_${crop}`,
        `g_${gravity}`,
        `q_${quality}`,
        `f_${format}`,
        'dpr_auto',
    ].filter(Boolean).join(',')

    return url.replace('/upload/', `/upload/${transforms}/`)
}

// ─── Preset Helpers ──────────────────────────────────────────────────────────
// 3:4 portrait — product grid cards (360–430px mobile primary)
export const productThumb = (url) =>
    cloudinaryImg(url, { width: 400, height: 533, crop: 'fill' })

// 3:4 retina — for srcSet 2x
export const productThumb2x = (url) =>
    cloudinaryImg(url, { width: 800, height: 1067, crop: 'fill' })

// 1:1 square — product gallery / PDP
export const productGallery = (url) =>
    cloudinaryImg(url, { width: 800, height: 800, crop: 'fill' })

// Hero — wide, high quality
export const heroImage = (url) =>
    cloudinaryImg(url, { width: 1200, quality: 85, crop: 'limit' })

// Admin thumbnails — small
export const adminThumb = (url) =>
    cloudinaryImg(url, { width: 120, height: 120, crop: 'fill' })
