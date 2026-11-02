const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/public', express.static(path.join(__dirname, 'public')));

// Explicit Pure PDF Serving Route
app.get('/uploads/:filename', (req, res) => {
  const safeName = path.basename(req.params.filename);
  const filePath = path.join(uploadsDir, safeName);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    return res.sendFile(filePath);
  }
  return res.status(404).send(`Cannot GET /uploads/${safeName}`);
});

// Guaranteed Base64 PDF Upload Route
app.post('/api/upload-pdf', (req, res) => {
  try {
    const { filename, pdfBase64 } = req.body;
    if (!filename || !pdfBase64) {
      return res.status(400).json({ success: false, message: 'Missing filename or pdfBase64' });
    }
    const safeName = path.basename(filename);
    const targetPath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(pdfBase64, 'base64');
    fs.writeFileSync(targetPath, buffer);

    const fileUrl = `https://sakshi-salon-server.onrender.com/uploads/${safeName}`;
    console.log('PDF Saved Successfully:', fileUrl);
    return res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Ping
app.get('/ping', (req, res) => res.send('PONG - Active'));

// DIGITAL VIP CARD ROUTE
app.get('/vip-card', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const name = req.query.name || 'VALUED CLIENT';
  const tier = (req.query.tier || 'GOLD').toUpperCase();
  res.send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>VIP Card - ${name}</h2><p>Tier: ${tier}</p></body></html>`);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});