# StackAudit Testing Suite 🧪

This document specifies unit, integration, and user interface test cases designed to guarantee the correctness of StackAudit's optimization algorithms, data structures, and auth layers.

---

## 📊 Core Audit Engine Test Cases

The optimization rules engine (`server/src/utils/auditEngine.js`) executes calculations deterministically. Below are the 5 core test cases verifying its math and recommendation patterns:

### Test Case 1: Empty Input Stack
- **Input**: `tools = []`, `companyDetails = { teamSize: 5 }`
- **Expected Outcome**:
  - `totalCurrentMonthlySpend = 0`
  - `totalOptimizedMonthlySpend = 0`
  - `monthlySavings = 0`
  - `recommendations = []`
  - `optimizedStack = []`

### Test Case 2: Standard Developer Tooling Optimization (Cursor Downgrade)
- **Input**:
  - `tools = [{ name: 'Cursor', plan: 'Business', spend: 80, seats: 2 }]` // $40/seat
  - `companyDetails = { teamSize: 2 }`
- **Expected Outcome**:
  - Since team size is under 5, they should downgrade from Business to Pro ($20/seat).
  - `totalCurrentMonthlySpend = 80`
  - `totalOptimizedMonthlySpend = 40`
  - `monthlySavings = 40`
  - `recommendations` includes an entry recommending downgrading from Business to Pro.

### Test Case 3: ChatGPT Pro vs API Optimization
- **Input**:
  - `tools = [{ name: 'ChatGPT', plan: 'Enterprise', spend: 300, seats: 5 }]` // $60/seat
  - `companyDetails = { teamSize: 5, primaryUseCase: 'coding' }`
- **Expected Outcome**:
  - If the primary use case is coding, recommend alternative setups like transitioning to Cursor Pro or Gemini Advanced.
  - Returns calculated alternative options with exact savings rates.

### Test Case 4: No Savings (Tooling is already optimized)
- **Input**:
  - `tools = [{ name: 'GitHub Copilot', plan: 'Individual', spend: 10, seats: 1 }]`
  - `companyDetails = { teamSize: 1 }`
- **Expected Outcome**:
  - `totalCurrentMonthlySpend = 10`
  - `totalOptimizedMonthlySpend = 10`
  - `monthlySavings = 0`
  - `recommendations` = []

### Test Case 5: Oversized Seat Allocation Cleanup
- **Input**:
  - `tools = [{ name: 'Claude', plan: 'Team', spend: 90, seats: 3 }]` // 3 seats
  - `companyDetails = { teamSize: 1 }` // But company only has 1 employee!
- **Expected Outcome**:
  - Flag structural waste (2 inactive seats).
  - Recommend reducing seat count to match team size.
  - `totalCurrentMonthlySpend = 90`
  - `totalOptimizedMonthlySpend = 30`
  - `monthlySavings = 60`

---

## 📡 API Endpoint Integrations

We use Jest alongside Supertest to validate endpoints:

### 1. `POST /api/audit`
- **Success Criteria**: Returns HTTP 201 with UUID.
- **Fail Criteria**: Returns HTTP 400 when tools array is missing or contains negative seats.

### 2. `GET /api/report/:id` (PII Scrubbing Test)
- **Without Admin Authorization**: Returns report object. `leadDetails.email` and `leadDetails.companyName` MUST be undefined.
- **With Admin JWT Header**: Returns full report object including unscrubbed `leadDetails`.

---

## 🖥️ Frontend Form Validation Tests

Validation checks run in the client browser during multi-step setup:

1. **Step 1 (Company Details)**: Team size input must be an integer > 0. Clicking "Configure Stack" blocks progress and fires red alerts if inputs are blank.
2. **Step 2 (Tool Stack Builder)**: Adding a tool with 0 seats or 0 spend is blocked. Displays input warnings.

---

## 🚀 How to Run Tests

### Local Setup
Ensure testing devDependencies are installed in the backend:
```bash
cd server
npm install --save-dev jest supertest
```

### Execution Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage reports
npm run test:coverage
```

### Example Test Script (`server/test/audit.test.js`)
```javascript
const { runAudit } = require('../src/utils/auditEngine');

describe('Audit Engine Deterministic Logic', () => {
  test('should compute zero savings for empty tool stacks', () => {
    const results = runAudit([], { teamSize: 5 });
    expect(results.totalCurrentMonthlySpend).toBe(0);
    expect(results.monthlySavings).toBe(0);
    expect(results.recommendations.length).toBe(0);
  });

  test('should recommend downgrading Cursor Business to Pro for small teams', () => {
    const tools = [{ name: 'Cursor', plan: 'Business', spend: 80, seats: 2 }];
    const details = { teamSize: 2 };
    
    const results = runAudit(tools, details);
    expect(results.totalCurrentMonthlySpend).toBe(80);
    expect(results.totalOptimizedMonthlySpend).toBe(40);
    expect(results.monthlySavings).toBe(40);
    expect(results.recommendations[0].action).toBe('Downgrade Plan');
  });
});
```

---

## 📈 Expected Test Coverage Target

We target the following coverage metrics for production releases:

| Component | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **Audit Engine** | 100% | 95% | 100% | 100% |
| **API Controllers**| 85% | 80% | 90% | 85% |
| **Middlewares** | 90% | 90% | 100% | 90% |
| **Overall** | **91%** | **87%** | **96%** | **91%** |
