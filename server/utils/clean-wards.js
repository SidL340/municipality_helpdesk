import pool from '../config/db.js';

async function clean() {
  try {
    // 1. Add ward_number to tokens if not present
    try {
      await pool.query('ALTER TABLE tokens ADD COLUMN ward_number INTEGER DEFAULT 1');
    } catch (e) {
      // Column already exists
    }

    // 2. Clear old mock wards and set Brindaban Ward 1 as the active profile
    await pool.query('DELETE FROM ward_info');
    await pool.query(
      `INSERT INTO ward_info (
        ward_number, ward_name_np, ward_name_en, municipality_np, municipality_en,
        address_np, address_en, phone, chairperson_name_np, chairperson_name_en,
        secretary_name_np, secretary_name_en, secretary_phone, office_hours_np, office_hours_en
      ) VALUES (
        1,
        'वडा नं. १ कार्यालय',
        'Ward No. 1 Office',
        'वृन्दावन नगरपालिका',
        'Brindaban Municipality',
        'वृन्दावन - १, रौतहट',
        'Brindaban - 1, Rautahat',
        '९८१२२२५१०२',
        'अध्यक्ष',
        'Chairperson',
        'Gautam',
        'Gautam',
        '९८१२२२५१०२',
        '१०:०० - ५:००',
        '10:00 AM - 5:00 PM'
      )`
    );

    // 3. Keep only tech_admin and brindaban01 in admin_users
    await pool.query("DELETE FROM admin_users WHERE username NOT IN ('tech_admin', 'brindaban01')");

    // 4. Update tokens to ward 1
    await pool.query('UPDATE tokens SET ward_number = 1 WHERE ward_number IS NULL');

    const [users] = await pool.query('SELECT id, username, full_name, role, municipality_name, ward_number FROM admin_users');
    console.log('=== REMAINING ACTIVE USERS ===');
    console.table(users);

    const [wards] = await pool.query('SELECT id, ward_number, ward_name_np, municipality_np, secretary_name_np, phone FROM ward_info');
    console.log('=== REMAINING ACTIVE WARDS ===');
    console.table(wards);

    process.exit(0);
  } catch (err) {
    console.error('Clean error:', err);
    process.exit(1);
  }
}

clean();
