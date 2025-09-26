const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const webpush = require('web-push');

const { setSocketIO, setTranslator, setNotificationSender } = require('./controllers/booking.controller');
const bookingRoutes = require('./routes/booking.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const driverRoutes = require('./routes/driver.routes');
const aiRoutes = require('./routes/ai.routes');
const { loadTranslations, t } = require('./translator');
const { validateUser } = require('./middleware');

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

// --- VAPID Configuration ---
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  'mailto:juan.nadal.ferrer@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// --- Internationalization Setup ---
loadTranslations();
// ------------------------------------


// Middleware
const corsOptions = {
  // Permitir localhost, IPs de red local y cualquier subdominio de ngrok
  origin: [
    'http://localhost:5173',
    'http://192.168.1.69:5173', // IP específica del móvil
    /^http:\/\/192\.168\.\d+\.\d+:5173$/,
    /https:\/\/.+\.ngrok-free\.app/
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Override restrictive CSP headers
app.use((req, res, next) => {
  // Una política más permisiva para el desarrollo con ngrok
  res.setHeader("Content-Security-Policy", "connect-src 'self' *;");
  next();
});

// --- Socket.IO Setup ---
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Simplificamos para desarrollo
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// --- Push Notification Setup ---
let subscriptions = []; 

const sendNotification = (payload) => {
  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription, JSON.stringify(payload))
      .catch(error => console.error('Error sending notification:', error));
  });
};

// Pass dependencies to the controller
setSocketIO(io);
setTranslator(t);
setNotificationSender(sendNotification);
// ------------------------

// --- API Routes ---

// Subscription route
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Subscription successful' });
});


// Auth routes
app.post('/api/register', validateUser, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await prisma.user.create({
            data: {
                username: req.body.username,
                password: hashedPassword
            }
        });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.post('/api/login', validateUser, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { username: req.body.username } });
    if (user == null) {
        return res.status(400).json({ message: 'Cannot find user' });
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ accessToken: accessToken });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/ai', aiRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});