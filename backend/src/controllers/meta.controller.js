import Product from '../models/Product.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Escape all XML-unsafe characters in a string.
 * Also strips literal Unicode control chars that are illegal in XML 1.0.
 */
const escapeXML = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
        .toString()
        // Strip XML 1.0 illegal control characters (except \t, \n, \r)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<':  return '&lt;';
                case '>':  return '&gt;';
                case '&':  return '&amp;';
                case '\'': return '&apos;';
                case '"':  return '&quot;';
            }
        });
};

/**
 * Determine correct availability string from the REAL schema fields.
 *
 * Schema has three overlapping fields:
 *   inStock  (Boolean)  — primary admin toggle
 *   soldOut  (Boolean)  — secondary "force sold-out" flag
 *   stock    (Number)   — numeric quantity
 *
 * Meta only accepts exactly two values: "in stock" | "out of stock".
 * A product is in stock ONLY when ALL three conditions pass.
 */
const getAvailability = (product) => {
    // Generate Meta availability solely from stock. 
    // Hidden products (isVisible: false) must still exist in catalog to prevent Pixel ID mismatch.
    if (product.stock <= 0)  return 'out of stock';
    return 'in stock';
};

/**
 * Normalise an image URL.
 * product.images contains absolute Cloudinary URLs already (e.g. https://res.cloudinary.com/…).
 * If somehow a relative path slips through, we prepend the store origin.
 */
const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Relative path guard — convert to absolute
    return `https://harlon.shop${url.startsWith('/') ? '' : '/'}${url}`;
};

// ── Controller ────────────────────────────────────────────────────────────────

export const getCatalogFeed = async (req, res) => {
    try {
        /**
         * FILTER — only products that SHOULD be advertised.
         *
         * isVisible: true  — product is published and customer-facing
         *
         * We intentionally do NOT filter on inStock/soldOut/stock here
         * so that Meta keeps out-of-stock items in the catalog.
         * Meta will automatically pause ads for them and reactivate
         * when stock is restored — this is the correct Catalog Sales behaviour.
         *
         * We DO exclude mystery-box products because they have no stable
         * product URL or image meaningful to the catalog.
         */
        const products = await Product.find(
            {
                productType: { $ne: 'mystery-box' }, // mystery boxes are not real SKUs
            },
            // Projection — only load the fields we actually use (lean query)
            {
                _id: 1,
                name: 1,
                description: 1,
                price: 1,
                originalPrice: 1,
                images: 1,
                stock: 1,
                category: 1,
            }
        ).lean();   // .lean() returns plain JS objects — ~2× faster, no Mongoose overhead

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n';
        xml += '  <channel>\n';
        xml += '    <title>Harlon Commerce Catalog</title>\n';
        xml += '    <link>https://harlon.shop</link>\n';
        xml += '    <description>Harlon Product Feed for Meta Commerce Manager</description>\n';

        for (const product of products) {
            const productId   = product._id.toString();
            const availability = getAvailability(product);

            // Product page URL — matches frontend route /product/:id exactly
            const link = `https://harlon.shop/product/${productId}`;

            // Image — first image in the array; must be an absolute URL for Meta
            const rawImage  = product.images?.[0] ?? '';
            const imageLink = rawImage ? resolveImageUrl(rawImage) : '';

            // Skip products with no image — Meta will reject items without g:image_link
            if (!imageLink) continue;

            // Description — strip control chars and clamp to Meta's 5000-char limit
            const description = product.description
                ? escapeXML(product.description.substring(0, 5000))
                : escapeXML(product.name);

            // Price mapping
            // Schema: price = selling price, originalPrice = crossed-out "was" price
            // Meta:   g:price = regular price, g:sale_price = sale price
            const hasDiscount =
                product.originalPrice &&
                product.originalPrice > product.price;

            const regularPriceLine = hasDiscount
                ? `      <g:price>${product.originalPrice.toFixed(2)} INR</g:price>\n`
                : `      <g:price>${product.price.toFixed(2)} INR</g:price>\n`;

            const salePriceLine = hasDiscount
                ? `      <g:sale_price>${product.price.toFixed(2)} INR</g:sale_price>\n`
                : '';

            xml += '    <item>\n';
            xml += `      <g:id>${productId}</g:id>\n`;
            xml += `      <g:title>${escapeXML(product.name)}</g:title>\n`;
            xml += `      <g:description>${description}</g:description>\n`;
            xml += `      <g:availability>${availability}</g:availability>\n`;
            xml += `      <g:condition>new</g:condition>\n`;
            xml += `      <g:link>${link}</g:link>\n`;
            xml += `      <g:image_link>${escapeXML(imageLink)}</g:image_link>\n`;
            xml += `      <g:brand>Harlon</g:brand>\n`;
            // 212 = Apparel & Accessories > Clothing > Shirts & Tops
            xml += `      <g:google_product_category>212</g:google_product_category>\n`;
            xml += regularPriceLine;
            xml += salePriceLine;
            xml += '    </item>\n';
        }

        xml += '  </channel>\n';
        xml += '</rss>';

        res.set('Content-Type', 'application/xml; charset=utf-8');
        // Cache for 1 hour — lets Meta's crawler re-use the response and reduces DB load
        res.set('Cache-Control', 'public, max-age=3600');
        return res.status(200).send(xml);

    } catch (error) {
        console.error('[Meta Catalog Feed] Error:', error);
        res.status(500).json({ success: false, message: 'Server error generating feed' });
    }
};
