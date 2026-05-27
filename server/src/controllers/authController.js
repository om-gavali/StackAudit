const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'stackauditsecretkey123';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Cache hashed env password for database-offline fallbacks using bcrypt (cost 12)
let hashedEnvPasswordCache = null;
const getHashedEnvPassword = async () => {
  if (!hashedEnvPasswordCache) {
    hashedEnvPasswordCache = await bcrypt.hash(ADMIN_PASSWORD, 12);
  }
  return hashedEnvPasswordCache;
};

// Locked Accounts Tracking Store
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes lockout

const isDBConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const now = Date.now();
    const lockoutData = failedAttempts.get(username);

    // Enforce brute-force protection
    if (lockoutData && lockoutData.attempts >= MAX_ATTEMPTS) {
      if (now - lockoutData.lastAttempt < LOCKOUT_DURATION) {
        const remainingMinutes = Math.ceil((LOCKOUT_DURATION - (now - lockoutData.lastAttempt)) / 1000 / 60);
        return res.status(429).json({
          success: false,
          error: `Account is temporarily locked due to excessive failed attempts. Please try again in ${remainingMinutes} minute(s).`
        });
      } else {
        // Lockout expired, clear limits
        failedAttempts.delete(username);
      }
    }

    let isMatch = false;
    let dbUser = null;

    if (isDBConnected()) {
      // Query DB via ORM and compare hash safely
      dbUser = await User.findOne({ username });
      if (dbUser) {
        isMatch = await bcrypt.compare(password, dbUser.password);
      }
    } else {
      // Offline fallback: Compare using securely cached bcrypt hash of environment credentials
      if (username === ADMIN_USERNAME) {
        const hashedFallback = await getHashedEnvPassword();
        isMatch = await bcrypt.compare(password, hashedFallback);
      }
    }

    if (isMatch) {
      // Reset brute-force counter on successful verification
      failedAttempts.delete(username);

      const token = jwt.sign(
        { username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '2h' } // Short JWT expiry for maximum security
      );
      
      return res.json({ success: true, token });
    }

    // Track failed authentication attempt
    const currentLockout = failedAttempts.get(username) || { attempts: 0, lastAttempt: 0 };
    currentLockout.attempts += 1;
    currentLockout.lastAttempt = now;
    failedAttempts.set(username, currentLockout);

    // Return generic error message to prevent credential/account enumeration
    res.status(401).json({ 
      success: false, 
      error: 'Invalid username or password.' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin
};
