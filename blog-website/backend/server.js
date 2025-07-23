const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// DB + schema
const db = new sqlite3.Database('./backend/db.sqlite');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','user')) DEFAULT 'user'
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      author TEXT,
      date TEXT
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER,
      user TEXT,
      text TEXT,
      date TEXT,
      FOREIGN KEY(postId) REFERENCES posts(id)
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS likes (
      userId INTEGER,
      postId INTEGER,
      PRIMARY KEY(userId, postId),
      FOREIGN KEY(postId) REFERENCES posts(id)
  );`);
});

// ---------- AUTH ----------
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  db.run(
    'INSERT INTO users (name, email, password) VALUES (?,?,?)',
    [name, email, password],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get(
    'SELECT id,name,email,role FROM users WHERE email=? AND password=?',
    [email, password],
    (err, row) => {
      if (err || !row) return res.status(401).json({ error: 'Bad credentials' });
      res.json(row);
    }
  );
});

// ---------- POSTS ----------
app.get('/api/posts', (_, res) => {
  db.all('SELECT * FROM posts ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/posts', (req, res) => {
  const { title, content, image, author } = req.body;
  const date = new Date().toISOString().split('T')[0];
  db.run(
    'INSERT INTO posts (title, content, image, author, date) VALUES (?,?,?,?,?)',
    [title, content, image, author],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Admin only
app.put('/api/posts/:id', (req, res) => {
  const { title, content, image } = req.body;
  db.run(
    'UPDATE posts SET title=?, content=?, image=? WHERE id=?',
    [title, content, image, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

app.delete('/api/posts/:id', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM posts WHERE id=?', req.params.id);
    db.run('DELETE FROM comments WHERE postId=?', req.params.id);
    db.run('DELETE FROM likes WHERE postId=?', req.params.id);
  });
  res.json({ deleted: 1 });
});

// ---------- COMMENTS ----------
app.get('/api/posts/:id/comments', (req, res) => {
  db.all(
    'SELECT * FROM comments WHERE postId=? ORDER BY id DESC',
    [req.params.id],
    (err, rows) => res.json(err ? [] : rows)
  );
});

app.post('/api/posts/:id/comments', (req, res) => {
  const { user, text } = req.body;
  const date = new Date().toLocaleString();
  db.run(
    'INSERT INTO comments (postId, user, text, date) VALUES (?,?,?,?)',
    [req.params.id, user, text, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// ---------- LIKES ----------
app.get('/api/posts/:id/likes', (req, res) => {
  db.get(
    'SELECT COUNT(*) as count FROM likes WHERE postId=?',
    [req.params.id],
    (err, row) => res.json({ count: row?.count || 0 })
  );
});

app.post('/api/posts/:id/like', (req, res) => {
  const { userId } = req.body;
  db.run(
    'INSERT OR IGNORE INTO likes (userId, postId) VALUES (?,?)',
    [userId, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ liked: this.changes });
    }
  );
});

app.delete('/api/posts/:id/like', (req, res) => {
  const { userId } = req.body;
  db.run(
    'DELETE FROM likes WHERE userId=? AND postId=?',
    [userId, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ unliked: this.changes });
    }
  );
});

app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
