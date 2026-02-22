import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://harlon.shop';
const BRAND = 'Harlon';

function trackLink(order) {
  if (order.trackToken) return `${SITE_URL}/track-order?token=${order.trackToken}`;
  return `${SITE_URL}/track-order?orderId=${order.orderId}&email=${encodeURIComponent(order.customer?.email || '')}`;
}

function baseLayout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr><td style="background:#111827;padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;text-transform:uppercase;">${BRAND}</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          ${bodyHtml}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f3f4f6;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 ${BRAND} — All rights reserved</p>
          <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">
            Questions? <a href="https://wa.me/919998887776" style="color:#6366f1;">WhatsApp us</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btnHtml(label, url) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">${label}</a>`;
}

function productRow(order) {
  const p = order.product || {};
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#f9fafb;border-radius:8px;padding:16px;">
      <tr>
        ${p.image ? `<td style="width:72px;vertical-align:top;"><img src="${p.image}" alt="" width="64" height="64" style="border-radius:6px;object-fit:cover;"></td>` : ''}
        <td style="padding-left:${p.image ? '16px' : '0'};vertical-align:top;">
          <p style="margin:0 0 4px;font-weight:700;color:#111827;font-size:15px;">${p.name || 'Jersey'}</p>
          <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Size: <strong>${p.size || '—'}</strong></p>
          <p style="margin:0;color:#111827;font-weight:700;font-size:16px;">₹${order.amount || p.price || '—'}</p>
        </td>
      </tr>
    </table>`;
}

/**
 * Send an order-related email.
 * @param {'paid'|'shipped'|'delivered'} type
 * @param {object} order — GuestOrder document
 */
export async function sendOrderEmail(type, order) {
  if (!process.env.SMTP_USER) {
    console.warn('[mailer] SMTP_USER not set — skipping email.');
    return;
  }

  const firstName = order.customer?.firstName || order.customer?.name || 'Customer';
  const { orderId } = order;
  const link = trackLink(order);

  let subject, html;

  if (type === 'paid') {
    subject = `✅ Order Confirmed — ${orderId}`;
    html = baseLayout(`Order Confirmed — ${orderId}`, `
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${firstName}, your order is confirmed! 🎉</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;">We've received your payment and are preparing your order. You'll get another update once it ships.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #e5e7eb;">
            <tr>
              <td style="padding-top:12px;color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Order ID</td>
            </tr>
            <tr><td style="color:#111827;font-size:16px;font-weight:700;font-family:monospace;">${orderId}</td></tr>
          </table>
          ${productRow(order)}
          ${btnHtml('Track My Order →', link)}
          <p style="margin-top:24px;color:#9ca3af;font-size:13px;">Or copy this link: <a href="${link}" style="color:#6366f1;">${link}</a></p>
        `);
  }

  else if (type === 'shipped') {
    const c = order.courier || {};
    const courierBlock = (c.name || c.trackingNumber) ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#eff6ff;border-radius:8px;padding:16px;">
            <tr><td>
              <p style="margin:0 0 6px;color:#1d4ed8;font-weight:700;font-size:14px;">📦 Shipment Details</p>
              ${c.name ? `<p style="margin:0 0 4px;color:#374151;font-size:14px;">Courier: <strong>${c.name}</strong></p>` : ''}
              ${c.trackingNumber ? `<p style="margin:0 0 4px;color:#374151;font-size:14px;">Tracking No: <strong>${c.trackingNumber}</strong></p>` : ''}
              ${c.url ? `<p style="margin:0;font-size:13px;"><a href="${c.url}" style="color:#6366f1;">Track on courier website →</a></p>` : ''}
            </td></tr>
          </table>` : '';
    subject = `🚚 Your Order ${orderId} Has Shipped!`;
    html = baseLayout(`Order Shipped — ${orderId}`, `
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${firstName}, your order is on the way! 🚚</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;">Great news — your order <strong>${orderId}</strong> has been shipped and is heading to you.</p>
          ${courierBlock}
          ${productRow(order)}
          ${btnHtml('Track My Order →', link)}
        `);
  }

  else if (type === 'out-for-delivery') {
    subject = `🛵 Your Harlon order ${orderId} is out for delivery!`;
    html = baseLayout(`Out for Delivery — ${orderId}`, `
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${firstName}, your order is out for delivery! 🛵</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;">Your order <strong>${orderId}</strong> is with the delivery agent and arriving <strong>today</strong>. Please be available to receive it.</p>
          ${productRow(order)}
          ${btnHtml('Track My Order →', link)}
        `);
  }

  else if (type === 'delivered') {
    subject = `🎉 Delivered — Order ${orderId}`;
    html = baseLayout(`Delivered — ${orderId}`, `
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${firstName}, your order has arrived! 🎉</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;">Your order <strong>${orderId}</strong> has been delivered. We hope you love your new jersey!</p>
          ${productRow(order)}
          <div style="margin-top:24px;background:#f0fdf4;border-radius:8px;padding:16px;border:1px solid #bbf7d0;">
            <p style="margin:0;color:#166534;font-size:14px;">📸 Love it? Tag us on Instagram <strong>@harlon_official</strong> to be featured!</p>
          </div>
          ${btnHtml('View Your Order →', link)}
        `);
  }

  else {
    console.warn('[mailer] Unknown email type:', type);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND} Store" <${process.env.SMTP_USER}>`,
      to: order.customer?.email,
      subject,
      html,
      text: `${subject}\n\nTrack your order: ${link}`
    });
    console.log(`[mailer] Sent "${type}" email to ${order.customer?.email}`);
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message);
  }
}

export default transporter;
