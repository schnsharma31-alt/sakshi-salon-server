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

// Bills storage folder ensure karna
const billsDir = path.join(__dirname, 'bills');
if (!fs.existsSync(billsDir)) {
    fs.mkdirSync(billsDir, { recursive: true });
}

let onlineBookings = [];

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(billsDir)) {
            fs.mkdirSync(billsDir, { recursive: true });
        }
        cb(null, billsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.pdf';
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${base}_${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Root Route
app.get('/', (req, res) => {
    res.send('Sakshi Makeover Salon POS Server is running live!');
});

// PDF Upload Endpoint (from Flutter POS)
app.post('/upload', upload.single('billPdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const fullUrl = `${protocol}://${host}/bills/${req.file.filename}`;
    
    console.log(`[Bill Uploaded]: ${req.file.filename} -> ${fullUrl}`);
    res.json({ 
        success: true, 
        url: fullUrl, 
        filename: req.file.filename 
    });
});

// Dedicated Robust PDF Serving Route
app.get('/bills/:filename', (req, res) => {
    const requestedFile = req.params.filename;
    // Security sanitization (directory traversal protection)
    const safeFilename = path.basename(requestedFile);
    const filePath = path.join(billsDir, safeFilename);

    if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
        const readStream = fs.createReadStream(filePath);
        return readStream.pipe(res);
    } else {
        // Friendly HTML response if server restarted
        return res.status(404).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Bill Not Found | Sakshi Salon</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F111A; color: #fff; text-align: center; padding: 50px 20px; }
                    .card { max-width: 480px; margin: 0 auto; background: #181B26; border-radius: 20px; padding: 30px; border: 1px solid rgba(93, 83, 162, 0.4); }
                    h2 { color: #FF7B7B; }
                    p { color: #A4A9C0; line-height: 1.6; font-size: 14px; }
                    .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #5D53A2; color: #fff; text-decoration: none; border-radius: 10px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Invoice File Expired</h2>
                    <p>Yeh bill receipt server restart hone ki wajah se cache se expire ho chuki hai.</p>
                    <p>Aapke local computer (<strong>F:\\salon bills</strong>) par yeh invoice hamesha ke liye safe saved hai.</p>
                    <p>Contact Helpline: <strong>8745869645</strong></p>
                    <a href="https://wa.me/918745869645" class="btn">Contact Salon via WhatsApp</a>
                </div>
            </body>
            </html>
        `);
    }
});

// Static directory fallback
app.use('/bills', express.static(billsDir));

// Online Booking Page
app.get('/book', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Online Appointment Request | Sakshi Makeover & Unisex Salon</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F111A; color: #fff; margin: 0; padding: 20px; }
            .container { max-width: 480px; margin: 30px auto; background: #181B26; border-radius: 20px; padding: 28px; border: 1px solid rgba(93, 83, 162, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h2 { color: #fff; text-align: center; margin-bottom: 5px; font-size: 21px; }
            p.sub { text-align: center; color: #8F94A6; font-size: 12px; margin-top: 0; margin-bottom: 25px; }
            label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 6px; color: #A4A9C0; }
            input, select { width: 100%; padding: 12px; background: #0F111A; border: 1px solid #2B3045; border-radius: 10px; color: #fff; font-size: 14px; margin-bottom: 15px; box-sizing: border-box; }
            input:focus, select:focus { outline: none; border-color: #5D53A2; }
            button { width: 100%; padding: 14px; background: #5D53A2; border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.3s; }
            button:hover { background: #4D4488; }
            .pending-alert { display: none; background: #1B2133; border: 1.5px solid #5D53A2; color: #E0E2EC; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px; font-size: 13.5px; line-height: 1.6; }
            .pending-alert strong { color: #8C82E6; font-size: 17px; display: block; margin-bottom: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Sakshi Makeover & Unisex Salon</h2>
            <p class="sub">R-9 opp. Bagga Jewellers, Shakarpur, Laxmi Nagar | Contact: 8745869645</p>
            
            <div id="pendingAlert" class="pending-alert">
                <strong>Request Received Successfully!</strong>
                Thank you for choosing us. Our team is verifying stylist availability for your selected slot and will send an official confirmation via WhatsApp shortly.
            </div>

            <form id="bookingForm">
                <label>Your Full Name</label>
                <input type="text" id="custName" required placeholder="Enter your full name">

                <label>WhatsApp Contact Number</label>
                <input type="tel" id="custPhone" required placeholder="Enter 10-digit WhatsApp number">

                <label>Preferred Date</label>
                <input type="date" id="bookDate" required>

                <label>Preferred Time Slot</label>
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

                <label>Select Treatment / Service</label>
                <select id="service">
                    <option value="Haircut & Styling">Haircut & Styling (500)</option>
                    <option value="Hair Spa & Treatment">Hair Spa & Treatment (1200)</option>
                    <option value="Keratin Treatment">Keratin Treatment (3500)</option>
                    <option value="Facial Glow & Clean-up">Facial Glow & Clean-up (1500)</option>
                    <option value="Bridal / HD Makeup">Bridal / HD Makeup (8000)</option>
                    <option value="Hair Coloring / Highlights">Hair Coloring / Highlights (2500)</option>
                </select>

                <button type="submit">Submit Appointment Request</button>
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
                        document.getElementById('pendingAlert').style.display = 'block';
                        document.getElementById('bookingForm').style.display = 'none';
                    }
                } catch(err) {
                    alert('Submission failed. Please try again or reach us at 8745869645.');
                }
            });
        </script>
    </body>
    </html>
    `);
});

// Bookings API
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
