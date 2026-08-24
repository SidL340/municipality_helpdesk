import { Router } from 'express';
import pool from '../config/db.js';
import { printToken, printForm } from '../utils/printer.js';

const router = Router();

// POST /api/tokens — Generate queue token and trigger silent laser print
router.post('/', async (req, res) => {
  const { serviceId, language, wardNumber = 1 } = req.body;

  if (!serviceId) {
    return res.status(400).json({ error: 'serviceId is required' });
  }

  try {
    const [service] = await pool.query(`
      SELECT s.*, d.name as desk_name, d.location as desk_location
      FROM services s
      LEFT JOIN desks d ON s.desk_id = d.id
      WHERE s.id = ? AND s.is_active = TRUE
    `, [serviceId]);

    if (service.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (!service[0].allow_token) {
      return res.status(400).json({ error: 'Token generation not enabled for this service' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Auto incrementing daily sequence per ward
    const [maxToken] = await pool.query(
      'SELECT COALESCE(MAX(token_number), 0) as max_token FROM tokens WHERE token_date = ? AND ward_number = ?',
      [today, wardNumber]
    );

    const nextToken = maxToken[0].max_token + 1;

    const [result] = await pool.query(
      'INSERT INTO tokens (service_id, desk_id, token_number, token_date, language_used, ward_number) VALUES (?, ?, ?, ?, ?, ?)',
      [serviceId, service[0].desk_id, nextToken, today, language || 'np', wardNumber]
    );

    // Fetch ward info for printout header
    const [wardInfo] = await pool.query('SELECT ward_name_np, municipality_np FROM ward_info WHERE ward_number = ? LIMIT 1', [wardNumber]);
    const wardName = wardInfo.length > 0 ? wardInfo[0].ward_name_np : `वडा नं. ${wardNumber} कार्यालय`;
    const municipalityName = wardInfo.length > 0 ? wardInfo[0].municipality_np : 'नगरपालिका';

    // Silent Laser Print dispatch
    printToken({
      tokenNumber: nextToken,
      deskName: service[0].desk_name || 'काउन्टर १',
      serviceName: service[0].name_en,
      serviceNameNp: service[0].name_np,
      wardName,
      municipalityName,
      date: today,
    }).catch(err => console.error('Silent print trigger failed:', err.message));

    res.status(201).json({
      id: result.insertId,
      token_number: nextToken,
      service_id: serviceId,
      service_name_np: service[0].name_np,
      service_name_en: service[0].name_en,
      desk_name: service[0].desk_name,
      desk_location: service[0].desk_location,
      created_at: new Date(),
    });
  } catch (err) {
    console.error('Error creating token:', err);
    res.status(500).json({ error: 'Server error creating token' });
  }
});

// POST /api/tokens/print-form
router.post('/print-form', async (req, res) => {
  const { formId, serviceName } = req.body;

  if (!formId) {
    return res.status(400).json({ error: 'formId is required' });
  }

  try {
    const [form] = await pool.query('SELECT * FROM forms WHERE id = ? AND is_active = TRUE', [formId]);
    if (form.length === 0) return res.status(404).json({ error: 'Form not found' });

    printForm({
      nameNp: form[0].name_np,
      nameEn: form[0].name_en,
      serviceNameNp: serviceName || 'वडा सेवा',
      content: form[0].content,
    }).catch(err => console.error('Silent print form failed:', err.message));

    res.json({ message: 'Form dispatched to laser printer' });
  } catch (err) {
    console.error('Error printing form:', err);
    res.status(500).json({ error: 'Server error printing form' });
  }
});

export default router;
