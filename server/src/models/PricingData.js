const mongoose = require('mongoose');

const pricingDataSchema = new mongoose.Schema({
  toolName: { type: String, required: true, unique: true },
  plans: [
    {
      name: { type: String, required: true },
      cost: { type: Number, required: true },
      billingType: { type: String, default: 'monthly' } // monthly, annual, pay-as-you-go
    }
  ],
  alternatives: [
    {
      name: { type: String },
      cost: { type: Number },
      reason: { type: String }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PricingData', pricingDataSchema);
