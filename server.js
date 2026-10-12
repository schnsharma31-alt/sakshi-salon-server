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
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

let onlineBookings = [];

// 1. PDF Upload API
app.post('/upload', upload.single('billPdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
  const fileUrl = `https://sakshi-salon-server.onrender.com/uploads/${req.file.filename}`;
  console.log('PDF saved:', req.file.filename);
  res.json({ success: true, url: fileUrl });
});

// View PDF directly in browser
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
  }
}));

// 2. ONLINE BOOKING WEB PORTAL (Direct Mobile/Web Form)
app.get('/book', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book Appointment - Sakshi Makeover & Unisex Salon</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f5fa; margin: 0; padding: 20px; display: flex; justify-content: center; }
    .card { background: #fff; max-width: 480px; width: 100%; border-radius: 24px; padding: 28px; box-shadow: 0 15px 35px rgba(0,0,0,0.08); }
    .header { text-align: center; border-bottom: 2px solid #1B1742; padding-bottom: 18px; margin-bottom: 22px; }
    .title { color: #1B1742; font-size: 20px; font-weight: bold; margin: 6px 0 2px 0; }
    .sub { color: #666; font-size: 12px; margin: 0; }
    label { font-size: 13px; font-weight: 600; color: #1B1742; display: block; margin-top: 14px; margin-bottom: 6px; }
    input, select { width: 100%; padding: 12px 14px; border: 1.5px solid #dcdde5; border-radius: 12px; font-size: 14px; outline: none; transition: 0.2s; }
    input:focus, select:focus { border-color: #1B1742; }
    .btn { margin-top: 24px; width: 100%; background: #1B1742; color: #fff; border: none; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; }
    .btn:hover { background: #2a2560; }
    .success-box { display: none; text-align: center; padding: 30px 10px; }
    .success-box h3 { color: #2e7d32; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">Sakshi Makeover & Unisex Salon</div>
      <p class="sub">R-9, opp. bagga jewellers, Shakarpur, Laxmi Nagar, Delhi</p>
      <p class="sub" style="font-weight:600;margin-top:4px;">Helpline: 8745869645</p>
    </div>

    <form id="bookingForm">
      <label>Full Name *</label>
      <input type="text" id="custName" required placeholder="Enter your full name">

      <label>WhatsApp Number *</label>
      <input type="tel" id="custPhone" required placeholder="10-digit mobile number">

      <label>Appointment Date *</label>
      <input type="date" id="custDate" required>

      <label>Preferred Time Slot *</label>
      <select id="custTime" required>
        <option value="10:00 AM">10:00 AM</option>
        <option value="11:00 AM" selected>11:00 AM</option>
        <option value="12:00 PM">12:00 PM</option>
        <option value="01:00 PM">01:00 PM</option>
        <option value="02:00 PM">02:00 PM</option>
        <option value="03:00 PM">03:00 PM</option>
        <option value="04:00 PM">04:00 PM</option>
        <option value="05:00 PM">05:00 PM</option>
        <option value="06:00 PM">06:00 PM</option>
        <option value="07:00 PM">07:00 PM</option>
        <option value="08:00 PM">08:00 PM</option>
      </select>

      <label>Select Treatment / Service *</label>
      <select id="custService" required>
        <optgroup label="Men's Grooming">
          <option value="Men: Beard (₹80)">Men: Beard (₹80)</option>
          <option value="Men: Clean Shave (₹60)">Men: Clean Shave (₹60)</option>
          <option value="Men: Haircut (₹120)">Men: Haircut (₹120)</option>
          <option value="Men: Head Wash (₹50)">Men: Head Wash (₹50)</option>
          <option value="Men: Head Massage (₹150)">Men: Head Massage (₹150)</option>
        </optgroup>
        <optgroup label="Waxing & Threading">
          <option value="Threading (₹30)">Threading (₹30)</option>
          <option value="Full Face Wax (₹300)">Full Face Wax (₹300)</option>
          <option value="Normal Wax Full Arms (₹199)">Normal Wax Full Arms (₹199)</option>
          <option value="Normal Wax Full Legs (₹299)">Normal Wax Full Legs (₹299)</option>
          <option value="Rica Wax Full Arms (₹349)">Rica Wax Full Arms (₹349)</option>
          <option value="Rica Wax Full Legs (₹499)">Rica Wax Full Legs (₹499)</option>
          <option value="Rica Wax Full Body (₹1599)">Rica Wax Full Body (₹1599)</option>
        </optgroup>
        <optgroup label="Clean-up & Facials">
          <option value="Clean-Up: Fruit (₹299)">Clean-Up: Fruit (₹299)</option>
          <option value="Clean-Up: O3+ (₹1199)">Clean-Up: O3+ (₹1199)</option>
          <option value="Facial: Fruit (₹499)">Facial: Fruit (₹499)</option>
          <option value="Facial: O3+ Shine & Glow (₹1799)">Facial: O3+ Shine & Glow (₹1799)</option>
          <option value="Facial: Korean (13 Step) (₹1999)">Facial: Korean (13 Step) (₹1999)</option>
          <option value="Facial: Korean Hydra (₹2999)">Facial: Korean Hydra (₹2999)</option>
        </optgroup>
        <optgroup label="Hair Care & Treatments">
          <option value="Hair Spa: L'Oréal (₹500)">Hair Spa: L'Oréal (₹500)</option>
          <option value="Hair Spa: Streax (₹1200)">Hair Spa: Streax (₹1200)</option>
          <option value="Keratin Treatment (₹1800+)">Keratin Treatment (₹1800+)</option>
          <option value="Hair Smoothening (₹1800+)">Hair Smoothening (₹1800+)</option>
          <option value="Hair Botox (₹1800+)">Hair Botox (₹1800+)</option>
          <option value="Nanoplastia (₹3500+)">Nanoplastia (₹3500+)</option>
        </optgroup>
        <optgroup label="Makeups & Packages">
          <option value="Party Makeup (₹2000+)">Party Makeup (₹2000+)</option>
          <option value="Engagement Makeup (₹5000+)">Engagement Makeup (₹5000+)</option>
          <option value="Bridal Makeup (₹15000+)">Bridal Makeup (₹15000+)</option>
          <option value="Pre-Bridal Classic Package (₹5999)">Pre-Bridal Classic Package (₹5999)</option>
          <option value="Pre-Bridal Advance Package (₹11999)">Pre-Bridal Advance Package (₹11999)</option>
          <option value="Pre-Bridal Luxury Package (₹16999)">Pre-Bridal Luxury Package (₹16999)</option>
        </optgroup>
      </select>

      <button type="submit" class="btn" id="submitBtn">Book Appointment</button>
    </form>

    <div class="success-box" id="successBox">
      <h3>🎉 Booking Request Received!</h3>
      <p style="color:#555;font-size:14px;line-height:1.5;">Thank you! Our salon team will review your appointment slot and confirm via WhatsApp shortly.</p>
      <button class="btn" onclick="location.reload()" style="margin-top:16px;">Book Another Slot</button>
    </div>
  </div>

  <script>
    document.getElementById('custDate').valueAsDate = new Date();

    document.getElementById('bookingForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.innerText = 'Submitting...';

      const booking = {
        name: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        date: document.getElementById('custDate').value,
        time: document.getElementById('custTime').value,
        service: document.getElementById('custService').value,
        stylist: 'Any Available'
      };

      try {
        const res = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        });
        if (res.ok) {
          document.getElementById('bookingForm').style.display = 'none';
          document.getElementById('successBox').style.display = 'block';
        } else {
          alert('Failed to book. Please call 8745869645 directly.');
          btn.disabled = false;
          btn.innerText = 'Book Appointment';
        }
      } catch (err) {
        alert('Server waking up or network issue. Please retry in 10 seconds.');
        btn.disabled = false;
        btn.innerText = 'Book Appointment';
      }
    });
  </script>
</body>
</html>
  `);
});

// 3. BOOKING API ROUTES
app.post('/api/book', (req, res) => {
  const booking = req.body;
  booking.id = Date.now().toString();
  booking.status = 'PENDING';
  onlineBookings.unshift(booking);
  console.log('New Booking:', booking);
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
