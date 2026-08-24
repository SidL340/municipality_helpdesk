import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// GET /api/services/wards — List all available wards in the municipality
router.get('/wards', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, ward_number, ward_name_np, ward_name_en, municipality_np, municipality_en, address_np, phone, chairperson_name_np, secretary_name_np FROM ward_info ORDER BY ward_number ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching wards:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/services/ward-info — Ward office profile (supports ?ward=32)
router.get('/ward-info', async (req, res) => {
  const { ward } = req.query;

  try {
    let rows;
    if (ward) {
      [rows] = await pool.query('SELECT * FROM ward_info WHERE ward_number = ? LIMIT 1', [ward]);
    }

    if (!rows || rows.length === 0) {
      [rows] = await pool.query('SELECT * FROM ward_info ORDER BY id ASC LIMIT 1');
    }

    if (rows.length === 0) return res.status(404).json({ error: 'Ward info not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching ward info:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/services/categories — List active service categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(s.id) as service_count
      FROM categories c
      LEFT JOIN services s ON s.category_id = c.id AND s.is_active = TRUE
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/services/categories/:id — List services in category
router.get('/categories/:id', async (req, res) => {
  try {
    const [category] = await pool.query('SELECT * FROM categories WHERE id = ? AND is_active = TRUE', [req.params.id]);
    if (category.length === 0) return res.status(404).json({ error: 'Category not found' });

    const [services] = await pool.query(`
      SELECT s.*, d.name as desk_name, d.location as desk_location
      FROM services s
      LEFT JOIN desks d ON s.desk_id = d.id
      WHERE s.category_id = ? AND s.is_active = TRUE
      ORDER BY s.sort_order ASC, s.id ASC
    `, [req.params.id]);

    res.json({ category: category[0], services });
  } catch (err) {
    console.error('Error fetching category services:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/services/ai-assist — AI Citizen Assistant Knowledge Engine
router.post('/ai-assist', async (req, res) => {
  const { query, language = 'np' } = req.body;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const cleanQuery = query.toLowerCase().trim();

    // Stopwords filter
    const stopWords = new Set(['के', 'के-के', 'कति', 'कहाँ', 'चाहिन्छ', 'गर्न', 'लाग्छ', 'लागि', 'र', 'नियम', 'शुल्क', 'कसरी', 'पर्छ', 'हो', 'बनाउन', 'लिन', 'तिर्ने', 'बुझाउने', 'तिर्न', 'the', 'is', 'what', 'how', 'to', 'for', 'in']);
    const rawWords = cleanQuery.split(/[\s,?.!]+/).filter(k => k.length > 1);
    const keywords = rawWords.filter(w => !stopWords.has(w));

    // Search services matching keywords in Nepali or English
    const [allServices] = await pool.query(`
      SELECT s.id, s.name_np, s.name_en, s.name_mai, s.name_bho, s.description_np, s.fee_np, s.processing_time_np,
             d.name as desk_name, d.location as desk_location, c.name_np as category_name
      FROM services s
      LEFT JOIN desks d ON s.desk_id = d.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.is_active = TRUE
    `);

    // Intent & Keyword Synonyms Map
    const INTENTS = [
      { trigger: ['व्यवसाय', 'व्यापार', 'पसल', 'उद्योग', 'फर्म', 'कम्पनी', 'business', 'shop'], matchCategory: 'व्यापार, उद्योग तथा पेसा', matchName: 'व्यापार' },
      { trigger: ['सम्पत्ति', 'कर', 'मालपोत', 'राजस्व', 'tax'], matchCategory: 'कर तथा राजस्व', matchName: 'सम्पत्ति कर' },
      { trigger: ['नक्सा', 'भवन', 'घर', 'building', 'map'], matchCategory: 'जग्गा, भवन तथा सम्पत्ति', matchName: 'घर नक्सा' },
      { trigger: ['भत्ता', 'जेष्ठ', 'वृद्ध', 'अपाङ्गता', 'एकल', 'allowance'], matchCategory: 'सामाजिक सुरक्षा भत्ता' },
      { trigger: ['नागरिकता', 'citizenship'], matchName: 'नागरिकता' },
      { trigger: ['जन्म', 'बच्चा', 'birth'], matchName: 'जन्मदर्ता' },
      { trigger: ['मृत्यु', 'मरेको', 'death'], matchName: 'मृत्युदर्ता' },
      { trigger: ['विवाह', 'बिहे', 'marriage'], matchName: 'विवाह दर्ता' },
      { trigger: ['सम्बन्ध विच्छेद', 'डिभोर्स', 'छोडपत्र', 'divorce'], matchName: 'सम्बन्ध विच्छेद' },
      { trigger: ['बसाइसराइ', 'बसाइ', 'migration'], matchName: 'बसाइसराइ' },
      { trigger: ['नाता', 'प्रमाणित', 'relation'], matchName: 'नाता प्रमाणित' },
      { trigger: ['चार किल्ला', 'चारकिल्ला'], matchName: 'चार किल्ला' },
      { trigger: ['अविवाहित', 'unmarried', 'single'], matchName: 'अविवाहित' },
      { trigger: ['राहदानी', 'पासपोर्ट', 'passport'], matchName: 'राहदानी' },
    ];

    let matched = null;
    let maxScore = 0;

    for (const s of allServices) {
      let score = 0;
      const sName = (s.name_np || '').toLowerCase();
      const sEn = (s.name_en || '').toLowerCase();
      const sCat = (s.category_name || '').toLowerCase();
      const sDesc = (s.description_np || '').toLowerCase();

      // 1. Direct query substring match
      if (cleanQuery.length > 3 && sName.includes(cleanQuery)) {
        score += 50;
      }

      // 2. Intent matching
      for (const intent of INTENTS) {
        const matchesIntent = intent.trigger.some(t => cleanQuery.includes(t));
        if (matchesIntent) {
          if (intent.matchName && sName.includes(intent.matchName)) score += 30;
          if (intent.matchCategory && sCat.includes(intent.matchCategory)) score += 15;
        }
      }

      // 3. Keyword matches
      for (const k of (keywords.length > 0 ? keywords : rawWords)) {
        if (sName.includes(k)) score += 10;
        if (sCat.includes(k)) score += 5;
        if (sDesc.includes(k)) score += 2;
        if (sEn.includes(k)) score += 5;
      }

      if (score > maxScore) {
        maxScore = score;
        matched = s;
      }
    }

    if (matched && maxScore > 0) {
      const [documents] = await pool.query(
        'SELECT name_np, name_en, note_np FROM documents WHERE service_id = ? ORDER BY sort_order ASC, id ASC',
        [matched.id]
      );

      const docList = documents.map((d, i) => `${i + 1}. ${d.name_np}${d.note_np ? ` (${d.note_np})` : ''}`).join('\n');
      const spokenDocs = documents.map(d => d.name_np).join(', ');

      const answer = `📋 **${matched.name_np}** सेवाको लागि आवश्यक विवरण:\n\n` +
        `• **श्रेणी:** ${matched.category_name}\n` +
        `• **सरकारी दस्तुर:** ${matched.fee_np || 'निःशुल्क'}\n` +
        `• **लाग्ने समय:** ${matched.processing_time_np || 'सोही दिन'}\n` +
        `• **सम्पर्क काउन्टर:** ${matched.desk_name || 'काउन्टर १'} ${matched.desk_location ? `(${matched.desk_location})` : ''}\n\n` +
        `📄 **आवश्यक कागजातहरू:**\n${docList || 'यस सेवाको लागि सिधै टोकन लिएर काउन्टरमा जानुहोस्।'}\n\n` +
        `💡 कृपया कियोस्कबाट **टोकन लिनुहोस्** र सम्बन्धित काउन्टरमा जानुहोस्।`;

      const spokenText = `${matched.name_np} को लागि आवश्यक कागजातहरू: ${spokenDocs}। सरकारी दस्तुर ${matched.fee_np || 'निःशुल्क'} हो र यो सेवा ${matched.desk_name || 'काउन्टर १'} बाट उपलब्ध हुनेछ।`;

      return res.json({
        found: true,
        answer,
        spokenText,
        service: {
          id: matched.id,
          name_np: matched.name_np,
          fee_np: matched.fee_np,
          processing_time_np: matched.processing_time_np,
          desk_name: matched.desk_name,
        },
      });
    }

    // Default polite guidance if no direct service match
    res.json({
      found: false,
      answer: `नमस्ते! म वडा नागरिक एआई सहायक हुँ।\n\nतपाईंले खोज्नुभएको सेवा सम्बन्धी जानकारी फेला परेन। कृपया सेवाको नाम (जस्तै: जन्मदर्ता, नागरिकता सिफारिस, जग्गा नामसारी, सम्पत्ति कर, वा जेष्ठ नागरिक भत्ता) लेखेर वा बोलेर सोध्नुहोस्, अथवा मुख्य पृष्ठमा रहेको श्रेणीहरूबाट सेवा छान्नुहोस्।`,
      spokenText: 'तपाईंले खोज्नुभएको सेवा फेला परेन। कृपया जन्मदर्ता, नागरिकता, वा सम्पत्ति कर जस्ता सेवाको नाम भन्नुहोस्।',
    });
  } catch (err) {
    console.error('AI Assist error:', err);
    res.status(500).json({ error: 'AI engine error' });
  }
});

// GET /api/services/:id — Get full service details with documents
router.get('/:id', async (req, res) => {
  try {
    const [service] = await pool.query(`
      SELECT s.*, d.name as desk_name, d.location as desk_location,
             c.name_np as category_name_np, c.name_en as category_name_en
      FROM services s
      LEFT JOIN desks d ON s.desk_id = d.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ? AND s.is_active = TRUE
    `, [req.params.id]);

    if (service.length === 0) return res.status(404).json({ error: 'Service not found' });

    const [documents] = await pool.query(
      'SELECT * FROM documents WHERE service_id = ? ORDER BY sort_order ASC, id ASC',
      [req.params.id]
    );

    const [forms] = await pool.query(
      'SELECT id, name_np, name_en, file_path FROM forms WHERE service_id = ? AND is_active = TRUE',
      [req.params.id]
    );

    res.json({
      ...service[0],
      documents,
      forms,
    });
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
