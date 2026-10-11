const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const billsDir = path.join(__dirname, 'bills');
if (!fs.existsSync(billsDir)) {
    fs.mkdirSync(billsDir, { recursive: true });
}

// In-memory bookings store
let onlineBookings = [];

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, billsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.pdf';
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${base}_${uniqueSuffix}${ext}`);
    }
});
const upload = multer({ storage: storage });

app.use('/bills', express.static(billsDir));

app.get('/', (req, res) => {
    res.send('Sakshi Makeover Salon POS Server is running live!');
});

// PDF Upload Endpoint
app.post('/upload', upload.single('billPdf'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fullUrl = `${req.protocol}://${req.get('host')}/bills/${req.file.filename}`;
    res.json({ success: true, url: fullUrl, filename: req.file.filename });
});

// Online Booking Page for Customers (Mobile Responsive HTML)
app.get('/book', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Online Appointment | Sakshi Makeover & Unisex Salon</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F111A; color: #fff; margin: 0; padding: 20px; }
            .container { max-width: 480px; margin: 0 auto; background: #181B26; border-radius: 20px; padding: 25px; border: 1px solid rgba(93, 83, 162, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h2 { color: #fff; text-align: center; margin-bottom: 5px; font-size: 20px; }
            p.sub { text-align: center; color: #8F94A6; font-size: 12px; margin-top: 0; margin-bottom: 25px; }
            label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 6px; color: #A4A9C0; }
            input, select { width: 100%; padding: 12px; background: #0F111A; border: 1px solid #2B3045; border-radius: 10px; color: #fff; font-size: 14px; margin-bottom: 15px; box-sizing: border-box; }
            input:focus, select:focus { outline: none; border-color: #5D53A2; }
            button { width: 100%; padding: 14px; background: #5D53A2; border: none; border-radius: 12px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; }
            button:hover { background: #4D4488; }
            .success { display: none; background: #133326; border: 1px solid #1E8759; color: #51D88A; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 20px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Sakshi Makeover & Unisex Salon</h2>
            <p class="sub">R-9 opp. Bagga Jewellers, Shakarpur, Laxmi Nagar | 8745869645</p>
            <div id="successMsg" class="success">Appointment Confirmed! We look forward to seeing you.</div>
            <form id="bookingForm">
                <label>Full Name</label>
                <input type="text" id="custName" required placeholder="Enter your full name">
                <label>WhatsApp Number</label>
                <input type="tel" id="custPhone" required placeholder="10-digit mobile number">
                <label>Select Date</label>
                <input type="date" id="bookDate" required>
                <label>Select Time Slot</label>
                <select id="bookTime" required>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                    <option value="07:00 PM">07:00 PM</option>
                </select>
                <label>Preferred Stylist</label>
                <select id="stylist">
                    <option value="Any Available">Any Available Stylist</option>
                    <option value="Sakshi">Sakshi</option>
                    <option value="Rahul">Rahul</option>
                    <option value="Pooja">Pooja</option>
                </select>
                <label>Desired Service</label>
                <select id="service">
                    <option value="Haircut & Styling">Haircut & Styling (500)</option>
                    <option value="Hair Spa & Treatment">Hair Spa & Treatment (1200)</option>
                    <option value="Keratin Treatment">Keratin Treatment (3500)</option>
                    <option value="Facial Glow & Clean-up">Facial Glow & Clean-up (1500)</option>
                    <option value="Bridal / HD Makeup">Bridal / HD Makeup (8000)</option>
                    <option value="Hair Coloring / Highlights">Hair Coloring (2500)</option>
                </select>
                <button type="submit">Book My Slot</button>
            </form>
        </div>
        <script>
            document.getElementById('bookingForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const payload = {
                    name: document.getElementById('custName').value,
                    phone: document.getElementById('custPhone').value,
                    date: document.getElementById('bookDate').value,
                    time: document.getElementById('bookTime').value,
                    stylist: document.getElementById('stylist').value,
                    service: document.getElementById('service').value,
                };
                try {
                    const res = await fetch('/api/book', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        document.getElementById('successMsg').style.display = 'block';
                        document.getElementById('bookingForm').reset();
                    }
                } catch(err) {
                    alert('Booking failed, please try again or call 8745869645');
                }
            });
        </script>
    </body>
    </html>
    `);
});

// Online Booking API
app.post('/api/book', (req, res) => {
    const booking = req.body;
    booking.id = Date.now().toString();
    onlineBookings.unshift(booking);
    res.json({ success: true, booking });
});

// App sync endpoint
app.get('/api/bookings', (req, res) => {
    res.json(onlineBookings);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
