const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
// static replaced
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
app.get('/api/version', (req, res) => {
  res.json({
    latestVersion: "2.4.0",
    downloadUrl: "https://sakshi-salon-server.onrender.com/public/downloads/Salon_POS_Setup.exe"
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });
let onlineBookings = [];

const servicesFilePath = path.join(__dirname, 'services.json');

const defaultServicesList = [
  "Men: Beard", "Men: Clean Shave", "Men: Haircut", "Men: Head Wash", "Men: Treatment Hair Wash", "Men: Head Massage", "Men: Hair Setting",
  "Threading", "Upperlips", "Full Face (Wax)", "Normal Wax: Full Arms", "Normal Wax: Full Legs", "Normal Wax: Full Body",
  "Rica Wax: Full Arms", "Rica Wax: Full Legs", "Rica Wax: Full Body",
  "Bleach: Oxy (Face & Neck)", "Bleach: Full Body", "D-Tan: Raaga (Face & Neck)", "D-Tan: O3+ (Face & Neck)", "D-Tan: Full Body",
  "Clean-Up: Fruit", "Clean-Up: O3+", "Facial: Fruit", "Facial: Ozone", "Facial: O3+ Shine & Glow", "Facial: Korean (13 Step)", "Facial: Korean Hydra", "Facial: Luxury Kanpeki Pro Hydra",
  "Pedicure: Basic", "Mani & Pedi: Basic", "Hair Spa: L'Oréal Basic", "Hair Spa: Streax", "Keratin Treatment", "Smoothening / Rebonding", "Hair Botox", "Nanoplastia",
  "Party Makeup: HD", "Engagement Makeup: HD", "Bridal Makeup: HD", "Pre-Bridal: Classic Package", "Pre-Bridal: Advance Package", "Pre-Bridal: Luxury Package"
];

function getServices() {
  if (fs.existsSync(servicesFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(servicesFilePath, 'utf8'));
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (_) {}
  }
  return defaultServicesList;
}

function saveServices(list) {
  fs.writeFileSync(servicesFilePath, JSON.stringify(list, null, 2), 'utf8');
}

// 1. SERVICES API
app.get('/api/services', (req, res) => {
  res.json(getServices());
});

app.post('/api/services/sync', (req, res) => {
  const { services } = req.body;
  if (Array.isArray(services) && services.length > 0) {
    saveServices(services);
    return res.json({ success: true, count: services.length });
  }
  res.status(400).json({ success: false, message: 'Invalid list' });
});

// 2. PDF UPLOAD
app.post('/upload', upload.single('billPdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  res.json({ success: true, url: 'https://sakshi-salon-server.onrender.com/uploads/' + req.file.filename });
});

// 3. BOOKING PORTAL
app.get('/book', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'book.html'));
});

app.post('/api/book', (req, res) => {
  const booking = req.body;
  booking.id = Date.now().toString();
  booking.status = 'PENDING';
  onlineBookings.unshift(booking);
  res.json({ success: true, booking });
});

app.get('/api/bookings', (req, res) => {
  const now = new Date();
  const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  
  // 1. Expired dates aur CANCELLED bookings ko filter karein
  const activeBookings = (onlineBookings || []).filter(b => {
    if (b.status === 'CANCELLED' || b.status === 'DONE') return false;
    
    // Purani expired dates ko alert me na bhejein
    if (b.date) {
      const parts = b.date.split('-');
      if (parts.length === 3) {
        const bDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (bDate < todayDate) return false;
      }
    }
    return true;
  });
  
  res.json(activeBookings);
});

// App se cancel karne par status server par bhi CANCELLED mark ho jaye
app.post('/api/bookings/cancel', (req, res) => {
  const { id, customerName, phone } = req.body || {};
  onlineBookings = (onlineBookings || []).map(b => {
    if ((id && b.id == id) || (customerName && b.name === customerName) || (phone && b.phone === phone)) {
      return { ...b, status: 'CANCELLED' };
    }
    return b;
  });
  res.json({ success: true });
});
app.get('/ping', (req, res) => res.send('pong'));
app.get('/', (req, res) => res.send('Sakshi Makeover Salon Server Running'));

app.listen(PORT, () => console.log('Server running on port ' + PORT));

// --- REALTIME CLOUD SYNC FOR LAPTOP & MOBILE ---
let cloudCustomers = [];
let cloudBookings = [];

app.get('/api/sync/all', (req, res) => {
  res.json({
    customers: cloudCustomers,
    bookings: cloudBookings
  });
});

app.post('/api/sync/bill', (req, res) => {
  const { bill, customer } = req.body;
  if (bill) {
    cloudBookings.unshift(bill);
  }
  if (customer) {
    const idx = cloudCustomers.findIndex(c => c.phone === customer.phone || c.name.toLowerCase() === customer.name.toLowerCase());
    if (idx !== -1) {
      cloudCustomers[idx] = customer;
    } else {
      cloudCustomers.unshift(customer);
    }
  }
  res.json({ success: true, message: 'Synced successfully' });
});

