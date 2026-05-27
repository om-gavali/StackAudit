const express = require('express');
const router = express.Router();
const { createAudit, getReport, generateSummary } = require('../controllers/auditController');
const { generalLimiter, aiLimiter } = require('../middleware/rateLimiters');
const { validateBody, schemas } = require('../middleware/validate');

// Support both standard endpoint name and alias - protected with AI specific limits & Joi schemas
router.post('/audit', aiLimiter, validateBody(schemas.audit), createAudit);
router.post('/analyze', aiLimiter, validateBody(schemas.audit), createAudit);

// Get report detail (public or admin view) - protected with general rate limiting
router.get('/report/:id', generalLimiter, getReport);

// Dedicated generate summary - protected with AI limits and robust Joi schemas
router.post('/generate-summary', aiLimiter, validateBody(schemas.generateSummary), generateSummary);

module.exports = router;
