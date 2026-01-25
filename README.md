# Harlon E-Commerce

A full-stack e-commerce website for football jerseys.

## Project Structure

```
www.redcaard.com/
├── frontend/       # React + Vite frontend
├── backend/        # Express.js + MongoDB backend
└── README.md
```

## Frontend

React application with Vite.

### Setup
```bash
cd frontend
npm install
npm run dev
```

### Build
```bash
npm run build
```

## Backend

Express.js server with MongoDB and Cloudinary.

### Setup
```bash
cd backend
npm install
npm run dev
```

### Environment Variables (backend/.env)
```env
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
ADMIN_PASSWORD=your_password
```

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
