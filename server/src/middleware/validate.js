const Joi = require('joi');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true // Strip unknown fields for safety
    });

    if (error) {
      const errorDetails = error.details.map(d => d.message).join(', ');
      return res.status(400).json({
        success: false,
        error: `Validation error: ${errorDetails}`
      });
    }

    req.body = value; // Replace body with validated and cleaned values
    next();
  };
};

// Supported tools in system
const SUPPORTED_TOOLS = [
  'Cursor', 'GitHub Copilot', 'ChatGPT', 'Claude', 'Gemini', 'OpenAI API', 'Anthropic API', 'Windsurf'
];

// Supported company stages
const SUPPORTED_STAGES = ['Startup', 'Growth', 'Enterprise', 'Agency', 'Freelancer'];

// Supported primary use cases
const SUPPORTED_USE_CASES = ['coding', 'writing', 'research', 'data analysis', 'mixed'];

// Schemas
const schemas = {
  audit: Joi.object({
    tools: Joi.array().items(
      Joi.object({
        name: Joi.string().valid(...SUPPORTED_TOOLS).required().messages({
          'any.only': `Tool must be one of: ${SUPPORTED_TOOLS.join(', ')}`
        }),
        plan: Joi.string().max(50).required(),
        spend: Joi.number().min(0).max(1000000).required(),
        seats: Joi.number().integer().min(1).max(100000).required()
      })
    ).min(1).required(),
    companyDetails: Joi.object({
      teamSize: Joi.number().integer().min(1).max(100000).required(),
      companyStage: Joi.string().valid(...SUPPORTED_STAGES).required(),
      primaryUseCase: Joi.string().valid(...SUPPORTED_USE_CASES).required()
    }).required()
  }),

  lead: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid work email address.'
    }),
    companyName: Joi.string().max(100).required(),
    role: Joi.string().max(100).required(),
    teamSize: Joi.number().integer().min(1).max(100000).required(),
    reportId: Joi.string().guid({ version: 'uuidv4' }).optional()
  }),

  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    password: Joi.string().min(6).max(100).required()
  }),

  generateSummary: Joi.object({
    tools: Joi.array().items(
      Joi.object({
        name: Joi.string().valid(...SUPPORTED_TOOLS).required(),
        plan: Joi.string().max(50).optional(),
        spend: Joi.number().min(0).optional(),
        seats: Joi.number().integer().min(1).optional()
      })
    ).required(),
    companyDetails: Joi.object({
      teamSize: Joi.number().integer().min(1).required(),
      primaryUseCase: Joi.string().valid(...SUPPORTED_USE_CASES).required()
    }).required(),
    currentSpend: Joi.number().min(0).required(),
    optimizedSpend: Joi.number().min(0).required(),
    savings: Joi.number().min(0).required(),
    optimizedTools: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        cost: Joi.number().min(0).required(),
        seats: Joi.number().integer().min(1).optional()
      })
    ).required()
  })
};

module.exports = {
  validateBody,
  schemas
};
