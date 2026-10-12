const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

let onlineBookings = [];

// Direct PDF Upload
app.post('/upload', upload.single('billPdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const fileUrl = `https://sakshi-salon-server.onrender.com/uploads/${req.file.filename}`;
  console.log('Saved file:', req.file.filename);
  res.json({ success: true, url: fileUrl });
});

// Explicit Route to VIEW / DOWNLOAD PDF (Taaki Cannot GET kabhi na aaye)
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + req.params.filename + '"');
    return res.sendFile(filePath);
  } else {
    // Agar file abhi server disk par na ho toh safe fallback message
    res.status(404).send('<h2 style="font-family:sans-serif;text-align:center;margin-top:50px;">Invoice file processing ho rahi hai, kripya 10 second baad refresh karein.</h2>');
  }
});

app.post('/api/book', (req, res) => {
  const booking = req.body;
  booking.id = Date.now().toString();
  booking.status = 'PENDING';
  onlineBookings.unshift(booking);
  res.json({ success: true, booking });
});

app.get('/api/bookings', (req, res) => {
  res.json(onlineBookings);
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/', (req, res) => {
  res.send('Sakshi Makeover Salon Server Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
