import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/analytics/today — Live statistics for today (supports ?ward=XX)
router.get('/today', async (req, res) => {
  const { ward } = req.query;

  try {
    const today = new Date().toISOString().split('T')[0];

    const wardFilter = ward ? 'AND ward_number = ?' : '';
    const wardParam = ward ? [today, Number(ward)] : [today];

    const [totalResult] = await pool.query(
      `SELECT COUNT(*) as total FROM tokens WHERE token_date = ? ${wardFilter}`,
      wardParam
    );

    const [byService] = await pool.query(`
      SELECT s.name_np, s.name_en, COUNT(t.id) as count
      FROM tokens t
      JOIN services s ON t.service_id = s.id
      WHERE t.token_date = ? ${ward ? 'AND t.ward_number = ?' : ''}
      GROUP BY t.service_id
      ORDER BY count DESC
    `, wardParam);

    const [byDesk] = await pool.query(`
      SELECT d.name as desk_name, COUNT(t.id) as count
      FROM tokens t
      LEFT JOIN desks d ON t.desk_id = d.id
      WHERE t.token_date = ? ${ward ? 'AND t.ward_number = ?' : ''}
      GROUP BY t.desk_id
      ORDER BY count DESC
    `, wardParam);

    const [activeServices] = await pool.query('SELECT COUNT(*) as count FROM services WHERE is_active = TRUE');
    const [activeDesks] = await pool.query('SELECT COUNT(*) as count FROM desks WHERE is_active = TRUE');

    res.json({
      date: today,
      ward: ward || 'all',
      totalTokens: totalResult[0].total,
      activeServices: activeServices[0].count,
      activeDesks: activeDesks[0].count,
      byService,
      byDesk,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/peak-hours — Hourly footfall distribution (supports ?ward=XX)
router.get('/peak-hours', async (req, res) => {
  const { ward } = req.query;

  try {
    const today = new Date().toISOString().split('T')[0];
    const wardFilter = ward ? 'AND ward_number = ?' : '';
    const wardParam = ward ? [today, Number(ward)] : [today];

    const [rows] = await pool.query(`
      SELECT HOUR(created_at) as hour, COUNT(*) as count
      FROM tokens
      WHERE token_date = ? ${wardFilter}
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `, wardParam);

    const hourly = [];
    for (let h = 8; h <= 17; h++) {
      const found = rows.find(r => r.hour === h);
      hourly.push({
        hour: h,
        label: `${h}:00`,
        count: found ? found.count : 0,
      });
    }

    res.json(hourly);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/weekly — 7-day volume trend (supports ?ward=XX)
router.get('/weekly', async (req, res) => {
  const { ward } = req.query;

  try {
    const wardFilter = ward ? 'AND ward_number = ?' : '';
    const wardParam = ward ? [Number(ward)] : [];

    const [rows] = await pool.query(`
      SELECT token_date as date, COUNT(*) as count
      FROM tokens
      WHERE token_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ${wardFilter}
      GROUP BY token_date
      ORDER BY token_date ASC
    `, wardParam);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/analytics/recent-tokens — Live queue stream (supports ?ward=XX)
router.get('/recent-tokens', async (req, res) => {
  const { ward } = req.query;

  try {
    const wardFilter = ward ? 'WHERE t.ward_number = ?' : '';
    const wardParam = ward ? [Number(ward)] : [];

    const [rows] = await pool.query(`
      SELECT t.*, s.name_np as service_name_np, s.name_en as service_name_en, d.name as desk_name
      FROM tokens t
      JOIN services s ON t.service_id = s.id
      LEFT JOIN desks d ON t.desk_id = d.id
      ${wardFilter}
      ORDER BY t.created_at DESC
      LIMIT 25
    `, wardParam);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
