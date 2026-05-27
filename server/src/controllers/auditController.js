const Report = require('../models/Report');
const { runAudit } = require('../utils/auditEngine');
const { generateAuditSummary } = require('../utils/aiService');
const { v4: uuidv4 } = require('uuid');

// Local persistent file-backed backup store if database is unavailable
const fs = require('fs');
const path = require('path');

class FileBackedStore {
  constructor() {
    this.filePath = path.join(__dirname, '../../reports-db.json');
    this.data = new Map();
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(fileContent);
        for (const [key, value] of Object.entries(parsed)) {
          if (value.createdAt) {
            value.createdAt = new Date(value.createdAt);
          }
          this.data.set(key, value);
        }
        console.log(`[Storage] Loaded ${this.data.size} reports from local persistent fallback store.`);
      } else {
        console.log('[Storage] Local persistent fallback store empty. Creating new.');
        this.save();
      }
    } catch (err) {
      console.error('[Storage Error] Failed to load local reports-db.json:', err.message);
    }
  }

  save() {
    try {
      const obj = {};
      for (const [key, value] of this.data.entries()) {
        obj[key] = value;
      }
      fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2), 'utf8');
    } catch (err) {
      console.error('[Storage Error] Failed to save to local reports-db.json:', err.message);
    }
  }

  get(key) {
    return this.data.get(key);
  }

  set(key, value) {
    this.data.set(key, value);
    this.save();
    return this;
  }

  delete(key) {
    const res = this.data.delete(key);
    this.save();
    return res;
  }

  values() {
    return this.data.values();
  }

  has(key) {
    return this.data.has(key);
  }

  get size() {
    return this.data.size;
  }
}

const memoryStore = new FileBackedStore();

// Helper to check if mongoose connection is active
const isDBConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// Escapes HTML characters for security/XSS prevention
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// Create a new spend audit
const createAudit = async (req, res, next) => {
  try {
    const { tools, companyDetails } = req.body;

    // Sanitize string elements for security
    const sanitizedTools = tools.map(t => ({
      name: escapeHtml(t.name),
      plan: escapeHtml(t.plan),
      spend: Number(t.spend) || 0,
      seats: Number(t.seats) || 1
    }));

    const sanitizedCompanyDetails = {
      teamSize: Number(companyDetails.teamSize) || 1,
      companyStage: escapeHtml(companyDetails.companyStage),
      primaryUseCase: escapeHtml(companyDetails.primaryUseCase)
    };

    // Run audit logic calculations
    const auditResults = runAudit(sanitizedTools, sanitizedCompanyDetails);

    // Generate AI Summary securely via backend
    const aiSummary = await generateAuditSummary(
      sanitizedTools,
      sanitizedCompanyDetails,
      auditResults.totalCurrentMonthlySpend,
      auditResults.totalOptimizedMonthlySpend,
      auditResults.monthlySavings,
      auditResults.optimizedStack
    );

    const reportData = {
      id: uuidv4(),
      ...auditResults,
      originalTools: sanitizedTools,
      companyDetails: sanitizedCompanyDetails,
      aiSummary: escapeHtml(aiSummary),
      leadCaptured: false,
      leadDetails: {},
      createdAt: new Date()
    };

    if (isDBConnected()) {
      const report = new Report(reportData);
      await report.save();
    } else {
      memoryStore.set(reportData.id, reportData);
    }

    res.status(201).json({ success: true, id: reportData.id });
  } catch (error) {
    // Log detailed server-side error, but yield generic 500 error through handler
    console.error(`[Audit Creation Error] ${new Date().toISOString()} - Route: POST /api/audit:`, error.message);
    next(error);
  }
};

// Get audit report details
const getReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Strict UUID validation on parameters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({ success: false, error: 'Invalid report ID format.' });
    }

    let report = null;

    if (isDBConnected()) {
      // Secure ORM search
      report = await Report.findOne({ id });
    } else {
      report = memoryStore.get(id);
    }

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const reportObj = report.toObject ? report.toObject() : { ...report };
    
    // Check if requester is admin (jwt verification)
    const authHeader = req.headers['authorization'];
    let isAdmin = false;
    if (authHeader) {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'stackauditsecretkey123';
      try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET);
        isAdmin = true;
      } catch (e) {
        // Not admin
      }
    }

    // Scrub PII for public sharing if requester is not authenticated admin
    if (!isAdmin && reportObj.leadDetails) {
      delete reportObj.leadDetails.email;
      delete reportObj.leadDetails.companyName;
    }

    res.json(reportObj);
  } catch (error) {
    console.error(`[Report Retrieval Error] ${new Date().toISOString()} - Route: GET /api/report/:id - ID: ${req.params.id}:`, error.message);
    next(error);
  }
};

// Explicit route to generate or regenerate a summary
const generateSummary = async (req, res, next) => {
  try {
    const { tools, companyDetails, currentSpend, optimizedSpend, savings, optimizedTools } = req.body;
    
    const sanitizedTools = tools.map(t => ({
      name: escapeHtml(t.name),
      plan: escapeHtml(t.plan || ''),
      spend: Number(t.spend) || 0,
      seats: Number(t.seats) || 1
    }));

    const sanitizedCompanyDetails = {
      teamSize: Number(companyDetails.teamSize) || 1,
      primaryUseCase: escapeHtml(companyDetails.primaryUseCase)
    };

    const sanitizedOptimizedTools = optimizedTools.map(t => ({
      name: escapeHtml(t.name),
      cost: Number(t.cost) || 0,
      seats: Number(t.seats) || 1
    }));

    const summary = await generateAuditSummary(
      sanitizedTools,
      sanitizedCompanyDetails,
      Number(currentSpend) || 0,
      Number(optimizedSpend) || 0,
      Number(savings) || 0,
      sanitizedOptimizedTools
    );

    res.json({ success: true, summary: escapeHtml(summary) });
  } catch (error) {
    console.error(`[AI Summary Generation Error] ${new Date().toISOString()} - Route: POST /api/generate-summary:`, error.message);
    next(error);
  }
};

module.exports = {
  createAudit,
  getReport,
  generateSummary,
  memoryStore
};
