const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getStats, getReports, getLeads, deleteReport } = require('../controllers/adminController');
const { generalLimiter } = require('../middleware/rateLimiters');

// Secure all admin endpoints with auth middleware and rate limiting
router.use(authMiddleware);
router.use(generalLimiter);

router.get('/stats', getStats);
router.get('/reports', getReports);
router.get('/leads', getLeads);
router.delete('/reports/:id', deleteReport);

module.exports = router;
