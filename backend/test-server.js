import express from 'express';

const app = express();
const PORT = 1338;

console.log('[TEST] Creating minimal server...');

app.use((req, res, next) => {
  console.log(`[TEST] Request: ${req.method} ${req.url}`);
  next();
});

app.get('/test', (req, res) => {
  console.log('[TEST] /test handler fired');
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`[TEST] Server running on http://localhost:${PORT}`);
});

server.on('connection', () => {
  console.log('[TEST] Connection event');
});
