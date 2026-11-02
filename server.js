const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Multer Storage to keep exact file name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST Upload Route for Pure PDFs
app.post('/upload', upload.single('billPdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file received' });
  }
  const fileUrl = `https://sakshi-salon-server.onrender.com/uploads/${req.file.filename}`;
  console.log('Uploaded successfully:', fileUrl);
  return res.json({ success: true, url: fileUrl });
});

// Ping / Health Check
app.get('/ping', (req, res) => res.send('PONG - Sakshi Salon Server Active'));

// DIGITAL VIP CARD ROUTE
app.get('/vip-card', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const name = req.query.name || 'VALUED CLIENT';
  const tier = (req.query.tier || 'GOLD').toUpperCase();
  const valid = req.query.valid || '1 Year';
  const discount = req.query.discount || '10';
  const wallet = req.query.wallet || '0';
  const perks = req.query.perks || 'Exclusive VIP Salon Discounts & Priority Perks';
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>VIP Card</title></head><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>VIP Card - ${name}</h2><p>Tier: ${tier}</p></body></html>`);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});