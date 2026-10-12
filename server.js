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

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

let onlineBookings = [];

// Bada Dark Blue Logo wala Booking Portal
app.get('/book', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Appointment - Sakshi Makeover & Unisex Salon</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; }
    body { background: #0f0c29; background: linear-gradient(135deg, #0f0c29, #1b1742, #24243e); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #ffffff; border-radius: 24px; padding: 36px 30px; max-width: 480px; width: 100%; box-shadow: 0 25px 60px rgba(0,0,0,0.45); }
    
    /* Bada Logo with Royal Dark Blue background & Golden border */
    .logo-container { text-align: center; margin-bottom: 18px; }
    .logo-badge { width: 110px; height: 110px; border-radius: 50%; background: #1B1742; border: 3px solid #D4AF37; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: inline-flex; align-items: center; justify-content: center; padding: 10px; }
    .logo-badge img { width: 100%; height: 100%; object-fit: contain; }
    
    h1 { color: #1B1742; font-size: 20px; text-align: center; font-weight: 700; margin-bottom: 4px; }
    p.sub { color: #666; font-size: 11.5px; text-align: center; margin-bottom: 22px; }
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #333; margin-bottom: 5px; }
    input, select { width: 100%; padding: 11px 14px; border: 1.5px solid #e1e3ea; border-radius: 12px; font-size: 13.5px; outline: none; transition: 0.2s; }
    input:focus, select:focus { border-color: #1B1742; }
    .btn { width: 100%; background: #1B1742; color: #fff; padding: 13px; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px; transition: 0.2s; box-shadow: 0 8px 20px rgba(27,23,66,0.3); }
    .btn:hover { background: #2A2468; transform: translateY(-1px); }
    .success-box { display: none; background: #e8f5e9; border: 1px solid #81c784; padding: 18px; border-radius: 14px; text-align: center; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-container">
      <div class="logo-badge">
        <img src="https://sakshi-salon-server.onrender.com/assets/logo.png" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2829/2829828.png'" alt="Sakshi Salon Logo">
      </div>
    </div>
    <h1>Sakshi Makeover & Unisex Salon</h1>
    <p class="sub">R-9 opp. bagga jwellers shakarpur laxmi nagar delhi | Helpline: 8745869645</p>

    <form id="bookForm">
      <div class="form-group">
        <label>Your Full Name</label>
        <input type="text" id="name" placeholder="Client Name" required>
      </div>
      <div class="form-group">
        <label>WhatsApp Mobile Number</label>
        <input type="tel" id="phone" placeholder="10 Digit Mobile No." required>
      </div>
      <div class="form-group">
        <label>Appointment Date</label>
        <input type="date" id="date" required>
      </div>
      <div class="form-group">
        <label>Preferred Time Slot</label>
        <select id="time" required>
          <option value="10:00 AM">10:00 AM</option>
          <option value="11:30 AM" selected>11:30 AM</option>
          <option value="01:00 PM">01:00 PM</option>
          <option value="02:30 PM">02:30 PM</option>
          <option value="04:00 PM">04:00 PM</option>
          <option value="05:30 PM">05:30 PM</option>
          <option value="07:00 PM">07:00 PM</option>
        </select>
      </div>
      <div class="form-group">
        <label>Required Service</label>
        <select id="service" required>
          <option value="Haircut & Styling">Haircut & Styling (500)</option>
          <option value="Hair Spa & Treatment">Hair Spa & Treatment (1200)</option>
          <option value="Keratin Treatment">Keratin Treatment (3500)</option>
          <option value="Facial Glow & Clean-up">Facial Glow & Clean-up (1500)</option>
          <option value="Bridal / HD Makeup">Bridal / HD Makeup (8000)</option>
          <option value="Manicure & Pedicure">Manicure & Pedicure (900)</option>
          <option value="Hair Coloring / Highlights">Hair Coloring / Highlights (2500)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Stylist Preference</label>
        <select id="stylist">
          <option value="Any Available">Any Available Stylist</option>
          <option value="Sakshi">Sakshi (Head Stylist)</option>
          <option value="Rahul">Rahul</option>
          <option value="Pooja">Pooja</option>
        </select>
      </div>
      <button type="submit" class="btn" id="submitBtn">Confirm Booking Request</button>
    </form>

    <div class="success-box" id="successBox">
      <h3 style="color:#2e7d32; font-size:16px;">Booking Request Sent!</h3>
      <p style="font-size:12px; color:#555; margin-top:4px;">Sakshi Salon team will confirm your slot on WhatsApp shortly.</p>
    </div>
  </div>

  <script>
    document.getElementById('date').valueAsDate = new Date();
    const form = document.getElementById('bookForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.innerText = 'Submitting...';
      submitBtn.disabled = true;

      const payload = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        service: document.getElementById('service').value,
        stylist: document.getElementById('stylist').value,
      };

      try {
        const resp = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if(resp.ok) {
          form.style.display = 'none';
          document.getElementById('successBox').style.display = 'block';
        }
      } catch(err) {
        alert('Booking request sent successfully!');
      }
    });
  </script>
</body>
</html>
  `);
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

app.post('/upload', upload.single('billPdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

app.use('/uploads', express.static(uploadsDir));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send('Sakshi Makeover & Unisex Salon Server is Active.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
