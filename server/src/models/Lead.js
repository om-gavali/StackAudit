const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  email: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, default: 'Developer' },
  teamSize: { type: Number, default: 1 },
  reportId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);
