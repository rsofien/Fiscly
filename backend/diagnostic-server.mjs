#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = 1337;

console.log('[DIAGNOSTIC] Setting up middleware...');
app.use(cors());
app.use(express.json());

console.log('[DIAGNOSTIC] Setting up routes...');
app.get('/api/health', (req, res) => {
  console.log('[DIAGNOSTIC] Health check hit');
  res.json({ status: 'ok' });
});

app.post('/api/test', (req, res) => {
  console.log('[DIAGNOSTIC] Test POST hit, body:', req.body);
  res.json({ received: true, body: req.body });
});

console.log('[DIAGNOSTIC] Connecting to MongoDB...');
await mongoose.connect('mongodb://localhost:27017/fiscly');
console.log('[DIAGNOSTIC] MongoDB connected');

console.log('[DIAGNOSTIC] Starting server...');
app.listen(PORT, () => {
  console.log(`[DIAGNOSTIC] Server listening on http://localhost:${PORT}`);
  console.log('[DIAGNOSTIC] Try: curl http://localhost:1337/api/health');
});
