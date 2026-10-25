const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDirint, { recursive: true });
}

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// ================ 1ðŸ’© DIGITAL VIP CARD ROUTE ðŸ’© ===============
app.get('/vip-card', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const name = req.query.name || 'VALUED CLIENT';
  const tier = (req.query.tier || 'GOLD').toUpperCase();
  const valid = req.query.valid || '1 Year';
  const discount = req.query.discount || '10';
  const wallet = req.query.wallet || '0';
  const perks = req.query.perks || 'Exclusive VIP Salon Discounts & Priority Perks';
  
  let cardId = req.query.cardId || req.query.id || '';
  if (!cardId) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 9000;
    cardId = 'SM-' + (1000 + Math.abs(hash));
  }

  const isPlat = tier === 'PLATINUM';
  const isGold = tier === 'GOLD';

  const bgGrad = isPlat
    ? 'linear-gradient(135deg, #160a29 0%, #32104d 50%, #0d0617 100%)'
    : (isGold 
        ? 'linear-gradient(135deg, #241602 0%, #4f3306 50%, #150d01 100%)' 
        : 'linear-gradient(135deg, #101c29 0%, #1c3149 50%, #0c1521 100%)');

  const borderClr = isPlat ? '#d896ff' : (isGold ? '#e5b842' : '#00e5ff');
  const badgeBg = isPlat ? '#e0b0ff' : (isGold ? '#e5b842' : '#00e5ff');
  const badgeTxt = isPlat ? '#220038' : (isGold ? '#1a1001' : '#00252b');

  res.send('<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'  <meta charset="UTF-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>' + name + ' - VIP Pass | Sakshi Makeover</title>' +
'  <style>' +
'    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }' +
'    body { background: #07060d; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }' +
'    .card-wrapper { max-width: 440px; width: 100%; position: relative; }' +
'    .card {' +
'      background: ' + bgGrad + ';' +
'      border: 2px solid ' + borderClr + ';' +
'      border-radius: 24px;' +
'      padding: 26px;' +
'      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8), 0 0 35px ' + borderClr + '33;' +
'      position: relative;' +
'      overflow: hidden;' +
'      color: white;' +
'    }' +
'    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }' +
'    .brand { font-size: 14px; font-weight: 800; letter-spacing: 1.5px; color: #fff; text-transform: uppercase; }' +
'    .tier-badge {' +
'      background: ' + badgeBg + ';' +
'      color: ' + badgeTxt + ';' +
'      font-weight: 900;' +
'      font-size: 11px;' +
'      letter-spacing: 1px;' +
'      padding: 5px 14px;' +
'      border-radius: 20px;' +
'      box-shadow: 0 4px 10px rgba(0,0,0,0.3);' +
'    }' +
'    .client-name { font-size: 24px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 6px; color: #fff; }' +
'    .meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }' +
'    .vip-status { font-size: 11.5px; opacity: 0.85; letter-spacing: 1px; color: ' + borderClr + '; font-weight: 600; }' +
'    .card-id { font-family: monospace; font-size: 12px; font-weight: bold; background: rgba(255,255,255,0.12); padding: 3px 8px; border-radius: 6px; letter-spacing: 1.5px; color: #fff; border: 1px solid rgba(255,255,255,0.2); }' +
'    .details-grid {' +
'      display: grid;' +
'      grid-template-columns: 1fr 1fr 1fr;' +
'      gap: 12px;' +
'      background: rgba(255, 255, 255, 0.05);' +
'      border: 1px solid rgba(255, 255, 255, 0.1);' +
'      border-radius: 16px;' +
'      padding: 14px;' +
'      margin-bottom: 18px;' +
'    }' +
'    .detail-item { text-align: center; }' +
'    .detail-lbl { font-size: 9.5px; opacity: 0.7; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }' +
'    .detail-val { font-size: 15.5px; font-weight: 800; color: #00ffbb; }' +
'    .footer {' +
'      display: flex;' +
'      justify-content: space-between;' +
'      align-items: center;' +
'      border-top: 1px solid rgba(255, 255, 255, 0.12);' +
'      padding-top: 14px;' +
'      font-size: 11.5px;' +
'      opacity: 0.9;' +
'    }' +
'    .perks-box {' +
'      background: rgba(0,0,0,0.25);' +
'      border-radius: 12px;' +
'      padding: 10px 14px;' +
'      margin-bottom: 18px;' +
'      font-size: 11.5px;' +
'      line-height: 1.4;' +
'      border-left: 3px solid ' + borderClr + ';' +
'    }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="card-wrapper">' +
'    <div class="card">' +
'      <div class="header">' +
'        <div class="brand">SAKSHI MAKEOVER</div>' +
'        <div class="tier-badge">' + tier + ' VIP</div>' +
'      </div>' +
'      <div class="client-name">' + name + '</div>' +
'      <div class="meta-row">' +
'        <div class="vip-status">OFFICIAL VIP PRIVILEGE MEMBER</div>' +
'        <div class="card-id">ID: ' + cardId + '</div>' +
'      </div>' +
'      <div class="details-grid">' +
'        <div class="detail-item">' +
'          <div class="detail-lbl">Discount</div>' +
'          <div class="detail-val">' + discount + '% OFF</div>' +
'        </div>' +
'        <div class="detail-item">' +
'          <div class="detail-lbl">Wallet Cash</div>' +
'          <div class="detail-val" style="color: #ffd700;">Rs. ' + wallet + '</div>' +
'        </div>' +
'        <div class="detail-item">' +
'          <div class="detail-lbl">Valid Till</div>' +
'          <div class="detail-val" style="color: #fff; font-size: 12.5px; padding-top: 2px;">' + valid + '</div>' +
'        </div>' +
'      </div>' +
'      <div class="perks-box">' +
'        <strong>Membership Perks:</strong> ' + perks +
'      </div>' +
'      <div class="footer">' +
'        <span>Shakarpur Main Market, Delhi</span>' +
'        <span>Ph: 8745869645</span>' +
'      </div>' +
'    </div>' +
'  </div>' +
'</body>' +
'</html>');
});

app.get('/api/version', (req, res) => {
  res.json({
    latestVersion: "2.5.0",
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
  "Pedicure: Basic", "Mani & Pedi: Basic", "Hair Spa: L'Orï¿½al Basic", "Hair Spa: Streax", "Keratin Treatment", "Smoothening / Rebonding", "Hair Botox", "Nanoplastia",
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
  const activeBookings = (onlineBookings || []).filter(b => {
    if (b.status === 'CANCELLED' || b.status === 'DONE') return false;
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


// ================= DIGITAL BILL / INVOICE ROUTE =================
app.get('/bill-receipt', (req, res) => {
  const inv = req.query.inv || 'INV-001';
  const name = req.query.name || 'Valued Client';
  const phone = req.query.phone || '';
  const date = req.query.date || '';
  const subtotal = req.query.sub || '0';
  const discount = req.query.disc || '0';
  const net = req.query.net || '0';
  const paid = req.query.paid || '0';
  const due = req.query.due || '0';
  const mode = req.query.mode || 'Cash';
  const services = req.query.services ? req.query.services.split('|') : ['Salon Service'];

  const rows = services.map(s => {
    return '<tr><td style="padding:10px;border-bottom:1px solid #eee;">' + s + '</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">Included</td></tr>';
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${inv}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; margin: 0; padding: 15px; display: flex; justify-content: center; }
    .bill-card { background: #fff; width: 100%; max-width: 480px; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e1e4e8; }
    .bill-head { background: #1B1742; color: #fff; padding: 25px 20px; text-align: center; }
    .bill-title { font-size: 20px; font-weight: 800; letter-spacing: 0.5px; color: #E5B842; margin-bottom: 5px; }
    .bill-sub { font-size: 12px; color: #d1d5db; }
    .bill-body { padding: 20px; }
    .meta-box { background: #f8fafc; border-radius: 12px; padding: 12px 16px; margin-bottom: 18px; display: flex; justify-content: space-between; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13.5px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; color: #475569; }
    .calc-row { display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 8px; color: #334155; }
    .grand-total { border-top: 2px dashed #cbd5e1; margin-top: 12px; padding-top: 12px; font-size: 16px; font-weight: 800; color: #1B1742; }
    .paid-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
    .print-btn { display: block; width: 100%; background: #1B1742; color: #fff; border: none; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 20px; text-align: center; text-decoration: none; box-sizing: border-box; }
    @media print { .print-btn { display: none; } body { background: #fff; padding: 0; } .bill-card { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="bill-card">
    <div class="bill-head">
      <div class="bill-title">SAKSHI MAKEOVER & UNISEX SALON</div>
      <div class="bill-sub">R-9 Opp. Bagga Jewellers, Shakarpur Main Market, Delhi - 110092<br>Ph: 8745869645</div>
    </div>
    <div class="bill-body">
      <div class="meta-box">
        <div><strong>Client:</strong> ${name}<br><span style="color:#64748b;">${phone}</span></div>
        <div style="text-align:right;"><strong>${inv}</strong><br><span style="color:#64748b;">${date}</span></div>
      </div>
      <table>
        <thead>
          <tr><th>Item / Service</th><th style="text-align:right;">Status</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="calc-row"><span>Subtotal:</span><span>Rs. ${subtotal}</span></div>
      <div class="calc-row"><span>Discount:</span><span style="color:#16a34a;">-Rs. ${discount}</span></div>
      <div class="calc-row grand-total"><span>Net Payable:</span><span>Rs. ${net}</span></div>
      <div class="calc-row" style="margin-top:8px;"><span>Paid (${mode}):</span><span style="font-weight:bold;">Rs. ${paid}</span></div>
      <div class="calc-row" style="color:${parseInt(due) > 0 ? '#dc2626' : '#16a34a'};font-weight:bold;">
        <span>Balance Due:</span><span>Rs. ${due}</span>
      </div>
      <button class="print-btn" onclick="window.print()">?? Print / Save as PDF</button>
      <div style="text-align:center;font-size:11.5px;color:#94a3b8;margin-top:16px;">
        Thank you for choosing Sakshi Makeover! ?
      </div>
    </div>
  </div>
</body>
</html>`;
  res.send(html);
});

app.listen(PORT, () => console.log('Server running on port ' + PORT));
