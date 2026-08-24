import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const dbType = process.env.DB_TYPE || 'sqlite';

  console.log(`🌱 Initializing Ward Kiosk Database (${dbType.toUpperCase()} Mode)...`);

  if (dbType === 'mysql') {
    const mysql = await import('mysql2/promise');
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const port = parseInt(process.env.DB_PORT) || 3306;

    try {
      const conn = await mysql.default.createConnection({ host, user, password, port, multipleStatements: true });
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await conn.query(sql);
      await conn.end();
      console.log('✅ MySQL Database seeded successfully!');
      process.exit(0);
    } catch (err) {
      console.error('❌ MySQL seeding failed:', err.message);
      process.exit(1);
    }
  } else {
    // SQLite Mode
    const dbDir = path.join(__dirname, '..', '..', 'database');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    const dbPath = path.join(dbDir, 'ward_kiosk.sqlite');
    const db = new sqlite3.Database(dbPath);
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sqlite.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    db.exec(sql, (err) => {
      if (err) {
        console.error('❌ SQLite seeding failed:', err.message);
        process.exit(1);
      }

      console.log(`
======================================================
✅ Ward Kiosk Database Initialized (100% Complete Seed)!
======================================================
Database: database/ward_kiosk.sqlite

Populated:
- 10 Service Categories
- 60 Complete Nepal Ward Services
- 100% Exhaustive Document Checklists with Notes
- Fees (दस्तुर) and Processing Time (समय) for all services
- Multilingual Support (Nepali, Maithili, Bhojpuri, Newari, English)
- Ward Profile, Counters & Officials Contact

Default Admin:
- Username: admin
- Password: admin123
======================================================
      `);
      db.close();
      process.exit(0);
    });
  }
}

seed();
