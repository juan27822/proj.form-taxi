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

const { setSocketIO, setTranslator } = require('./controllers/booking.controller');
const bookingRoutes = require('./routes/booking.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const driverRoutes = require('./routes/driver.routes');
const { validateUser } = require('./middleware');

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

// --- Internationalization Setup ---
const loadTranslations = () => {
  const localesDir = path.join(__dirname, '../../taxi/taxi-booking-app/src/locales');
  const translations = {};
  try {
    const languages = require('fs').readdirSync(localesDir);
    for (const lang of languages) {
      const translationPath = path.join(localesDir, lang, 'translation.json');
      if (require('fs').existsSync(translationPath)) {
        const fileContent = require('fs').readFileSync(translationPath, 'utf8');
        translations[lang] = JSON.parse(fileContent);
      }
    }
  } catch (error) {
    console.error('Error reading locales directory:', error);
  }
  return translations;
};

const translations = loadTranslations();

const t = (lang, key, replacements = {}) => {
  const langKey = lang.split('-')[0]; // Handle 'en-US' etc.
  let translation = translations[langKey]?.[key] || translations.en[key] || key;
  for (const placeholder in replacements) {
    translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
  }
  return translation;
};
// ------------------------------------


// Middleware
const corsOptions = {
  origin: 'http://localhost:5173', // Allow only the frontend to connect
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Override restrictive CSP headers
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self' http://localhost:5173; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' ws://localhost:5173 http://localhost:3001; " +
    "img-src 'self' data:;");
  next();
});

// --- Socket.IO Setup ---
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Pass io and t to the controller
setSocketIO(io);
setTranslator(t);
// ------------------------

// --- API Routes ---

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
        return res.status(400).send('Cannot find user');
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ accessToken: accessToken });
        } else {
            res.send('Not Allowed');
        }
    } catch {
        res.status(500).send();
    }
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/drivers', driverRoutes);


httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
