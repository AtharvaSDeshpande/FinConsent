import bcrypt from 'bcryptjs';
import { dbStore } from './store.js';

export async function runSeed() {
  const passwordHash = await bcrypt.hash('Password@123', 10);

  // RIA 1: Prudent Wealth Advisory
  const ria1 = dbStore.createUser({
    id: 'usr_prudent_ria',
    name: 'Suresh Narayanan',
    email: 'ria@prudentwealth.in',
    passwordHash,
    firmName: 'Prudent Wealth Advisory',
    sebiRegNumber: 'INA000088921',
    complianceEmail: 'compliance@prudentwealth.in',
    plan: 'free',
  });

  // RIA 2: Apex Multi-Family Office
  const ria2 = dbStore.createUser({
    id: 'usr_apex_ria',
    name: 'Meera Iyer',
    email: 'compliance@apexfo.com',
    passwordHash,
    firmName: 'Apex Multi-Family Office',
    sebiRegNumber: 'INA000099412',
    complianceEmail: 'audit@apexfo.com',
    plan: 'pro',
  });

  // Client 1: Rohan Mehta
  const client1 = dbStore.createClient({
    id: 'cli_rohan_mehta',
    riaId: ria1.id,
    name: 'Rohan Mehta',
    pan: 'ABCPM1234K',
    mobile: '9820112345',
    email: 'rohan.mehta@example.com',
    portfolioValue: 2500000,
  });

  // Client 2: Anita Desai
  const client2 = dbStore.createClient({
    id: 'cli_anita_desai',
    riaId: ria1.id,
    name: 'Anita Desai',
    pan: 'AABCD5678L',
    mobile: '9820256789',
    email: 'anita.desai@example.com',
    portfolioValue: 4000000,
  });

  // Client 3: Kabir Joshi
  const client3 = dbStore.createClient({
    id: 'cli_kabir_joshi',
    riaId: ria1.id,
    name: 'Kabir Joshi',
    pan: 'BKLPJ9921M',
    mobile: '9820399881',
    email: 'kabir.joshi@example.com',
    portfolioValue: 1500000,
  });

  // Client 4 for RIA 2: Rajesh Khanna
  const client4 = dbStore.createClient({
    id: 'cli_rajesh_khanna',
    riaId: ria2.id,
    name: 'Rajesh Khanna',
    pan: 'CKLPK7766N',
    mobile: '9820477665',
    email: 'rajesh.khanna@example.com',
    portfolioValue: 8000000,
  });

  // Mandate 1: Active Review (Rohan Mehta)
  // STCG: ₹60,000 @ 20% = ₹12,000
  // LTCG: ₹1,20,000 (Exempt under ₹1.25L) = ₹0
  // Cess: 4% on ₹12,000 = ₹480 -> Total: ₹12,480
  const mandate1 = dbStore.createMandate({
    id: 'man_rohan_active',
    riaId: ria1.id,
    clientId: client1.id,
    title: 'Q4 FY26 Large-Cap Profit Booking & Arbitrage Shift',
    currentAllocation: { equity: 75, debt: 15, gold: 5, cash: 5 },
    proposedAllocation: { equity: 60, debt: 25, gold: 5, cash: 10 },
    sellBasket: [
      { securityName: 'HDFC Bank Ltd', units: 300, saleValue: 510000, gainType: 'STCG', realizedGain: 60000 },
      { securityName: 'ICICI Prudential Bluechip', units: 1200, saleValue: 990000, gainType: 'LTCG', realizedGain: 120000 },
    ],
    buyBasket: [
      { securityName: 'Kotak Equity Arbitrage Fund', approxValue: 1000000 },
      { securityName: 'ICICI All Seasons Bond Fund', approxValue: 500000 },
    ],
    stcgAmount: 60000,
    ltcgAmount: 120000,
    stcgTax: 12000,
    ltcgTax: 0,
    cessAmount: 480,
    taxPayable: 12480,
    advanceTaxQuarter: '4th Installment - Due 15th March',
    advanceTaxAlert: 'Ensure estimated capital gains tax of ₹12,480 is accounted for prior to 15th March deadline under Sec 234C.',
    cutoffTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_review',
    magicToken: 'demo-token-rohan-mehta-2026',
  });

  dbStore.createAuditLog({
    mandateId: mandate1.id,
    eventType: 'CREATED',
    ipAddress: '103.21.124.8',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0',
    metadata: { action: 'Mandate drafted by RIA Suresh Narayanan' },
  });

  dbStore.createAuditLog({
    mandateId: mandate1.id,
    eventType: 'DISPATCHED',
    ipAddress: '103.21.124.8',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0',
    metadata: { token: mandate1.magicToken, channel: 'WhatsApp & Email' },
  });

  // Mandate 2: Approved State (Anita Desai)
  // STCG ₹2,50,000 @ 20% = ₹50,000
  // LTCG ₹5,50,000 (Taxable: ₹4,25,000 @ 12.5% = ₹53,125)
  // Cess: 4% on ₹1,03,125 = ₹4,125 -> Total: ₹1,07,250
  const mandate2 = dbStore.createMandate({
    id: 'man_anita_approved',
    riaId: ria1.id,
    clientId: client2.id,
    title: 'Mid-Cap Growth Trim & Sovereign Gold Reallocation',
    currentAllocation: { equity: 80, debt: 10, gold: 5, cash: 5 },
    proposedAllocation: { equity: 55, debt: 25, gold: 15, cash: 5 },
    sellBasket: [
      { securityName: 'Nippon India Growth Fund', units: 800, saleValue: 1200000, gainType: 'STCG', realizedGain: 250000 },
      { securityName: 'Mirae Asset Large Cap', units: 1500, saleValue: 1800000, gainType: 'LTCG', realizedGain: 550000 },
    ],
    buyBasket: [
      { securityName: 'Sovereign Gold Bonds (Tranche IV)', approxValue: 1000000 },
      { securityName: 'HDFC Corporate Bond Fund', approxValue: 1000000 },
    ],
    stcgAmount: 250000,
    ltcgAmount: 550000,
    stcgTax: 50000,
    ltcgTax: 53125,
    cessAmount: 4125,
    taxPayable: 107250,
    advanceTaxQuarter: '4th Installment - Due 15th March',
    advanceTaxAlert: 'Ensure estimated capital gains tax of ₹1,07,250 is accounted for prior to 15th March installment.',
    cutoffTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    magicToken: 'demo-token-anita-desai-approved',
  });

  dbStore.createAuditLog({
    mandateId: mandate2.id,
    eventType: 'CREATED',
    ipAddress: '103.21.124.8',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0',
    metadata: { action: 'Mandate drafted' },
  });

  dbStore.createAuditLog({
    mandateId: mandate2.id,
    eventType: 'DISPATCHED',
    ipAddress: '103.21.124.8',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0',
    metadata: { channel: 'SMS Magic Link' },
  });

  dbStore.createAuditLog({
    mandateId: mandate2.id,
    eventType: 'OPENED',
    ipAddress: '49.37.192.44',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15',
    metadata: { clientDevice: 'iOS Safari Mobile' },
  });

  dbStore.createAuditLog({
    mandateId: mandate2.id,
    eventType: 'OTP_SENT',
    ipAddress: '49.37.192.44',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X)',
    metadata: { mobile: '******6789' },
  });

  dbStore.createAuditLog({
    mandateId: mandate2.id,
    eventType: 'APPROVED',
    ipAddress: '49.37.192.44',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X)',
    otpVerificationId: 'otp_verify_882910',
    metadata: {
      status: 'Approved & Locked',
      declarationsAcknowledged: [
        'SEBI Regulation 19 Informed Consent',
        'Acknowledged Capital Gains Tax of ₹1,07,250',
      ],
    },
  });

  // Mandate 3: Draft State (Kabir Joshi)
  dbStore.createMandate({
    id: 'man_kabir_draft',
    riaId: ria1.id,
    clientId: client3.id,
    title: 'Preliminary Rebalance Assessment FY27',
    currentAllocation: { equity: 90, debt: 5, gold: 0, cash: 5 },
    proposedAllocation: { equity: 70, debt: 20, gold: 5, cash: 5 },
    sellBasket: [],
    buyBasket: [],
    stcgAmount: 0,
    ltcgAmount: 0,
    stcgTax: 0,
    ltcgTax: 0,
    cessAmount: 0,
    taxPayable: 0,
    advanceTaxQuarter: '1st Installment - Due 15th June',
    cutoffTimestamp: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    magicToken: 'demo-token-kabir-draft',
  });

  // Mandate 4: Expired State (Rajesh Khanna for RIA 2)
  dbStore.createMandate({
    id: 'man_rajesh_expired',
    riaId: ria2.id,
    clientId: client4.id,
    title: 'Market Cutoff Demonstration - Expired Link',
    currentAllocation: { equity: 85, debt: 10, gold: 5, cash: 0 },
    proposedAllocation: { equity: 65, debt: 25, gold: 10, cash: 0 },
    sellBasket: [
      { securityName: 'Tata Consultancy Services', units: 100, saleValue: 400000, gainType: 'STCG', realizedGain: 50000 },
    ],
    buyBasket: [],
    stcgAmount: 50000,
    ltcgAmount: 0,
    stcgTax: 10000,
    ltcgTax: 0,
    cessAmount: 400,
    taxPayable: 10400,
    advanceTaxQuarter: '3rd Installment - Due 15th Dec',
    cutoffTimestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'expired',
    magicToken: 'demo-token-expired-demonstration',
  });

  return { ria1, ria2 };
}
