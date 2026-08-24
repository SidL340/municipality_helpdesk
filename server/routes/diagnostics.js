import { Router } from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { printToken } from '../utils/printer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// GET /api/admin/diagnostics/system-health
router.get('/system-health', authenticateToken, async (req, res) => {
  try {
    const [servicesCount] = await pool.query('SELECT COUNT(*) as count FROM services');
    const [docsCount] = await pool.query('SELECT COUNT(*) as count FROM documents');
    const [tokensCount] = await pool.query('SELECT COUNT(*) as count FROM tokens');
    const [usersCount] = await pool.query('SELECT COUNT(*) as count FROM admin_users');
    const [todayTokens] = await pool.query('SELECT COUNT(*) as count FROM tokens WHERE token_date = date("now")');

    // SQLite / Database file size check
    let dbSizeMB = 'N/A';
    const dbPath = path.join(__dirname, '..', '..', 'database', 'ward_kiosk.sqlite');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      dbSizeMB = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';
    }

    const freeMemMB = (os.freemem() / (1024 * 1024)).toFixed(0);
    const totalMemMB = (os.totalmem() / (1024 * 1024)).toFixed(0);
    const uptimeHours = (process.uptime() / 3600).toFixed(1);

    res.json({
      status: 'healthy',
      database: {
        engine: process.env.DB_TYPE || 'sqlite',
        size: dbSizeMB,
        totalServices: servicesCount[0]?.count || 0,
        totalDocuments: docsCount[0]?.count || 0,
        totalTokensGenerated: tokensCount[0]?.count || 0,
        todayTokens: todayTokens[0]?.count || 0,
        totalAdmins: usersCount[0]?.count || 0,
      },
      server: {
        nodeVersion: process.version,
        platform: os.platform(),
        architecture: os.arch(),
        memoryUsage: `${(totalMemMB - freeMemMB)} MB / ${totalMemMB} MB`,
        uptime: `${uptimeHours} hours`,
        printerConfigured: process.env.PRINTER_NAME || 'default',
        port: process.env.PORT || 5000,
      },
    });
  } catch (err) {
    console.error('Diagnostic error:', err);
    res.status(500).json({ error: 'Failed to retrieve diagnostics' });
  }
});

// POST /api/admin/diagnostics/test-print — Sends a test token slip to laser printer
router.post('/test-print', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const printResult = await printToken({
      tokenNumber: 999,
      deskName: 'DIAGNOSTIC TEST COUNTER',
      serviceName: 'Laser Printer Hardware Diagnostic Test',
      serviceNameNp: 'प्राविधिक प्रिन्टर परीक्षण',
      wardName: 'प्राविधिक नियन्त्रण केन्द्र (Tech Control)',
      municipalityName: 'Smart Ward Kiosk System',
      date: today,
    });

    res.json({
      success: true,
      message: 'Diagnostic test slip dispatched to Laser Printer.',
      filePath: printResult,
    });
  } catch (err) {
    console.error('Test print error:', err);
    res.status(500).json({ error: err.message || 'Printer diagnostic failed' });
  }
});

export default router;
