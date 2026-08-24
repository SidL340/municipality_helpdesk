import { Router } from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Multer upload directory
const uploadsDir = path.join(__dirname, '..', 'uploads', 'forms');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM admin_users WHERE username = ? AND is_active = 1', [username]);
    if (users.length === 0) return res.status(401).json({ error: 'प्रयोगकर्ता नाम वा पासवर्ड मिलेन (Invalid credentials)' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'प्रयोगकर्ता नाम वा पासवर्ड मिलेन (Invalid credentials)' });

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      municipality_name: user.municipality_name,
      ward_number: user.ward_number,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role || 'ward_admin',
        municipality_name: user.municipality_name,
        ward_number: user.ward_number,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, full_name, role, municipality_name, ward_number, email, phone FROM admin_users WHERE id = ?', [req.user.id]);
    res.json(users[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/profile — Update Profile & Password
router.post('/profile', authenticateToken, async (req, res) => {
  const { full_name, email, phone, current_password, new_password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = users[0];

    // If changing password, verify current password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'हालको पासवर्ड (Current password) आवश्यक छ' });
      }
      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) {
        return res.status(400).json({ error: 'हालको पासवर्ड मिलेन (Incorrect current password)' });
      }
      const newHash = await bcrypt.hash(new_password, 10);
      await pool.query(
        'UPDATE admin_users SET full_name = ?, email = ?, phone = ?, password_hash = ? WHERE id = ?',
        [full_name || user.full_name, email || null, phone || null, newHash, user.id]
      );
    } else {
      await pool.query(
        'UPDATE admin_users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
        [full_name || user.full_name, email || null, phone || null, user.id]
      );
    }

    const [updated] = await pool.query('SELECT id, username, full_name, role, municipality_name, ward_number, email, phone FROM admin_users WHERE id = ?', [user.id]);

    res.json({
      success: true,
      message: 'प्रोफाइल सफलतापूर्वक अद्यावधिक भयो (Profile updated successfully)',
      user: updated[0],
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= USER PROVISIONING & ADMIN MANAGEMENT =================

// GET /api/admin/users — List all ward admins, municipality admins, and operators
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, full_name, role, municipality_name, ward_number, email, phone, is_active, created_at FROM admin_users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/users — Provision new Ward Admin / Municipality / Operator
router.post('/users', authenticateToken, async (req, res) => {
  const { username, password, full_name, role, municipality_name, ward_number, email, phone } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM admin_users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'यो प्रयोगकर्ता नाम पहिल्यै प्रयोगमा छ (Username already taken)' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO admin_users (username, password_hash, full_name, role, municipality_name, ward_number, email, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [username, hash, full_name || 'वडा प्रशासक', role || 'ward_admin', municipality_name || null, ward_number || null, email || null, phone || null]
    );

    // Auto-create ward_info profile if this is a ward_admin
    if (ward_number) {
      const [existingWard] = await pool.query('SELECT id FROM ward_info WHERE ward_number = ?', [ward_number]);
      if (existingWard.length === 0) {
        await pool.query(
          `INSERT INTO ward_info (ward_number, ward_name_np, ward_name_en, municipality_np, municipality_en, phone, secretary_name_np, secretary_phone, office_hours_np)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, '१०:०० - ५:००')`,
          [
            ward_number,
            `वडा नं. ${ward_number} कार्यालय`,
            `Ward No. ${ward_number} Office`,
            municipality_name || 'काठमाडौं महानगरपालिका',
            municipality_name || 'Kathmandu Metropolitan City',
            phone || '०१-४२३४५६७',
            full_name || 'वडा सचिव',
            phone || '',
          ]
        );
      }
    }

    res.status(201).json({ id: result.insertId, message: 'Admin account created successfully' });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/users/:id/reset-password
router.post('/users/:id/reset-password', authenticateToken, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password) return res.status(400).json({ error: 'New password is required' });

  try {
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ error: 'आफ्नै खाता मेटाउन मिल्दैन (Cannot delete your own account)' });
    }
    await pool.query('DELETE FROM admin_users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= WARD SELF-REGISTRATION WORKFLOW =================

// POST /api/admin/ward-registrations — Public endpoint for new ward registration request
router.post('/ward-registrations', async (req, res) => {
  const { municipality_name, ward_number, applicant_name, applicant_phone, applicant_email, applicant_role, notes } = req.body;

  if (!municipality_name || !ward_number || !applicant_name || !applicant_phone) {
    return res.status(400).json({ error: 'सबै अनिवार्य विवरण भर्नुहोस् (All required fields must be filled)' });
  }

  try {
    // Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ward_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        municipality_name TEXT NOT NULL,
        ward_number INTEGER NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_phone TEXT NOT NULL,
        applicant_email TEXT,
        applicant_role TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [result] = await pool.query(
      `INSERT INTO ward_registrations (municipality_name, ward_number, applicant_name, applicant_phone, applicant_email, applicant_role, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [municipality_name, ward_number, applicant_name, applicant_phone, applicant_email || null, applicant_role || 'वडा सचिव', notes || null]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'वडा दर्ता अनुरोध प्राप्त भयो। प्राविधिक प्रमुखले प्रमाणीकरण गरेपछि लगइन उपलब्ध हुनेछ।',
    });
  } catch (err) {
    console.error('Registration request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/ward-registrations — List pending onboarding requests
router.get('/ward-registrations', authenticateToken, async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ward_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        municipality_name TEXT NOT NULL,
        ward_number INTEGER NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_phone TEXT NOT NULL,
        applicant_email TEXT,
        applicant_role TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await pool.query('SELECT * FROM ward_registrations ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/ward-registrations/:id/approve — Approve & create login
router.post('/ward-registrations/:id/approve', authenticateToken, async (req, res) => {
  const { generated_username, initial_password } = req.body;

  try {
    const [reg] = await pool.query('SELECT * FROM ward_registrations WHERE id = ?', [req.params.id]);
    if (reg.length === 0) return res.status(404).json({ error: 'Request not found' });

    const request = reg[0];
    const username = generated_username || `ward${request.ward_number}`;
    const password = initial_password || 'ward1234';

    const hash = await bcrypt.hash(password, 10);

    // Create admin user for the approved ward
    await pool.query(
      `INSERT INTO admin_users (username, password_hash, full_name, role, municipality_name, ward_number, email, phone, is_active)
       VALUES (?, ?, ?, 'ward_admin', ?, ?, ?, ?, 1)`,
      [username, hash, request.applicant_name, request.municipality_name, request.ward_number, request.applicant_email, request.applicant_phone]
    );

    // Auto-create or update ward_info profile so all services & documents are instantly active
    const [existingWard] = await pool.query('SELECT id FROM ward_info WHERE ward_number = ?', [request.ward_number]);
    if (existingWard.length === 0) {
      await pool.query(
        `INSERT INTO ward_info (ward_number, ward_name_np, ward_name_en, municipality_np, municipality_en, phone, secretary_name_np, secretary_phone, office_hours_np)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, '१०:०० - ५:००')`,
        [
          request.ward_number,
          `वडा नं. ${request.ward_number} कार्यालय`,
          `Ward No. ${request.ward_number} Office`,
          request.municipality_name,
          request.municipality_name,
          request.applicant_phone,
          request.applicant_name,
          request.applicant_phone,
        ]
      );
    }

    // Update status
    await pool.query('UPDATE ward_registrations SET status = "approved" WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Ward registration approved and admin login generated. All 60 services & document checklists are instantly active.',
      credentials: {
        username,
        initialPassword: password,
      },
    });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
});

// DELETE /api/admin/ward-registrations/:id — Delete registration request
router.delete('/ward-registrations/:id', authenticateToken, async (req, res) => {
  try {
    const [reg] = await pool.query('SELECT * FROM ward_registrations WHERE id = ?', [req.params.id]);
    if (reg.length === 0) return res.status(404).json({ error: 'Request not found' });

    const request = reg[0];

    // Delete the registration request
    await pool.query('DELETE FROM ward_registrations WHERE id = ?', [req.params.id]);

    // If requested, also remove the associated ward account and ward_info
    if (req.query.deleteWard === 'true' && request.ward_number) {
      await pool.query('DELETE FROM admin_users WHERE ward_number = ?', [request.ward_number]);
      await pool.query('DELETE FROM ward_info WHERE ward_number = ?', [request.ward_number]);
    }

    res.json({ message: 'दर्ता अनुरोध सफलतापूर्वक मेटाइयो (Registration request deleted successfully)' });
  } catch (err) {
    console.error('Delete registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= CATEGORIES CRUD =================
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(s.id) as service_count
      FROM categories c
      LEFT JOIN services s ON s.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/categories', authenticateToken, async (req, res) => {
  const { name_np, name_en, name_mai, name_bho, name_new, icon, sort_order, is_active } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name_np, name_en, name_mai, name_bho, name_new, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name_np, name_en, name_mai || null, name_bho || null, name_new || null, icon || 'file-text', sort_order || 0, is_active !== false ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Category created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/categories/:id', authenticateToken, async (req, res) => {
  const { name_np, name_en, name_mai, name_bho, name_new, icon, sort_order, is_active } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name_np = ?, name_en = ?, name_mai = ?, name_bho = ?, name_new = ?, icon = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [name_np, name_en, name_mai || null, name_bho || null, name_new || null, icon, sort_order, is_active ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/categories/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= SERVICES CRUD =================
router.get('/services', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, c.name_np as category_name_np, c.name_en as category_name_en, d.name as desk_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN desks d ON s.desk_id = d.id
      ORDER BY s.category_id ASC, s.sort_order ASC, s.id ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/services', authenticateToken, async (req, res) => {
  const { category_id, name_np, name_en, name_mai, name_bho, name_new, description_np, description_en, fee_np, fee_en, processing_time_np, processing_time_en, desk_id, is_active, allow_token, allow_form_print, sort_order } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO services (category_id, name_np, name_en, name_mai, name_bho, name_new, description_np, description_en, fee_np, fee_en, processing_time_np, processing_time_en, desk_id, is_active, allow_token, allow_form_print, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name_np, name_en, name_mai || null, name_bho || null, name_new || null, description_np || null, description_en || null, fee_np || null, fee_en || null, processing_time_np || null, processing_time_en || null, desk_id || null, is_active !== false ? 1 : 0, allow_token !== false ? 1 : 0, allow_form_print ? 1 : 0, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Service created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/services/:id', authenticateToken, async (req, res) => {
  const { category_id, name_np, name_en, name_mai, name_bho, name_new, description_np, description_en, fee_np, fee_en, processing_time_np, processing_time_en, desk_id, is_active, allow_token, allow_form_print, sort_order } = req.body;
  try {
    await pool.query(
      `UPDATE services SET category_id = ?, name_np = ?, name_en = ?, name_mai = ?, name_bho = ?, name_new = ?, description_np = ?, description_en = ?,
       fee_np = ?, fee_en = ?, processing_time_np = ?, processing_time_en = ?, desk_id = ?, is_active = ?, allow_token = ?, allow_form_print = ?, sort_order = ? WHERE id = ?`,
      [category_id, name_np, name_en, name_mai || null, name_bho || null, name_new || null, description_np, description_en, fee_np, fee_en, processing_time_np, processing_time_en, desk_id || null, is_active ? 1 : 0, allow_token ? 1 : 0, allow_form_print ? 1 : 0, sort_order, req.params.id]
    );
    res.json({ message: 'Service updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/services/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= DOCUMENTS CRUD =================
router.get('/services/:serviceId/documents', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM documents WHERE service_id = ? ORDER BY sort_order ASC, id ASC', [req.params.serviceId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/services/:serviceId/documents', authenticateToken, async (req, res) => {
  const { name_np, name_en, name_mai, name_bho, name_new, note_np, note_en, sort_order, is_required } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO documents (service_id, name_np, name_en, name_mai, name_bho, name_new, note_np, note_en, sort_order, is_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.serviceId, name_np, name_en, name_mai || null, name_bho || null, name_new || null, note_np || null, note_en || null, sort_order || 0, is_required !== false ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Document added' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/documents/:id', authenticateToken, async (req, res) => {
  const { name_np, name_en, name_mai, name_bho, name_new, note_np, note_en, sort_order, is_required } = req.body;
  try {
    await pool.query(
      'UPDATE documents SET name_np = ?, name_en = ?, name_mai = ?, name_bho = ?, name_new = ?, note_np = ?, note_en = ?, sort_order = ?, is_required = ? WHERE id = ?',
      [name_np, name_en, name_mai || null, name_bho || null, name_new || null, note_np, note_en, sort_order, is_required ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Document updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/documents/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= DESKS CRUD =================
router.get('/desks', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM desks ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/desks', authenticateToken, async (req, res) => {
  const { name, location, is_active } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO desks (name, location, is_active) VALUES (?, ?, ?)',
      [name, location || null, is_active !== false ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Desk created' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/desks/:id', authenticateToken, async (req, res) => {
  const { name, location, is_active } = req.body;
  try {
    await pool.query('UPDATE desks SET name = ?, location = ?, is_active = ? WHERE id = ?', [name, location, is_active ? 1 : 0, req.params.id]);
    res.json({ message: 'Desk updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/desks/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM desks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Desk deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= WARD INFO =================
router.get('/ward-info', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ward_info LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/ward-info', authenticateToken, async (req, res) => {
  const fields = [
    'ward_name_np', 'ward_name_en', 'ward_name_mai', 'ward_name_new',
    'municipality_np', 'municipality_en', 'municipality_mai', 'municipality_new',
    'district_np', 'district_en', 'province_np', 'province_en',
    'address_np', 'address_en', 'phone', 'phone2', 'email', 'website',
    'chairperson_name_np', 'chairperson_name_en', 'chairperson_phone',
    'secretary_name_np', 'secretary_name_en', 'secretary_phone',
    'office_hours_np', 'office_hours_en', 'logo_url'
  ];

  try {
    const [existing] = await pool.query('SELECT id FROM ward_info LIMIT 1');
    const values = fields.map(f => req.body[f] || null);

    if (existing.length === 0) {
      const placeholders = fields.map(() => '?').join(', ');
      await pool.query(`INSERT INTO ward_info (${fields.join(', ')}) VALUES (${placeholders})`, values);
    } else {
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      await pool.query(`UPDATE ward_info SET ${setClause} WHERE id = ?`, [...values, existing[0].id]);
    }
    res.json({ message: 'Ward details updated' });
  } catch (err) {
    console.error('Ward update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
