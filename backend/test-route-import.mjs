#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

console.log('[TEST] Importing auth router...');
import authRouter from './src/routes/auth.js';
console.log('[TEST] Auth router imported successfully');

const app = express();
const PORT = 1339;

app.use(cors());
app.use(express.json());

console.log('[TEST] Registering route...');
app.use('/api/auth', authRouter);

console.log('[TEST] Connecting to MongoDB...');
await mongoose.connect('mongodb://localhost:27017/fiscly');
console.log('[TEST] MongoDB connected');

console.log('[TEST] Starting server...');
app.listen(PORT, () => {
  console.log(`[TEST] Server on http://localhost:${PORT}`);
});
