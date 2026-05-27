const Report = require('../models/Report');
const Lead = require('../models/Lead');
const { memoryStore } = require('./auditController');

const isDBConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    let reportsCount = 0;
    let leadsCount = 0;
    let totalMonthlySavings = 0;
    let totalYearlySavings = 0;
    let stageBreakdown = { Startup: 0, Growth: 0, Enterprise: 0, Agency: 0, Freelancer: 0 };
    let useCaseBreakdown = { coding: 0, writing: 0, research: 0, 'data analysis': 0, mixed: 0 };

    if (isDBConnected()) {
      reportsCount = await Report.countDocuments();
      leadsCount = await Lead.countDocuments();
      
      const savingsResult = await Report.aggregate([
        {
          $group: {
            _id: null,
            totalMonthly: { $sum: '$monthlySavings' },
            totalYearly: { $sum: '$yearlySavings' }
          }
        }
      ]);
      
      if (savingsResult.length > 0) {
        totalMonthlySavings = savingsResult[0].totalMonthly;
        totalYearlySavings = savingsResult[0].totalYearly;
      }

      // Stage & Use Case Counts
      const reports = await Report.find({}, 'companyDetails');
      reports.forEach(r => {
        if (r.companyDetails) {
          const stage = r.companyDetails.companyStage;
          const useCase = r.companyDetails.primaryUseCase;
          if (stage && stageBreakdown[stage] !== undefined) stageBreakdown[stage]++;
          if (useCase && useCaseBreakdown[useCase] !== undefined) useCaseBreakdown[useCase]++;
        }
      });
    } else {
      const reports = Array.from(memoryStore.values());
      reportsCount = reports.length;
      leadsCount = reports.filter(r => r.leadCaptured).length;
      
      reports.forEach(r => {
        totalMonthlySavings += r.monthlySavings;
        totalYearlySavings += r.yearlySavings;
        if (r.companyDetails) {
          const stage = r.companyDetails.companyStage;
          const useCase = r.companyDetails.primaryUseCase;
          if (stage && stageBreakdown[stage] !== undefined) stageBreakdown[stage]++;
          if (useCase && useCaseBreakdown[useCase] !== undefined) useCaseBreakdown[useCase]++;
        }
      });
    }

    res.json({
      success: true,
      stats: {
        totalAudits: reportsCount,
        totalLeads: leadsCount,
        conversionRate: reportsCount > 0 ? Math.round((leadsCount / reportsCount) * 100) : 0,
        totalMonthlySavings,
        totalYearlySavings,
        stageBreakdown,
        useCaseBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    let reports = [];
    if (isDBConnected()) {
      reports = await Report.find().sort({ createdAt: -1 });
    } else {
      reports = Array.from(memoryStore.values()).sort((a, b) => b.createdAt - a.createdAt);
    }
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/leads
const getLeads = async (req, res, next) => {
  try {
    let leads = [];
    if (isDBConnected()) {
      leads = await Lead.find().sort({ createdAt: -1 });
    } else {
      // Create leads list from memory store reports
      const reports = Array.from(memoryStore.values());
      leads = reports
        .filter(r => r.leadCaptured)
        .map(r => ({
          email: r.leadDetails.email,
          companyName: r.leadDetails.companyName,
          role: r.leadDetails.role,
          teamSize: r.leadDetails.teamSize,
          reportId: r.id,
          createdAt: r.createdAt
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
    }
    res.json(leads);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/reports/:id
const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Strict UUID validation on parameter to prevent arbitrary parameter deletion
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({ success: false, error: 'Invalid report ID format.' });
    }

    if (isDBConnected()) {
      await Report.deleteOne({ id });
      await Lead.deleteOne({ reportId: id });
    } else {
      memoryStore.delete(id);
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error(`[Admin Deletion Error] ${new Date().toISOString()} - Route: DELETE /api/admin/reports/:id - ID: ${req.params.id}:`, error.message);
    next(error);
  }
};

module.exports = {
  getStats,
  getReports,
  getLeads,
  deleteReport
};
