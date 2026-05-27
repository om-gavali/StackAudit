const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiters');
const { validateBody, schemas } = require('../middleware/validate');

// Support both auth endpoints specified in requirements, secured with rate limiting and schema validation
router.post('/auth/login', authLimiter, validateBody(schemas.login), adminLogin);
router.post('/admin/login', authLimiter, validateBody(schemas.login), adminLogin);

module.exports = router;
