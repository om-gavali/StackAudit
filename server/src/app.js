const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  const conn = require('./config/db');
  return conn();
};

const auditRoutes = require('./routes/auditRoutes');
const leadRoutes = require('./routes/leadRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const User = require('./models/User');
const PricingData = require('./models/PricingData');

const app = express();

// Configure HTTP security headers (CSP, frame-blocking, strict Transport Security)
app.use(helmet());

// Configure custom CORS policy restricting wildcard access in production
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("CORS Incoming Origin:", origin);
    if (!origin) return callback(null, true);
    const isLocalhost = origin === 'http://localhost' || origin.startsWith('http://localhost:') || 
                        origin === 'http://127.0.0.1' || origin.startsWith('http://127.0.0.1:');
    if (isLocalhost || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    const msg = `CORS policy does not allow access from the specified origin.`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Seed function for default admin and initial pricing configurations
const seedDatabase = async () => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return;

    // 1. Seed Admin with robust bcrypt hashing (cost >= 12)
    const adminCount = await User.countDocuments();
    if (adminCount === 0) {
      console.log('Seeding default administrator credentials...');
      const rawPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(rawPassword, 12);
      
      const adminUser = new User({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: hashedPassword
      });
      await adminUser.save();
      console.log('Default admin seeded with secure bcrypt hash (cost: 12)');
    }

    // 2. Seed PricingData
    const pricingCount = await PricingData.countDocuments();
    if (pricingCount === 0) {
      console.log('Seeding AI tool pricing database...');
      const initialPricing = [
        {
          toolName: 'Cursor',
          plans: [
            { name: 'Hobby', cost: 0 },
            { name: 'Pro', cost: 20 },
            { name: 'Business', cost: 40 }
          ],
          alternatives: [
            { name: 'GitHub Copilot', cost: 10, reason: 'Cheaper, but lack premium chat models' },
            { name: 'Windsurf', cost: 20, reason: 'Alternative AI editor' }
          ]
        },
        {
          toolName: 'GitHub Copilot',
          plans: [
            { name: 'Individual', cost: 10 },
            { name: 'Business', cost: 19 },
            { name: 'Enterprise', cost: 39 }
          ],
          alternatives: [
            { name: 'Cursor Pro', cost: 20, reason: 'Provides full IDE and chats integrated' }
          ]
        },
        {
          toolName: 'ChatGPT',
          plans: [
            { name: 'Plus', cost: 20 },
            { name: 'Team', cost: 30 },
            { name: 'Enterprise', cost: 60 }
          ],
          alternatives: [
            { name: 'Gemini Advanced', cost: 20, reason: 'Bundled with Google One storage' },
            { name: 'Claude Pro', cost: 20, reason: 'Better reasoning and coding outputs' }
          ]
        },
        {
          toolName: 'Claude',
          plans: [
            { name: 'Pro', cost: 20 },
            { name: 'Team', cost: 30 }
          ],
          alternatives: [
            { name: 'ChatGPT Plus', cost: 20, reason: 'Alternative chat model interface' }
          ]
        },
        {
          toolName: 'Gemini',
          plans: [
            { name: 'Advanced', cost: 20 }
          ]
        },
        {
          toolName: 'OpenAI API',
          plans: [
            { name: 'Usage-based', cost: 50 }
          ]
        },
        {
          toolName: 'Anthropic API',
          plans: [
            { name: 'Usage-based', cost: 50 }
          ]
        },
        {
          toolName: 'Windsurf',
          plans: [
            { name: 'Pro', cost: 20 },
            { name: 'Team', cost: 30 }
          ]
        }
      ];

      await PricingData.insertMany(initialPricing);
      console.log('AI tool pricing database seeded successfully.');
    }
  } catch (error) {
    console.error('Database seeding failed:', error.message);
  }
};

// Initialize DB and Seed Data
connectDB().then((isConnected) => {
  if (isConnected) {
    seedDatabase();
  }
});

// API Routes Mounting
app.use('/api', auditRoutes);
app.use('/api', leadRoutes);
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
