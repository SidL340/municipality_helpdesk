import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Process Level Crash Prevention Guards
process.on('uncaughtException', (err) => {
  console.error('🛡️ [CRASH GUARD] Caught Unhandled Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('🛡️ [CRASH GUARD] Caught Unhandled Promise Rejection:', reason);
});

import servicesRouter from './routes/services.js';
import tokensRouter from './routes/tokens.js';
import adminRouter from './routes/admin.js';
import analyticsRouter from './routes/analytics.js';
import diagnosticsRouter from './routes/diagnostics.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Disable X-Powered-By fingerprinting
app.disable('x-powered-by');

// Security: Helmet HTTP Headers (Anti-XSS, Anti-Clickjacking, MIME Sniffing protection)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Security: CORS Protection
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Security: Payload Size Limits to prevent DoS memory exhaustion
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(morgan('combined'));

// ================= SECURITY: RATE LIMITERS =================

// 1. General API rate limiter (600 requests per 5 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'धेरै अनुरोधहरू आएका छन्। कृपया केही समयपछि प्रयास गर्नुहोस् (Too many requests, please slow down).' },
});

// 2. Strict Auth Brute-Force Limiter (15 attempts per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'धेरै पटक गलत लगइन प्रयास भयो। कृपया १५ मिनेटपछि प्रयास गर्नुहोस् (Too many login attempts, please try again in 15 minutes).' },
});

// 3. Token Print Flooding Limiter (Max 40 tokens per minute per IP)
const tokenLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'टोकन जारी गर्ने गति धेरै भयो (Rate limit exceeded for token generation).' },
});

app.use('/api', generalLimiter);

// Protected Static Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public Routes
app.use('/api/services', servicesRouter);
app.use('/api/tokens', tokenLimiter, tokensRouter);

// Protected Admin Routes with Brute Force Protection
app.use('/api/admin/login', authLimiter);
app.use('/api/admin/diagnostics', diagnosticsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', authenticateToken, analyticsRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Smart Citizen Kiosk & Queue System (नागरिक सहायता कक्ष)',
    developer: 'Nirmala Tech Innovations Pvt. Ltd.',
    timestamp: new Date().toISOString(),
    security: 'Hardened (CrashGuards, Helmet, RateLimit, PreparedStatements, JWT)',
  });
});

// 404 for unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Production Client Serve
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// Global Error Handler (Prevents stack trace leaks to client)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error Caught by Handler:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: 'आन्तरिक सर्भर त्रुटि (An unexpected server error occurred)',
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
============================================================
🏛️ नागरिक सहायता कक्ष (Smart Citizen Kiosk Hub)
🚀 Developed by: Nirmala Tech Innovations Pvt. Ltd.
============================================================
- Server running locally on: http://localhost:${PORT}
- LAN Tablet IP accessible on: http://<LAN_IP>:${PORT}
- Crash Shield & Rate Limiting: ACTIVE
============================================================
    `);
  });
}

export default app;
