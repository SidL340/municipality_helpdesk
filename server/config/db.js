import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbType = process.env.DB_TYPE || 'sqlite';

let dbWrapper;

if (dbType === 'mysql') {
  const mysql = await import('mysql2/promise');
  const pool = mysql.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ward_kiosk',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    charset: 'utf8mb4',
  });
  dbWrapper = pool;
} else {
  // SQLite (Universal Local & Vercel Serverless Concurrency)
  let dbFile;

  if (process.env.VERCEL) {
    // Vercel serverless environment: Lambda filesystem is read-only except /tmp
    const tmpDbFile = path.join('/tmp', 'ward_kiosk.sqlite');

    // Locate bundled database in potential deployment paths
    const candidates = [
      path.join(process.cwd(), 'database', 'ward_kiosk.sqlite'),
      path.join(__dirname, '..', '..', 'database', 'ward_kiosk.sqlite'),
      path.join(__dirname, '..', 'database', 'ward_kiosk.sqlite'),
    ];

    let foundBundled = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        foundBundled = c;
        break;
      }
    }

    if (!fs.existsSync(tmpDbFile)) {
      if (foundBundled) {
        try {
          fs.copyFileSync(foundBundled, tmpDbFile);
          console.log(`✅ Copied bundled database from ${foundBundled} to ${tmpDbFile}`);
        } catch (e) {
          console.warn('Failed to copy bundled database to /tmp:', e);
        }
      }
    }

    dbFile = tmpDbFile;
  } else {
    // Local Node development
    const dbDir = path.join(__dirname, '..', '..', 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbFile = path.join(dbDir, 'ward_kiosk.sqlite');
  }

  const sqliteDb = new sqlite3.Database(dbFile, (err) => {
    if (err) console.error('SQLite Database Connection Error:', err);
  });

  // Enable WAL mode & busy timeout
  sqliteDb.serialize(() => {
    try {
      sqliteDb.run('PRAGMA journal_mode = WAL;');
      sqliteDb.run('PRAGMA busy_timeout = 5000;');
      sqliteDb.run('PRAGMA synchronous = NORMAL;');
    } catch (e) {}
  });

  dbWrapper = {
    async query(sql, params = []) {
      const cleanSql = sql.trim();
      const isSelect = /^(SELECT|PRAGMA)/i.test(cleanSql);

      // Handle MySQL-specific syntax in SQLite
      let normalizedSql = cleanSql
        .replace(/DATE_SUB\(CURDATE\(\),\s*INTERVAL\s+(\d+)\s+DAY\)/gi, "date('now', '-$1 days')")
        .replace(/CURDATE\(\)/gi, "date('now')")
        .replace(/HOUR\(created_at\)/gi, "CAST(strftime('%H', created_at) AS INTEGER)");

      return new Promise((resolve, reject) => {
        if (isSelect) {
          sqliteDb.all(normalizedSql, params, (err, rows) => {
            if (err) return reject(err);
            resolve([rows || []]);
          });
        } else {
          sqliteDb.run(normalizedSql, params, function (err) {
            if (err) return reject(err);
            resolve([{
              insertId: this.lastID,
              affectedRows: this.changes,
            }]);
          });
        }
      });
    },
  };
}

export default dbWrapper;
