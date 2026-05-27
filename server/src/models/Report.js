const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  totalCurrentMonthlySpend: { type: Number, required: true },
  totalOptimizedMonthlySpend: { type: Number, required: true },
  monthlySavings: { type: Number, required: true },
  yearlySavings: { type: Number, required: true },
  recommendations: { type: Array, default: [] },
  optimizedStack: { type: Array, default: [] },
  originalTools: { type: Array, default: [] },
  companyDetails: {
    teamSize: { type: Number, default: 1 },
    companyStage: { type: String, default: 'Startup' },
    primaryUseCase: { type: String, default: 'mixed' }
  },
  aiSummary: { type: String, default: '' },
  leadCaptured: { type: Boolean, default: false },
  leadDetails: {
    email: String,
    companyName: String,
    role: String,
    teamSize: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
