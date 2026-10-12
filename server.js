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
let savedBills = {};

// ONLINE WEB RECEIPT PAGE
app.get('/bill/:id', (req, res) => {
  const bill = savedBills[req.params.id];
  if (!bill) {
    return res.status(404).send(`
      <div style="font-family:sans-serif; text-align:center; padding:50px;">
        <h2>Bill Not Found or Expired</h2>
        <p>Please contact Sakshi Salon Helpline: 8745869645</p>
      </div>
    `);
  }

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${bill.invoiceNumber} - Sakshi Salon</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin:0; padding:0; font-family:'Poppins', sans-serif; }
    body { background: #f0f2f5; display:flex; justify-content:center; padding: 20px 10px; }
    .receipt { background:#fff; border-radius:18px; max-width:480px; width:100%; padding:26px 20px; box-shadow:0 15px 35px rgba(0,0,0,0.1); border-top: 6px solid #1B1742; }
    .header { text-align:center; border-bottom:1.5px dashed #ccc; padding-bottom:16px; margin-bottom:16px; }
    .badge { width:80px; height:80px; background:#1B1742; border:2px solid #E5B842; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; padding:8px; margin-bottom:10px; }
    .badge img { width:100%; height:100%; object-fit:contain; }
    h2 { color:#1B1742; font-size:18px; font-weight:700; }
    .sub { font-size:11px; color:#666; margin-top:2px; }
    .info-row { display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:6px; color:#444; }
    .table { width:100%; border-collapse:collapse; margin:15px 0; }
    .table th { background:#f7f8fa; font-size:11.5px; text-align:left; padding:8px; color:#333; }
    .table td { font-size:12px; padding:8px; border-bottom:1px solid #eee; }
    .totals { border-top:1.5px dashed #ccc; padding-top:12px; margin-top:10px; }
    .total-row { display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; }
    .final { font-size:15px; font-weight:700; color:#1B1742; }
    .status { text-align:center; margin:16px 0; padding:8px; border-radius:10px; font-size:12px; font-weight:700; background:#e8f5e9; color:#2e7d32; }
    .footer { text-align:center; font-size:11px; color:#888; border-top:1px solid #eee; padding-top:14px; margin-top:16px; }
    .btn-print { width:100%; background:#1B1742; color:#fff; border:none; padding:12px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; margin-top:14px; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="badge">
        <img src="https://sakshi-salon-server.onrender.com/assets/logo.png" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2829/2829828.png'">
      </div>
      <h2>Sakshi Makeover & Unisex Salon</h2>
      <p class="sub">R-9 opp. bagga jwellers shakarpur laxmi nagar delhi 110092</p>
      <p class="sub">Helpline: 8745869645</p>
    </div>

    <div class="info-row"><span>Bill No:</span><strong>#${bill.invoiceNumber}</strong></div>
    <div class="info-row"><span>Date:</span><strong>${bill.date}</strong></div>
    <div class="info-row"><span>Customer:</span><strong>${bill.customerName} (${bill.phone})</strong></div>
    <div class="info-row"><span>Attendant:</span><strong>${bill.stylistName}</strong></div>

    <table class="table">
      <thead>
        <tr><th>Item / Service</th><th style="text-align:right;">Amount</th></tr>
      </thead>
      <tbody>
        ${bill.items.map(it => `<tr><td>${it.name} (x${it.qty})</td><td style="text-align:right;">₹${it.total}</td></tr>`).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row"><span>Total Bill:</span><strong>₹${bill.totalAmount}</strong></div>
      <div class="total-row"><span>Paid / Advance:</span><strong style="color:#2e7d32;">₹${bill.paidAmount}</strong></div>
      <div class="total-row final"><span>Balance Due:</span><strong style="color:${bill.balanceAmount > 0 ? '#d32f2f' : '#2e7d32'};">₹${bill.balanceAmount}</strong></div>
    </div>

    <div class="status" style="${bill.balanceAmount > 0 ? 'background:#ffebee; color:#c62828;' : ''}">
      ${bill.balanceAmount === 0 ? '✓ PAID IN FULL' : '⚠ PARTIAL PAYMENT (DUE: ₹' + bill.balanceAmount + ')'}
    </div>

    <button class="btn-print" onclick="window.print()">Print / Save PDF</button>

    <div class="footer">
      Thank you for visiting! We look forward to seeing you again.
    </div>
  </div>
</body>
</html>
  `);
});

// API TO SAVE BILL RECORD
app.post('/api/save-bill', (req, res) => {
  const billData = req.body;
  if (!billData || !billData.invoiceNumber) {
    return res.status(400).json({ success: false });
  }
  savedBills[billData.invoiceNumber] = billData;
  const billUrl = `https://sakshi-salon-server.onrender.com/bill/${billData.invoiceNumber}`;
  res.json({ success: true, url: billUrl });
});

// UPLOAD PDF ROUTE
app.post('/upload', upload.single('billPdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// ONLINE BOOKING PAGE
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
    .logo-container { text-align: center; margin-bottom: 18px; }
    .logo-badge { width: 110px; height: 110px; border-radius: 50%; background: #1B1742; border: 3px solid #E5B842; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: inline-flex; align-items: center; justify-content: center; padding: 10px; }
    .logo-badge img { width: 100%; height: 100%; object-fit: contain; }
    h1 { color: #1B1742; font-size: 20px; text-align: center; font-weight: 700; margin-bottom: 4px; }
    p.sub { color: #666; font-size: 11.5px; text-align: center; margin-bottom: 22px; }
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #333; margin-bottom: 5px; }
    input, select { width: 100%; padding: 11px 14px; border: 1.5px solid #e1e3ea; border-radius: 12px; font-size: 13.5px; outline: none; }
    input:focus, select:focus { border-color: #1B1742; }
    .btn { width: 100%; background: #1B1742; color: #fff; padding: 13px; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px; box-shadow: 0 8px 20px rgba(27,23,66,0.3); }
    .success-box { display: none; background: #e8f5e9; border: 1px solid #81c784; padding: 18px; border-radius: 14px; text-align: center; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-container">
      <div class="logo-badge">
        <img src="https://sakshi-salon-server.onrender.com/assets/logo.png" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2829/2829828.png'">
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
          <option value="Haircut & Styling">Haircut & Styling (₹500)</option>
          <option value="Hair Spa & Treatment">Hair Spa & Treatment (₹1200)</option>
          <option value="Keratin Treatment">Keratin Treatment (₹3500)</option>
          <option value="Facial Glow & Clean-up">Facial Glow & Clean-up (₹1500)</option>
          <option value="Bridal / HD Makeup">Bridal / HD Makeup (₹8000)</option>
          <option value="Manicure & Pedicure">Manicure & Pedicure (₹900)</option>
          <option value="Hair Coloring / Highlights">Hair Coloring / Highlights (₹2500)</option>
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

app.use('/uploads', express.static(uploadsDir));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send('Sakshi Makeover & Unisex Salon Server is Active.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
