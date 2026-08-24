import bcrypt from 'bcrypt';
import db from '../config/db.js';

async function seedMultiRoleUsers() {
  console.log('🌱 Adding columns and seeding 3 distinct role accounts...');

  const columnsToAdd = [
    'ALTER TABLE admin_users ADD COLUMN municipality_name TEXT DEFAULT NULL',
    'ALTER TABLE admin_users ADD COLUMN ward_number INTEGER DEFAULT NULL',
    'ALTER TABLE admin_users ADD COLUMN email TEXT DEFAULT NULL',
    'ALTER TABLE admin_users ADD COLUMN phone TEXT DEFAULT NULL',
  ];

  for (const alterSql of columnsToAdd) {
    try {
      await db.query(alterSql);
    } catch (e) {
      // Column may already exist, ignore error
    }
  }

  const users = [
    {
      username: 'tech_admin',
      password: 'tech123',
      full_name: 'ई. सन्तोष शर्मा (Central Tech Lead)',
      role: 'super_tech',
      municipality_name: 'Central Control Hub',
      ward_number: null,
      email: 'tech@wardkiosk.gov.np',
      phone: '9800000001',
    },
    {
      username: 'metro_admin',
      password: 'metro123',
      full_name: 'प्रमुख प्रशासकीय अधिकृत (Kathmandu Metro CAO)',
      role: 'municipality_admin',
      municipality_name: 'काठमाडौं महानगरपालिका',
      ward_number: null,
      email: 'cao@kathmandumetro.gov.np',
      phone: '01-4234500',
    },
    {
      username: 'ward32_admin',
      password: 'ward123',
      full_name: 'सीता देवी अधिकारी (वडा सचिव)',
      role: 'ward_admin',
      municipality_name: 'काठमाडौं महानगरपालिका',
      ward_number: 32,
      email: 'ward32@kathmandumetro.gov.np',
      phone: '9851654321',
    },
    {
      username: 'admin',
      password: 'admin123',
      full_name: 'वडा प्रशासक (Master Admin)',
      role: 'super_tech',
      municipality_name: 'काठमाडौं महानगरपालिका',
      ward_number: 32,
      email: 'admin@wardkiosk.gov.np',
      phone: '9841123456',
    },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const [existing] = await db.query('SELECT id FROM admin_users WHERE username = ?', [u.username]);

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO admin_users (username, password_hash, full_name, role, municipality_name, ward_number, email, phone, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [u.username, hash, u.full_name, u.role, u.municipality_name, u.ward_number, u.email, u.phone]
      );
    } else {
      await db.query(
        `UPDATE admin_users SET password_hash = ?, full_name = ?, role = ?, municipality_name = ?, ward_number = ?, email = ?, phone = ? WHERE username = ?`,
        [hash, u.full_name, u.role, u.municipality_name, u.ward_number, u.email, u.phone, u.username]
      );
    }
  }

  console.log(`
============================================================
✅ Multi-Role Accounts Seeded Successfully:
============================================================
1. 👨‍💻 Central Tech Head:
   - Username: tech_admin
   - Password: tech123
   - Role: super_tech

2. 🏢 Municipality Admin:
   - Username: metro_admin
   - Password: metro123
   - Role: municipality_admin

3. 🏛️ Ward Secretary:
   - Username: ward32_admin
   - Password: ward123
   - Role: ward_admin

4. 🔑 Master Admin:
   - Username: admin
   - Password: admin123
============================================================
  `);
  process.exit(0);
}

seedMultiRoleUsers();
