import bcrypt from 'bcrypt';
import db from '../config/db.js';

async function resetAdmin() {
  const newPassword = process.argv[2] || 'admin123';
  const hash = await bcrypt.hash(newPassword, 10);

  const [existing] = await db.query('SELECT id FROM admin_users WHERE username = ?', ['admin']);
  if (existing.length === 0) {
    await db.query(
      'INSERT INTO admin_users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      ['admin', hash, 'वडा प्रशासक (Admin)', 'super_admin']
    );
  } else {
    await db.query('UPDATE admin_users SET password_hash = ? WHERE username = ?', [hash, 'admin']);
  }

  console.log(`✅ Admin password has been set to: "${newPassword}"`);
  process.exit(0);
}

resetAdmin();
