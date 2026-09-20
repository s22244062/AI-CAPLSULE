import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import db from './db.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/auth/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile'
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const code = req.query.code;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code'
    })
  });

  const tokenData = await tokenResponse.json();

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  const profile = await profileResponse.json();

  const token = jwt.sign(
    { userId: profile.id, email: profile.email, name: profile.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.redirect(`${process.env.APP_URL}/dashboard`);
});

function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/api/capsules', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM capsules WHERE user_id = ?').all(req.user.userId);
  res.json(rows);
});

app.post('/api/capsules', requireAuth, (req, res) => {
  const {
    project_name,
    prompt_title,
    prompt_version,
    prompt_text,
    response_summary,
    category,
    usefulness,
    reviewed,
    improved,
    screenshot_url,
    notes
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({ error: 'project_name, prompt_title, and prompt_text are required' });
  }

  const result = db.prepare(`
    INSERT INTO capsules
      (user_id, project_name, prompt_title, prompt_version, prompt_text, response_summary, category, usefulness, reviewed, improved, screenshot_url, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.userId,
    project_name,
    prompt_title,
    prompt_version || null,
    prompt_text,
    response_summary || null,
    category || null,
    usefulness || null,
    reviewed ? 1 : 0,
    improved ? 1 : 0,
    screenshot_url || null,
    notes || null
  );

  const newCapsule = db.prepare('SELECT * FROM capsules WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newCapsule);
});

app.put('/api/capsules/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.userId);

  if (!existing) {
    return res.status(404).json({ error: 'Capsule not found' });
  }

  const {
    project_name,
    prompt_title,
    prompt_version,
    prompt_text,
    response_summary,
    category,
    usefulness,
    reviewed,
    improved,
    screenshot_url,
    notes
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({ error: 'project_name, prompt_title, and prompt_text are required' });
  }

  db.prepare(`
    UPDATE capsules SET
      project_name = ?,
      prompt_title = ?,
      prompt_version = ?,
      prompt_text = ?,
      response_summary = ?,
      category = ?,
      usefulness = ?,
      reviewed = ?,
      improved = ?,
      screenshot_url = ?,
      notes = ?
    WHERE id = ? AND user_id = ?
  `).run(
    project_name,
    prompt_title,
    prompt_version || null,
    prompt_text,
    response_summary || null,
    category || null,
    usefulness || null,
    reviewed ? 1 : 0,
    improved ? 1 : 0,
    screenshot_url || null,
    notes || null,
    req.params.id,
    req.user.userId
  );

  const updated = db.prepare('SELECT * FROM capsules WHERE id = ?').get(req.params.id);
  res.json(updated);
});

app.delete('/api/capsules/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.userId);

  if (!existing) {
    return res.status(404).json({ error: 'Capsule not found' });
  }

  db.prepare('DELETE FROM capsules WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.userId);

  res.status(204).send();
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
