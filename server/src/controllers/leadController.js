const Lead = require('../models/Lead');
const Report = require('../models/Report');
const { sendConfirmationEmail } = require('../utils/emailService');
const { memoryStore } = require('./auditController');

const isDBConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// Quick helper to escape HTML characters for defense-in-depth XSS prevention
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// Create a new lead (POST /api/leads or POST /api/report/:id/lead)
const submitLead = async (req, res, next) => {
  try {
    const reportId = req.params.id || req.body.reportId;
    
    // Strict UUID validation to prevent injection or invalid requests
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!reportId || !uuidRegex.test(reportId)) {
      return res.status(400).json({ success: false, error: 'Invalid report ID format.' });
    }

    const email = escapeHtml(req.body.email);
    const companyName = escapeHtml(req.body.companyName);
    const role = escapeHtml(req.body.role || 'Developer');
    const teamSize = Number(req.body.teamSize) || 1;

    let report = null;

    if (isDBConnected()) {
      // Secure ORM find with parameterized UUID
      report = await Report.findOne({ id: reportId });
      if (report) {
        report.leadCaptured = true;
        report.leadDetails = { email, companyName, role, teamSize };
        await report.save();

        // Save to Leads collection with parameterized Mongoose schema
        const newLead = new Lead({
          email,
          companyName,
          role,
          teamSize,
          reportId
        });
        await newLead.save();
      }
    } else {
      report = memoryStore.get(reportId);
      if (report) {
        report.leadCaptured = true;
        report.leadDetails = { email, companyName, role, teamSize };
        memoryStore.set(reportId, report);
      }
    }

    if (!report) {
      return res.status(404).json({ success: false, error: 'Associated audit report not found.' });
    }

    // Trigger confirmation email and capture preview URL if in dev sandbox mode
    const mailResult = await sendConfirmationEmail(email, companyName, report.monthlySavings, reportId);

    res.json({ 
      success: true, 
      message: 'Lead captured and confirmation email sent.',
      previewUrl: mailResult && mailResult.previewUrl ? mailResult.previewUrl : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitLead
};
