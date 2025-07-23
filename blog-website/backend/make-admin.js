const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/db.sqlite');
const crypto = require('crypto');
const pw = crypto.randomBytes(8).toString('hex');   // 16-char
db.run(
  'INSERT OR IGNORE INTO users(name,email,password,role) VALUES(?,?,?,?)',
  ['Root Admin', 'admin@example.com', pw, 'admin'],
  () => {
    console.log('Admin created.  Email: admin@example.com  Password:', pw);
  }
);
db.close();
