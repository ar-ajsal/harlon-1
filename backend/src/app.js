import express from 'express';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import passport from 'passport';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Trust Render's proxy so rate-limit and IP detection work correctly
app.set('trust proxy', 1);

// Gzip compression — reduces API payloads 60-80%
app.use(compression({
  threshold: 1024, // only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));


// CORS - Allow your Vercel frontend and local development
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'https://harlon-1.vercel.app',
    'https://harlon.shop',        // ✅ remove trailing slash
    'https://www.harlon.shop',    // ✅ ADD THIS (very important)
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ].filter(Boolean),
  credentials: true
};

app.use(cors(corsOptions));


// Body parsing with increased limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session (required for Passport OAuth flow only; we use JWT for API auth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 10 * 60 * 1000 }, // 10 min (just for OAuth redirect)
}));
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint (useful for Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
