const express = require('express');
const router = express.Router();
const { submitLead } = require('../controllers/leadController');
const { generalLimiter } = require('../middleware/rateLimiters');
const { validateBody, schemas } = require('../middleware/validate');

// Support both standard POST /api/leads and specific POST /api/report/:id/lead
router.post('/leads', generalLimiter, validateBody(schemas.lead), submitLead);
router.post('/report/:id/lead', generalLimiter, validateBody(schemas.lead), submitLead);

module.exports = router;
