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

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });
let onlineBookings = [];

const servicesFilePath = path.join(__dirname, 'services.json');

function getServices() {
  if (fs.existsSync(servicesFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(servicesFilePath, 'utf8'));
    } catch (_) {}
  }
  return ["Men: Haircut", "Men: Beard", "Facial: Fruit", "Threading"];
}

function saveServices(list) {
  fs.writeFileSync(servicesFilePath, JSON.stringify(list, null, 2), 'utf8');
}

// SERVICES SYNC API
app.get('/api/services', (req, res) => {
  res.json(getServices());
});

app.post('/api/services/sync', (req, res) => {
  const { services } = req.body;
  if (Array.isArray(services)) {
    saveServices(services);
    console.log('✅ Services synced from Salon POS App. Count:', services.length);
    return res.json({ success: true, count: services.length });
  }
  res.status(400).json({ success: false, message: 'Invalid services array' });
});

// PDF UPLOAD
app.post('/upload', upload.single('billPdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  res.json({ success: true, url: 'https://sakshi-salon-server.onrender.com/uploads/' + req.file.filename });
});

// ONLINE BOOKING PAGE
app.get('/book', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'book.html'));
});

// BOOKINGS API
app.post('/api/book', (req, res) => {
  const booking = req.body;
  booking.id = Date.now().toString();
  booking.status = 'PENDING';
  onlineBookings.unshift(booking);
  res.json({ success: true, booking });
});

app.get('/api/bookings', (req, res) => res.json(onlineBookings));
app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.send('Sakshi Makeover Salon Server Running'));

app.listen(PORT, () => console.log('Server running on port ' + PORT));
