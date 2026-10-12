const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
// 50mb limit taaki PDF data turant parse ho sake
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let onlineBookings = [];

// 1. FAST JSON BASE64 UPLOAD (Guaranteed 1-second file write)
app.post('/upload-json', (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ success: false, message: 'Missing filename or data' });
    }
    const cleanName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(uploadsDir, cleanName);
    
    // Direct write buffer to disk
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Saved ${cleanName} (${buffer.length} bytes) to disk`);

    const fileUrl = `https://sakshi-salon-server.onrender.com/uploads/${cleanName}`;
    return res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. VIEW / DOWNLOAD PDF
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + req.params.filename + '"');
    return res.sendFile(filePath);
  } else {
    res.status(404).send('<h2 style="font-family:sans-serif;text-align:center;margin-top:50px;">Invoice file processing ho rahi hai, kripya 5 second baad refresh karein.</h2>');
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
