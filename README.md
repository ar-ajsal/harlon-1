# Harlon — Football Jersey E-Commerce

A production-ready MERN-stack e-commerce store for football jerseys, featuring guest checkout, Razorpay payments, order tracking, and admin management.

---

## Architecture

```
harlon-1/
├── frontend/     # React + Vite (deployed on Vercel)
└── backend/      # Express.js + MongoDB (deployed on Render)
```

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Framer Motion, React Router v6 |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |
| Payments | Razorpay (orders + webhook) |
| Email | Nodemailer (Gmail SMTP or App Password) |
| Images | Cloudinary |

---

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SITE_URL` | Public frontend URL (e.g. `https://harlon.shop`) — used in order email links |
| `FRONTEND_URL` | CORS origin (same as `SITE_URL` in production) |
| `JWT_SECRET` | Secret for admin JWT tokens |
| `ADMIN_PASSWORD` | Legacy admin login password |
| `ADMIN_SECRET` | Secret header for `/api/guest-admin/*` routes — must match `VITE_ADMIN_SECRET` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (from Dashboard → API Keys) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret (see setup below) |
| `SMTP_HOST` | SMTP host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (usually `587`) |
| `SMTP_USER` | SMTP email address |
| `SMTP_PASS` | SMTP password / Gmail App Password |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `https://your-app.onrender.com/api`) |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number with country code, no `+` (e.g. `919876543210`) |
| `VITE_ADMIN_SECRET` | Must match `ADMIN_SECRET` in backend |

---

## Razorpay Webhook Setup

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → Webhooks → Add New Webhook**
3. **Webhook URL:** `https://your-render-url.onrender.com/api/payment/webhook`
4. **Secret:** Use the same value as `RAZORPAY_WEBHOOK_SECRET` in your backend `.env`
5. **Active Events:** Check `payment.captured` (and optionally `payment.authorized`)
6. Save — Razorpay will POST to this URL on every successful payment

> **Local testing:** Use [ngrok](https://ngrok.com) to expose `localhost:5000` and register the ngrok URL as a temporary webhook in the Razorpay dashboard.

---

## Guest Checkout Flow

```
Customer fills form → POST /api/guest-orders/create
  ↓ razorpay method
Razorpay modal opens → Customer pays
  ↓
Razorpay POST /api/payment/webhook (payment.captured)
  → Order marked paid, stock decremented, confirmation email sent
  ↓
Customer can track at /track-order?token=<trackToken>
```

```
  ↓ whatsapp method
Order saved (pending) → Customer receives WhatsApp message from admin
```

---

## Admin Order Management

- Admin panel: `/admin/guest-orders`
- Protected by `X-Admin-Secret` header (set `VITE_ADMIN_SECRET` in frontend)
- Per-order modal: update delivery status, enter courier details, trigger WhatsApp message
- Email sent automatically on `shipped`, `out-for-delivery`, and `delivered`

---

## Deployment

### Render (Backend)
1. Create a new **Web Service** pointing to the `backend/` directory
2. Build command: `npm install`
3. Start command: `node src/server.js` (or `npm start`)
4. Add all backend env vars in the Render dashboard
5. Set Node version ≥ 18 via `RENDER_NODE_VERSION=20` env var if needed

### Vercel (Frontend)
1. Import the repo and set **Root Directory** to `frontend`
2. Build command: `npm run build`, Output: `dist`
3. Add all frontend env vars in the Vercel dashboard

---

## Demo Script

```bash
# 1. Create a test order (WhatsApp method — no Razorpay required)
curl -X POST https://your-render-url.onrender.com/api/guest-orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<real_product_id_from_mongo>",
    "size": "M",
    "paymentMethod": "whatsapp",
    "customer": {
      "firstName": "Test", "lastName": "User",
      "email": "test@example.com", "phone": "9876543210",
      "streetAddress": "123 Main St", "city": "Mumbai",
      "state": "Maharashtra", "pinCode": "400001"
    }
  }'

# 2. Track the order by email + orderId
curl "https://your-render-url.onrender.com/api/guest-orders/track?email=test@example.com&orderId=HRL-xxx"

# 3. Admin: mark as shipped (triggers email)
curl -X PATCH https://your-render-url.onrender.com/api/guest-admin/orders/HRL-xxx/delivery \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: <your_ADMIN_SECRET>" \
  -d '{"deliveryStatus":"shipped","note":"Shipped via Delhivery","courier":{"name":"Delhivery","trackingNumber":"DEL123456"}}'
```
