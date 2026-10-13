import { dbStore } from './store.js';
import { connectDB } from './connection.js';
import { UserModel, ClientModel, MandateModel, AuditLogModel, RequestModel } from './models.js';
import mongoose from 'mongoose';

// Realistic Indian WealthTech and SEBI Advisory Seeder
export async function runSeed(options = {}) {
  console.log('[Seed] Initiating realistic platform database seeder...');
  const startTime = Date.now();

  // 1. Strict Production Safeguard
  const activeEnv = process.env.NODE_ENV || 'development';
  if (activeEnv === 'production') {
    throw new Error('[Safety Abort] Database wipe and re-seeding is strictly prohibited in production environment.');
  }

  // Ensure DB connection is initialized if MONGODB_URI is configured
  if (process.env.MONGODB_URI && mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  if (mongoose.connection.readyState === 1) {
    const dbName = mongoose.connection.name || '';
    if (dbName.toLowerCase().includes('prod') && activeEnv !== 'test') {
      throw new Error(`[Safety Abort] Targeted database name '${dbName}' appears to be production. Aborting wipe.`);
    }
  }

  // Destructive reset requires explicit authorization
  const allowReset = options?.reset === true || process.env.ALLOW_SEED_RESET === 'true';

  // Deterministic bcrypt hash for 'Password@123'
  const defaultPasswordHash = '$2a$10$20gor5UMRbxD0N2.5fuZ1OAk5eTmWZCa6Aj2b5AKHVOfVU8SoIwwa';

  // Set seeding flag to prevent individual concurrent inserts
  dbStore.isSeeding = true;

  // Clear existing state before fresh seed
  dbStore.users.clear();
  dbStore.clients.clear();
  dbStore.mandates.clear();
  dbStore.requests.clear();
  dbStore.auditLogs.length = 0;

  // Helper for dates in past N days
  const pastDate = (daysAgo, hourOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(d.getHours() - hourOffset);
    return d.toISOString();
  };

  // 2. Primary Benchmark Organizations & Accounts

  // RIA 1: Prudent Wealth Advisory (Suresh Narayanan)
  const ria1 = dbStore.createUser({
    id: 'usr_ria_suresh',
    name: 'Suresh Narayanan',
    email: 'ria@example.in',
    passwordHash: defaultPasswordHash,
    role: 'ria',
    firmName: 'Prudent Wealth Advisory',
    sebiRegNumber: 'INA000088921',
    complianceEmail: 'compliance@prudentwealth.in',
    plan: 'pro',
    createdAt: pastDate(180),
  });

  // RIA 2: Artha Capital Advisors (Meera Iyer)
  const ria2 = dbStore.createUser({
    id: 'usr_ria_meera',
    name: 'Meera Iyer',
    email: 'pro.ria@example.in',
    passwordHash: defaultPasswordHash,
    role: 'ria',
    firmName: 'Artha Capital Advisors',
    sebiRegNumber: 'INA000099412',
    complianceEmail: 'audit@arthacapital.in',
    plan: 'pro',
    createdAt: pastDate(150),
  });

  // Statutory Compliance Officer: Sentinel Compliance Partners
  const complianceOfficer = dbStore.createUser({
    id: 'usr_compliance_officer',
    name: 'Vikramaditya Roy',
    email: 'compliance@example.in',
    passwordHash: defaultPasswordHash,
    role: 'compliance_officer',
    firmName: 'Sentinel Compliance Partners',
    sebiRegNumber: 'INA000010999',
    complianceEmail: 'compliance@example.in',
    plan: 'pro',
    createdAt: pastDate(200),
  });

  // Platform Super Admin
  const adminUser = dbStore.createUser({
    id: 'usr_admin_neha',
    name: 'Neha Singhania',
    email: 'admin@example.in',
    passwordHash: defaultPasswordHash,
    role: 'admin',
    firmName: 'FinConsent Platform Governance',
    complianceEmail: 'admin@finconsent.in',
    plan: 'pro',
    createdAt: pastDate(240),
  });

  // Client User account for Rohan Mehta (direct investor portal login)
  const clientUser = dbStore.createUser({
    id: 'usr_client_rohan',
    name: 'Rohan Mehta',
    email: 'client@example.in',
    passwordHash: defaultPasswordHash,
    role: 'client',
    pan: 'ABCPM1234F',
    mobile: '9820112345',
    firmName: 'Individual Investor',
    clientId: 'cli_1',
    plan: 'free',
    createdAt: pastDate(120),
  });

  // 3. Primary Benchmark Clients for RIA 1 (Prudent Wealth Advisory)
  const clientRohan = dbStore.createClient({
    id: 'cli_1',
    riaId: ria1.id,
    name: 'Rohan Mehta',
    pan: 'ABCPM1234F',
    dob: '1978-08-14', // Password: 123414081978
    mobile: '9820112345',
    email: 'rohan.mehta@investor.in',
    portfolioValue: 18500000, // ₹1.85 Cr
    riskProfile: 'Moderate-High',
    investmentHorizon: '7+ years',
    createdAt: pastDate(90),
  });

  const clientAnanya = dbStore.createClient({
    id: 'cli_ananya_kapoor',
    riaId: ria1.id,
    name: 'Ananya Kapoor',
    pan: 'ABCPK5678K',
    dob: '1983-11-22', // Password: 567822111983
    mobile: '9820256789',
    email: 'ananya.kapoor@investor.in',
    portfolioValue: 34000000, // ₹3.40 Cr
    riskProfile: 'Moderate',
    investmentHorizon: '10+ years',
    createdAt: pastDate(85),
  });

  const clientVikram = dbStore.createClient({
    id: 'cli_vikram_shah',
    riaId: ria1.id,
    name: 'Vikram Shah',
    pan: 'ABCPS9012S',
    dob: '1972-02-05', // Password: 901205021972
    mobile: '9820390123',
    email: 'vikram.shah@investor.in',
    portfolioValue: 67500000, // ₹6.75 Cr
    riskProfile: 'Moderate-High',
    investmentHorizon: '5–7 years',
    createdAt: pastDate(80),
  });

  // 4. Primary Benchmark Clients for RIA 2 (Artha Capital Advisors)
  const clientNikhil = dbStore.createClient({
    id: 'cli_nikhil_bansal',
    riaId: ria2.id,
    name: 'Nikhil Bansal',
    pan: 'XYZPB3456B',
    dob: '1985-06-18', // Password: 345618061985
    mobile: '9830434567',
    email: 'nikhil.bansal@investor.in',
    portfolioValue: 22000000, // ₹2.20 Cr
    riskProfile: 'High',
    investmentHorizon: '10+ years',
    createdAt: pastDate(70),
  });

  const clientKavita = dbStore.createClient({
    id: 'cli_kavita_shah',
    riaId: ria2.id,
    name: 'Kavita Shah',
    pan: 'XYZPS7890S',
    dob: '1990-09-30', // Password: 789030091990
    mobile: '9830578901',
    email: 'kavita.shah@investor.in',
    portfolioValue: 11500000, // ₹1.15 Cr
    riskProfile: 'Moderate',
    investmentHorizon: '5+ years',
    createdAt: pastDate(65),
  });

  // 5. Seed Benchmark Realistic Mandates Across Lifecycle States

  // Mandate A: Equity concentration reduction (Rohan Mehta, RIA 1) - State: SENT
  const mandateA = dbStore.createMandate({
    id: 'man_1',
    riaId: ria1.id,
    clientId: clientRohan.id,
    title: 'Equity Concentration Reduction & Fixed-Income Reallocation',
    status: 'sent',
    magicToken: 'tok_rohan_mandate_a',
    currentAllocation: { equity: 59.5, debt: 24.3, liquid: 16.2, gold: 0 },
    proposedAllocation: { equity: 46.0, debt: 29.7, liquid: 24.3, gold: 0 },
    sellBasket: [
      { securityName: 'Tata Motors Ltd', isin: 'INE155A01022', units: 300, saleValue: 360000, purchaseValue: 300000, gainType: 'STCG', realizedGain: 60000 },
      { securityName: 'HDFC Bank Ltd', isin: 'INE040A01034', units: 800, saleValue: 1320000, purchaseValue: 1200000, gainType: 'LTCG', realizedGain: 120000 },
    ],
    buyBasket: [
      { securityName: 'Kotak Equity Arbitrage Fund - Direct Growth', approxValue: 1000000 },
      { securityName: 'HDFC Short Duration Debt Fund - Direct Growth', approxValue: 680000 },
    ],
    stcgAmount: 60000,
    ltcgAmount: 120000,
    stcgTax: 12000, // 20% of 60,000 = 12,000
    ltcgTax: 0, // 120,000 is within 1,25,000 yearly exemption = 0
    cessAmount: 480, // 4% of 12,000 = 480
    taxPayable: 12480, // 12,000 + 480 = 12,480
    advanceTaxQuarter: 'Q4 - Due 15th March',
    advanceTaxAlert: 'Estimated net tax liability of ₹12,480 requires Advance Tax adjustment by 15th March.',
    advisorRationale: 'Client equity portfolio was over-indexed to large banking and auto (59.5% vs mandate target of 46%). Selling appreciated holdings and redeploying into arbitrage and short-duration debt preserves capital while harvesting capital gains with ₹1,20,000 LTCG within the statutory exemption limit.',
    cutoffTimestamp: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: pastDate(1, 2),
    updatedAt: pastDate(1, 1),
    chatMessages: [
      {
        id: 'msg_1',
        sender: 'client',
        senderName: 'Rohan Mehta',
        message: 'Why are we reducing the equity allocation?',
        timestamp: pastDate(1, 0.8),
      },
      {
        id: 'msg_2',
        sender: 'ria',
        senderName: 'Suresh Narayanan',
        message: 'The current equity exposure is above the target range. We are reducing concentration while maintaining the long-term growth allocation.',
        timestamp: pastDate(1, 0.6),
      },
      {
        id: 'msg_3',
        sender: 'client',
        senderName: 'Rohan Mehta',
        message: 'Will I have a tax liability?',
        timestamp: pastDate(1, 0.4),
      },
      {
        id: 'msg_4',
        sender: 'ria',
        senderName: 'Suresh Narayanan',
        message: 'The estimated capital gains impact is approximately ₹12,480. Please review the tax-impact section above for details.',
        timestamp: pastDate(1, 0.2),
      },
    ],
  });

  // Mandate B: Tax-loss harvesting (Ananya Kapoor, RIA 1) - State: VIEWED
  const mandateB = dbStore.createMandate({
    id: 'man_ananya_tax_harvest',
    riaId: ria1.id,
    clientId: clientAnanya.id,
    title: 'Tax-Loss Harvesting & Broad Market Reinvestment',
    status: 'viewed',
    magicToken: 'tok_ananya_mandate_b',
    currentAllocation: { equity: 70, debt: 20, gold: 10, cash: 0 },
    proposedAllocation: { equity: 70, debt: 20, gold: 10, cash: 0 },
    sellBasket: [
      { securityName: 'Mid-Cap Growth Fund Active Units', isin: 'INF200K01012', units: 15000, saleValue: 1550000, purchaseValue: 1800000, gainType: 'STCG' },
    ],
    buyBasket: [
      { securityName: 'Nifty 50 Index Fund - Direct Plan Growth', approxValue: 1550000 },
    ],
    stcgAmount: -250000,
    ltcgAmount: 0,
    stcgTax: 0,
    ltcgTax: 0,
    cessAmount: 0,
    taxPayable: 0,
    advanceTaxQuarter: 'Q3 - Due 15th December',
    advanceTaxAlert: 'Harvesting ₹2.50L STCL creates a tax shield saving ₹50,000 against FY25 realized short-term gains.',
    advisorRationale: 'Underperforming mid-cap active scheme units bought in FY24 currently reflect an unrealized capital loss of ₹2.50 Lakhs. Booking this loss offsets earlier short-term capital gains, saving ₹50,000 in immediate tax liability, while immediate re-entry into Nifty 50 Index Fund prevents market dislocation.',
    cutoffTimestamp: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    createdAt: pastDate(2),
    updatedAt: pastDate(1, 6),
  });

  // Mandate C: Comprehensive Portfolio Rebalancing (Vikram Shah, RIA 1) - State: CONSENTED / APPROVED
  const mandateC = dbStore.createMandate({
    id: 'man_vikram_rebalance_approved',
    riaId: ria1.id,
    clientId: clientVikram.id,
    title: 'Strategic Asset Allocation Rebalancing & Target Maturity Shift',
    status: 'consented',
    isApproved: true,
    magicToken: null,
    currentAllocation: { equity: 78.0, debt: 14.0, gold: 8.0, cash: 0 },
    proposedAllocation: { equity: 60.0, debt: 30.0, gold: 10.0, cash: 0 },
    sellBasket: [
      { securityName: 'Reliance Industries Ltd', isin: 'INE002A01018', units: 750, saleValue: 2212500, purchaseValue: 1500000, gainType: 'LTCG' },
      { securityName: 'ICICI Bank Ltd', isin: 'INE090A01021', units: 1465, saleValue: 1787500, purchaseValue: 1300000, gainType: 'LTCG' },
    ],
    buyBasket: [
      { securityName: 'Bharat Bond ETF - April 2030', approxValue: 2800000 },
      { securityName: 'Sovereign Gold Bond Tranche 2026', approxValue: 1200000 },
    ],
    stcgAmount: 0,
    ltcgAmount: 1200000,
    stcgTax: 0,
    ltcgTax: 134375, // (1200000 - 125000) * 12.5% = 134,375
    cessAmount: 5375,
    taxPayable: 139750,
    advanceTaxQuarter: 'Q4 - Due 15th March',
    advanceTaxAlert: 'High capital gains realization requires statutory advance tax installment payment.',
    advisorRationale: 'Vikram Shah equity allocation exceeded targeted risk profile tolerance (78% vs 60%). Rebalancing ₹40L into Bharat Bond ETF and Gold ETF aligns with target asset allocation yields and provides a portfolio inflation hedge.',
    cutoffTimestamp: pastDate(10),
    createdAt: pastDate(12),
    updatedAt: pastDate(11),
    approvedAt: pastDate(11, 2),
    consentedAt: pastDate(11, 2),
  });

  // Mandate D: DRAFT state (Rohan Mehta, RIA 1)
  const mandateD = dbStore.createMandate({
    id: 'man_rohan_draft',
    riaId: ria1.id,
    clientId: clientRohan.id,
    title: 'Routine Debt Allocation Adjustment (Draft)',
    status: 'draft',
    magicToken: null,
    currentAllocation: { equity: 50, debt: 40, gold: 10, cash: 0 },
    proposedAllocation: { equity: 50, debt: 45, gold: 5, cash: 0 },
    sellBasket: [{ securityName: 'Gold ETF (Secondary Market)', units: 100, saleValue: 720000, purchaseValue: 500000, gainType: 'LTCG' }],
    buyBasket: [{ securityName: 'Corporate Bond Fund - Direct Plan', approxValue: 720000 }],
    stcgAmount: 0,
    ltcgAmount: 220000,
    stcgTax: 0,
    ltcgTax: 11875,
    cessAmount: 475,
    taxPayable: 12350,
    advisorRationale: 'Internal draft to evaluate moving maturing gold tranche into corporate debt.',
    createdAt: pastDate(0, 3),
  });

  // Mandate E: IN_REVIEW / AWAITING CONSENT (Ananya Kapoor, RIA 1)
  const mandateE = dbStore.createMandate({
    id: 'man_ananya_in_review',
    riaId: ria1.id,
    clientId: clientAnanya.id,
    title: 'Mid-Cap Rotation to Large-Cap Value (Awaiting Consent)',
    status: 'in_review',
    magicToken: 'tok_ananya_in_review',
    currentAllocation: { equity: 65, debt: 25, gold: 10, cash: 0 },
    proposedAllocation: { equity: 65, debt: 25, gold: 10, cash: 0 },
    sellBasket: [{ securityName: 'Tata Motors Ltd', units: 500, saleValue: 475000, purchaseValue: 400000, gainType: 'STCG' }],
    buyBasket: [{ securityName: 'Infosys Ltd', approxValue: 475000 }],
    stcgAmount: 75000,
    ltcgAmount: 0,
    stcgTax: 15000,
    ltcgTax: 0,
    cessAmount: 600,
    taxPayable: 15600,
    advisorRationale: 'Rotating out of cyclical auto into resilient IT exporter.',
    cutoffTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: pastDate(1, 5),
  });

  // Mandate F: EXPIRED state (Vikram Shah, RIA 1)
  const mandateF = dbStore.createMandate({
    id: 'man_vikram_expired',
    riaId: ria1.id,
    clientId: clientVikram.id,
    title: 'Q3 Tax Harvesting Proposal (Cutoff Lapsed)',
    status: 'expired',
    magicToken: 'tok_vikram_expired',
    currentAllocation: { equity: 75, debt: 25, gold: 0, cash: 0 },
    proposedAllocation: { equity: 65, debt: 35, gold: 0, cash: 0 },
    sellBasket: [{ securityName: 'Wipro Ltd', units: 1000, saleValue: 450000, purchaseValue: 400000, gainType: 'STCG' }],
    buyBasket: [{ securityName: 'Liquid BeES ETF', approxValue: 450000 }],
    stcgAmount: 50000,
    ltcgAmount: 0,
    stcgTax: 10000,
    ltcgTax: 0,
    cessAmount: 400,
    taxPayable: 10400,
    advisorRationale: 'Proposal cutoff lapsed without client OTP response.',
    cutoffTimestamp: pastDate(5),
    createdAt: pastDate(8),
  });

  // Mandate G: REVOKED state (Rohan Mehta, RIA 1)
  const mandateG = dbStore.createMandate({
    id: 'man_rohan_revoked',
    riaId: ria1.id,
    clientId: clientRohan.id,
    title: 'Ad-hoc Small-Cap Exit (Revoked by RIA)',
    status: 'revoked',
    isRevoked: true,
    magicToken: 'tok_rohan_revoked',
    currentAllocation: { equity: 60, debt: 30, gold: 10, cash: 0 },
    proposedAllocation: { equity: 50, debt: 40, gold: 10, cash: 0 },
    sellBasket: [{ securityName: 'Small Cap Discovery Fund', units: 2000, saleValue: 500000, purchaseValue: 450000, gainType: 'STCG' }],
    buyBasket: [{ securityName: 'Short Duration Debt Fund', approxValue: 500000 }],
    advisorRationale: 'Revoked by RIA Suresh Narayanan following sudden corporate dividend announcement.',
    cutoffTimestamp: pastDate(2),
    createdAt: pastDate(4),
  });

  // Mandate H: RIA 2 Mandate (Nikhil Bansal under Meera Iyer / Artha Capital) - State: SENT
  const mandateH = dbStore.createMandate({
    id: 'man_nikhil_artha_sent',
    riaId: ria2.id,
    clientId: clientNikhil.id,
    title: 'Artha High-Alpha Equity Tactical Rebalance',
    status: 'sent',
    magicToken: 'tok_nikhil_mandate_h',
    currentAllocation: { equity: 85, debt: 15, gold: 0, cash: 0 },
    proposedAllocation: { equity: 75, debt: 25, gold: 0, cash: 0 },
    sellBasket: [{ securityName: 'Larsen & Toubro Ltd', units: 300, saleValue: 1086000, purchaseValue: 900000, gainType: 'LTCG' }],
    buyBasket: [{ securityName: 'Corporate Debt Yield Fund', approxValue: 1086000 }],
    stcgAmount: 0,
    ltcgAmount: 186000,
    stcgTax: 0,
    ltcgTax: 7625,
    cessAmount: 305,
    taxPayable: 7930,
    advisorRationale: 'Artha Capital rebalance reducing infrastructure overweight into high-grade corporate debt.',
    cutoffTimestamp: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: pastDate(1),
  });

  // Mandate I: RIA 2 Mandate (Kavita Shah under Meera Iyer) - State: CONSENTED
  const mandateI = dbStore.createMandate({
    id: 'man_kavita_artha_consented',
    riaId: ria2.id,
    clientId: clientKavita.id,
    title: 'Fixed Income Safety Mandate',
    status: 'consented',
    isApproved: true,
    magicToken: null,
    currentAllocation: { equity: 40, debt: 50, gold: 10, cash: 0 },
    proposedAllocation: { equity: 30, debt: 60, gold: 10, cash: 0 },
    sellBasket: [{ securityName: 'Axis Bank Ltd', units: 250, saleValue: 297500, purchaseValue: 250000, gainType: 'STCG' }],
    buyBasket: [{ securityName: 'Gilt 10-Yr Constant Maturity Fund', approxValue: 297500 }],
    stcgAmount: 47500,
    ltcgAmount: 0,
    stcgTax: 9500,
    ltcgTax: 0,
    cessAmount: 380,
    taxPayable: 9880,
    advisorRationale: 'Securing gains for conservative investor into sovereign gilt bonds.',
    createdAt: pastDate(20),
    consentedAt: pastDate(19),
    approvedAt: pastDate(19),
  });

  // Audit Logs for Benchmark Mandates
  dbStore.createAuditLog({
    riaId: ria1.id,
    clientId: clientRohan.id,
    mandateId: mandateA.id,
    eventType: 'MANDATE_CREATED',
    ipAddress: '198.51.100.14',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
    channel: 'SYSTEM_API',
    timestamp: mandateA.createdAt,
    metadata: { action: 'Mandate created by Suresh Narayanan (RIA 1)', taxPayable: mandateA.taxPayable },
  });

  dbStore.createAuditLog({
    riaId: ria1.id,
    clientId: clientRohan.id,
    mandateId: mandateA.id,
    eventType: 'MANDATE_DISPATCHED',
    ipAddress: '198.51.100.14',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
    channel: 'EMAIL_SECURE_LINK (WhatsApp Roadmap / SMS Deprecated)',
    timestamp: pastDate(1, 1),
    metadata: { magicToken: mandateA.magicToken, status: 'sent' },
  });

  // 6. Background Scaled Users, Clients, Mandates & Logs for Scale Consistency (~1000 users, ~200 clients, ~350 mandates)
  const firstNames = [
    'Aarav', 'Aditi', 'Alok', 'Amit', 'Ananya', 'Anil', 'Anirudh', 'Arjun', 'Bhavna', 'Chetan',
    'Deepak', 'Devika', 'Gaurav', 'Harish', 'Ishaan', 'Jitendra', 'Kavita', 'Kiran', 'Madhuri', 'Manoj',
    'Naveen', 'Nidhi', 'Nikhil', 'Pooja', 'Pradeep', 'Prakash', 'Priya', 'Rahul', 'Rajesh', 'Rakesh',
    'Ramesh', 'Rashmi', 'Ritu', 'Rohan', 'Rohit', 'Sandeep', 'Sangeeta', 'Sanjay', 'Santosh', 'Shalini',
    'Shashi', 'Shreya', 'Siddharth', 'Smita', 'Sneha', 'Sunil', 'Sunita', 'Tanvi', 'Tarun', 'Varun',
    'Vidya', 'Vikram', 'Vimal', 'Vinay', 'Vishal', 'Yash', 'Zoya', 'Aditya', 'Abhishek', 'Akshay'
  ];

  const lastNames = [
    'Agarwal', 'Banerjee', 'Bhat', 'Bhattacharya', 'Chauhan', 'Chopra', 'Das', 'Deshmukh', 'Deshpande', 'Dutta',
    'Gupta', 'Iyer', 'Jain', 'Jha', 'Joshi', 'Kapoor', 'Khanna', 'Kulkarni', 'Kumar', 'Mahajan',
    'Malhotra', 'Menon', 'Mishra', 'Mukherjee', 'Nair', 'Nambiar', 'Pandey', 'Patel', 'Patil', 'Pillai',
    'Prasad', 'Rao', 'Reddy', 'Saxena', 'Sen', 'Shah', 'Sharma', 'Shukla', 'Singh', 'Sinha',
    'Srivastava', 'Subramanian', 'Tandon', 'Tiwari', 'Tripathi', 'Varma', 'Verma', 'Yadav'
  ];

  const firmPrefixes = [
    'Samriddhi', 'Artha', 'Dhanvantari', 'Nivesh', 'Shikhar', 'Lakshmi', 'Parampara', 'Vridhi',
    'Kuber', 'Drishti', 'Aequitas', 'Zenith', 'Pratham', 'Sutra', 'Sanctum', 'Vanguard India',
    'Trustline', 'Equirus', 'Pinnacle', 'Fortuna', 'Ananta', 'Sage', 'Veda', 'Kautilya', 'Aura'
  ];

  const firmSuffixes = [
    'Wealth Advisory', 'Family Office', 'Capital Advisers', 'Fiduciary Partners', 'Private Wealth',
    'Investment Counsel', 'Wealth Management', 'Advisory Services', 'Portfolio Managers'
  ];

  const totalUsersToGenerate = 995;
  const backgroundRias = [ria1, ria2];

  for (let i = 1; i <= totalUsersToGenerate; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@wealthadvisor.in`;

    let role = 'ria';
    if (i > 780 && i <= 890) {
      role = 'compliance_officer';
    } else if (i > 890 && i <= 975) {
      role = 'client';
    } else if (i > 975) {
      role = 'admin';
    }

    const firm = `${firmPrefixes[i % firmPrefixes.length]} ${firmSuffixes[(i * 2) % firmSuffixes.length]}`;
    const regNum = `INA0000${String(10000 + i).padStart(5, '0')}`;
    const plan = i % 3 === 0 ? 'pro' : 'free';
    const createdAt = pastDate(Math.floor((i % 300) + 1));

    const user = dbStore.createUser({
      id: `usr_gen_${i}`,
      name: fullName,
      email,
      passwordHash: defaultPasswordHash,
      role,
      firmName: firm,
      sebiRegNumber: role === 'ria' || role === 'compliance_officer' ? regNum : undefined,
      complianceEmail: `compliance@${firmPrefixes[i % firmPrefixes.length].toLowerCase()}wealth.in`,
      plan,
      createdAt,
    });

    if (role === 'ria') {
      backgroundRias.push(user);
    }
  }

  // Generate 195 additional background clients (total 200)
  const panLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const allClients = [clientRohan, clientAnanya, clientVikram, clientNikhil, clientKavita];

  for (let c = 6; c <= 200; c++) {
    const fn = firstNames[(c * 7) % firstNames.length];
    const ln = lastNames[(c * 5) % lastNames.length];
    const clientName = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${c}@gmail.com`;

    const p1 = panLetters[c % panLetters.length];
    const p2 = panLetters[(c + 3) % panLetters.length];
    const p3 = panLetters[(c + 7) % panLetters.length];
    const p4 = 'P';
    const p5 = ln[0].toUpperCase();
    const panDigits = String(1000 + (c * 37) % 8999);
    const pChecksum = panLetters[(c * 2) % panLetters.length];
    const pan = `${p1}${p2}${p3}${p4}${p5}${panDigits}${pChecksum}`;

    const birthYear = 1965 + (c % 35);
    const birthMonth = String(1 + (c % 12)).padStart(2, '0');
    const birthDay = String(1 + (c % 28)).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const mobile = `98${String(10000000 + c * 31415).slice(0, 8)}`;
    const portfolioValue = Math.round((25 + (c % 80) * 1.5) * 100000);
    const assignedRia = backgroundRias[c % Math.min(backgroundRias.length, 30)];
    const createdAt = pastDate(Math.floor((c % 180) + 20));

    const client = dbStore.createClient({
      id: `cli_${c}`,
      riaId: assignedRia.id,
      name: clientName,
      pan,
      dob,
      mobile,
      email,
      portfolioValue,
      riskProfile: c % 3 === 0 ? 'High' : c % 2 === 0 ? 'Moderate' : 'Conservative',
      investmentHorizon: `${5 + (c % 10)} years`,
      createdAt,
    });

    allClients.push(client);

    dbStore.createAuditLog({
      riaId: assignedRia.id,
      clientId: client.id,
      eventType: 'CLIENT_ONBOARDED',
      ipAddress: `198.51.100.${(c % 200) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
      channel: 'RIA_WORKSPACE',
      timestamp: createdAt,
      metadata: { action: 'Client onboarded with KYC & Risk Profile' },
    });
  }

  // Generate background mandates to reach ~350 mandates & 1000+ audit logs
  const statuses = ['draft', 'sent', 'viewed', 'consented', 'expired', 'revoked'];
  const securitiesPool = [
    { name: 'HDFC Bank Ltd', price: 1650, type: 'STCG' },
    { name: 'Reliance Industries Ltd', price: 2950, type: 'LTCG' },
    { name: 'Tata Consultancy Services', price: 4120, type: 'LTCG' },
    { name: 'ICICI Bank Ltd', price: 1220, type: 'STCG' },
    { name: 'Infosys Ltd', price: 1840, type: 'LTCG' },
    { name: 'Bharti Airtel Ltd', price: 1580, type: 'STCG' },
    { name: 'State Bank of India', price: 810, type: 'STCG' },
    { name: 'Larsen & Toubro Ltd', price: 3620, type: 'LTCG' },
    { name: 'Kotak Mahindra Bank', price: 1780, type: 'STCG' },
    { name: 'Axis Bank Ltd', price: 1190, type: 'STCG' },
    { name: 'ITC Ltd', price: 475, type: 'LTCG' },
    { name: 'Hindustan Unilever Ltd', price: 2680, type: 'LTCG' }
  ];

  for (let m = 10; m <= 350; m++) {
    const client = allClients[m % allClients.length];
    const riaId = client.riaId;
    const status = statuses[m % statuses.length];

    let daysAgo = 1;
    if (status === 'consented') daysAgo = Math.floor(5 + (m % 320));
    else if (status === 'expired') daysAgo = Math.floor(3 + (m % 60));
    else if (status === 'draft') daysAgo = Math.floor(m % 5);
    else if (status === 'revoked') daysAgo = Math.floor(2 + (m % 20));

    const createdAt = pastDate(daysAgo, 4);
    const cutoffTimestamp = new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString();

    const sec1 = securitiesPool[m % securitiesPool.length];
    const sec2 = securitiesPool[(m + 3) % securitiesPool.length];

    const stcgGain = (m * 12500) % 300000;
    const ltcgGain = (m * 25000) % 600000;
    const stcgTax = Math.round(stcgGain * 0.20);
    const taxableLtcg = Math.max(0, ltcgGain - 125000);
    const ltcgTax = Math.round(taxableLtcg * 0.125);
    const subtotal = stcgTax + ltcgTax;
    const cess = Math.round(subtotal * 0.04);
    const taxPayable = subtotal + cess;

    const mandate = dbStore.createMandate({
      id: `man_${m}`,
      riaId,
      clientId: client.id,
      title: `Portfolio Rebalance #${m} — ${sec1.name} Realization`,
      currentAllocation: { equity: 75, debt: 15, gold: 5, cash: 5 },
      proposedAllocation: { equity: 60, debt: 25, gold: 10, cash: 5 },
      sellBasket: [
        { securityName: sec1.name, units: 100 + (m * 10) % 500, saleValue: sec1.price * 100, gainType: sec1.type },
        { securityName: sec2.name, units: 50 + (m * 5) % 300, saleValue: sec2.price * 50, gainType: sec2.type },
      ],
      buyBasket: [
        { securityName: 'ICICI Prudential All Seasons Bond', approxValue: 250000 },
        { securityName: 'Nippon India Gold BeES ETF', approxValue: 150000 },
      ],
      stcgAmount: stcgGain,
      ltcgAmount: ltcgGain,
      stcgTax,
      ltcgTax,
      cessAmount: cess,
      taxPayable,
      advanceTaxQuarter: '4th Installment - Due 15th March',
      advanceTaxAlert: taxPayable > 0 ? `Estimated capital gains tax of ₹${taxPayable.toLocaleString('en-IN')} requires Advance Tax provisioning.` : '',
      cutoffTimestamp,
      status,
      createdAt,
      updatedAt: pastDate(Math.max(0, daysAgo - 1)),
      approvedAt: status === 'consented' ? pastDate(Math.max(0, daysAgo - 1), 2) : undefined,
      consentedAt: status === 'consented' ? pastDate(Math.max(0, daysAgo - 1), 2) : undefined,
      isApproved: status === 'consented',
      isRevoked: status === 'revoked',
      magicToken: (status === 'consented' || status === 'revoked') ? null : `tok_${m}_${String(Math.random()).slice(2, 10)}`,
    });

    dbStore.createAuditLog({
      riaId,
      clientId: client.id,
      mandateId: mandate.id,
      eventType: 'MANDATE_CREATED',
      ipAddress: `198.51.100.${(m % 200) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
      channel: 'SYSTEM_API',
      timestamp: createdAt,
      metadata: { action: 'Mandate created by RIA', taxPayable },
    });

    if (status !== 'draft') {
      dbStore.createAuditLog({
        riaId,
        clientId: client.id,
        mandateId: mandate.id,
        eventType: 'MANDATE_DISPATCHED',
        ipAddress: `198.51.100.${(m % 200) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
        channel: 'EMAIL_SECURE_LINK (WhatsApp Roadmap / SMS Deprecated)',
        timestamp: pastDate(daysAgo, 3),
        metadata: { cutoffTimestamp, status },
      });
    }

    if (status === 'viewed' || status === 'consented') {
      dbStore.createAuditLog({
        riaId,
        clientId: client.id,
        mandateId: mandate.id,
        eventType: 'MANDATE_OPENED',
        ipAddress: `203.0.113.${(m % 200) + 1}`,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        channel: 'MOBILE_BROWSER',
        timestamp: pastDate(daysAgo, 2),
        metadata: { clientView: '360px Mobile Review Portal' },
      });
    }

    if (status === 'consented') {
      const otpVerId = `otp_ver_${100000 + m}`;
      dbStore.createAuditLog({
        riaId,
        clientId: client.id,
        mandateId: mandate.id,
        eventType: 'OTP_GENERATED',
        ipAddress: `203.0.113.${(m % 200) + 1}`,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        channel: 'IN_APP_EMAIL (SMS Disabled by Policy)',
        timestamp: pastDate(daysAgo, 1),
        metadata: { destination: `******${client.mobile.slice(-4)}`, channel: 'In-App Secure Display' },
      });

      dbStore.createAuditLog({
        riaId,
        clientId: client.id,
        mandateId: mandate.id,
        eventType: 'CONSENT_GRANTED',
        ipAddress: `203.0.113.${(m % 200) + 1}`,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
        verificationMethod: 'OTP_IN_APP_EMAIL',
        otpVerificationId: otpVerId,
        timestamp: pastDate(daysAgo, 0.5),
        metadata: {
          status: 'Consented & Locked',
          declarationsAcknowledged: [
            'Client Informed Consent (SEBI Regulation 19 Compliance Record)',
            `Acknowledged Capital Gains Tax of ₹${taxPayable.toLocaleString('en-IN')}`,
          ],
        },
      });
    }
  }

  // 50 Advisory Requests
  const requestCategories = [
    'Portfolio Rebalance Advisory',
    'Statutory Tax Impact Assessment',
    'SEBI Regulation 19 Compliance Review',
    'Asset Reallocation Proposal',
    'Demat Liquidation Mandate'
  ];

  for (let r = 1; r <= 50; r++) {
    const client = allClients[(r * 3) % allClients.length];
    const category = requestCategories[r % requestCategories.length];
    const status = r % 4 === 0 ? 'completed' : r % 3 === 0 ? 'in_progress' : 'pending';
    const createdAt = pastDate(Math.floor((r % 45) + 1));

    dbStore.createRequest({
      id: `req_${r}`,
      userId: client.riaId,
      clientId: client.id,
      clientName: client.name,
      category,
      title: `${category} for ${client.name}`,
      priority: r % 5 === 0 ? 'urgent' : r % 2 === 0 ? 'high' : 'standard',
      description: `Client requested formal advisory evaluation for FY26-27 statutory portfolio realignment. Realized consideration estimate: ₹${(client.portfolioValue * 0.25).toLocaleString('en-IN')}.`,
      proposedEquityRatio: 60,
      proposedDebtRatio: 30,
      proposedGoldRatio: 10,
      status,
      createdAt,
      responseNotes: status === 'completed' ? 'Advisory rebalance mandate formulated and approved under Regulation 19.' : undefined,
    });
  }

  const durationMs = Date.now() - startTime;
  console.log(`[Seed] In-memory store prepared in ${durationMs}ms:`);
  console.log(`  - Users: ${dbStore.users.size} (RIAs, Compliance Officers, Admins, Clients)`);
  console.log(`  - Clients: ${dbStore.clients.size}`);
  console.log(`  - Mandates: ${dbStore.mandates.size} across Draft, Sent, Viewed, In Review, Consented, Expired, Revoked`);
  console.log(`  - Audit Trail Records: ${dbStore.auditLogs.length} with SHA-256 hash chaining`);
  console.log(`  - Advisory Requests: ${dbStore.requests.size}`);

  // Synchronize documents into live MongoDB Atlas cluster (skipped in automated tests for speed)
  if (mongoose.connection.readyState === 1 && process.env.NODE_ENV !== 'test') {
    console.log('[Seed] Synchronizing documents into live MongoDB Atlas collections...');
    try {
      const usersList = Array.from(dbStore.users.values());
      const clientsList = Array.from(dbStore.clients.values());
      const mandatesList = Array.from(dbStore.mandates.values());
      const auditLogsList = dbStore.auditLogs;
      const requestsList = Array.from(dbStore.requests.values());

      if (allowReset) {
        console.log('[Seed] Explicit collection wipe authorized (ALLOW_SEED_RESET=true). Clearing existing records...');
        await Promise.all([
          UserModel.deleteMany({}),
          ClientModel.deleteMany({}),
          MandateModel.deleteMany({}),
          AuditLogModel.deleteMany({}),
          RequestModel.deleteMany({}),
        ]);

        await UserModel.insertMany(usersList, { ordered: false });
        await ClientModel.insertMany(clientsList, { ordered: false });
        await MandateModel.insertMany(mandatesList, { ordered: false });
        await AuditLogModel.insertMany(auditLogsList, { ordered: false });
        await RequestModel.insertMany(requestsList, { ordered: false });
      } else {
        console.log('[Seed] Safe non-destructive upsert mode active (repeatable without duplicates or wipes)...');
        // Bulk upsert by unique ID to guarantee idempotency and avoid duplicates
        const userOps = usersList.map((u) => ({ updateOne: { filter: { id: u.id }, update: { $set: u }, upsert: true } }));
        const clientOps = clientsList.map((c) => ({ updateOne: { filter: { id: c.id }, update: { $set: c }, upsert: true } }));
        const mandateOps = mandatesList.map((m) => ({ updateOne: { filter: { id: m.id }, update: { $set: m }, upsert: true } }));
        const auditOps = auditLogsList.map((a) => ({ updateOne: { filter: { id: a.id }, update: { $set: a }, upsert: true } }));
        const reqOps = requestsList.map((r) => ({ updateOne: { filter: { id: r.id }, update: { $set: r }, upsert: true } }));

        await Promise.all([
          UserModel.bulkWrite(userOps, { ordered: false }),
          ClientModel.bulkWrite(clientOps, { ordered: false }),
          MandateModel.bulkWrite(mandateOps, { ordered: false }),
          AuditLogModel.bulkWrite(auditOps, { ordered: false }),
          RequestModel.bulkWrite(reqOps, { ordered: false }),
        ]);
      }

      const [mUsers, mClients, mMandates, mAudit, mRequests] = await Promise.all([
        UserModel.countDocuments(),
        ClientModel.countDocuments(),
        MandateModel.countDocuments(),
        AuditLogModel.countDocuments(),
        RequestModel.countDocuments(),
      ]);

      console.log(`[Seed] Live MongoDB Atlas cluster synchronized & verified:`);
      console.log(`  - MongoDB 'users' collection: ${mUsers} documents`);
      console.log(`  - MongoDB 'clients' collection: ${mClients} documents`);
      console.log(`  - MongoDB 'mandates' collection: ${mMandates} documents`);
      console.log(`  - MongoDB 'auditlogs' collection: ${mAudit} documents`);
      console.log(`  - MongoDB 'requests' collection: ${mRequests} documents`);
    } catch (mongoErr) {
      console.error('[Seed] MongoDB Atlas insertion error:', mongoErr.message);
    }
  }

  dbStore.isSeeding = false;

  return {
    ria1,
    ria2,
    complianceOfficer,
    adminUser,
    clientUser,
    clientRohan,
    clientAnanya,
    clientVikram,
    clientNikhil,
    clientKavita,
    mandateA,
    mandateB,
    mandateC,
    mandateD,
    mandateE,
    mandateF,
    mandateG,
    mandateH,
    mandateI,
    totalUsers: dbStore.users.size,
    totalClients: dbStore.clients.size,
    totalMandates: dbStore.mandates.size,
  };
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const shouldReset = process.argv.includes('--reset') || process.argv.includes('--force-reset');
  runSeed({ reset: shouldReset })
    .then(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
