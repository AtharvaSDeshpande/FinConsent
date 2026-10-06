// Indian Capital Gains Tax Calculator for FY 2026-27 (Finance Act 2024 revisions)
export const STCG_RATE_2024 = 0.20; // 20% on short term capital gains under Section 111A
export const LTCG_RATE_2024 = 0.125; // 12.5% on long term capital gains under Section 112A
export const LTCG_EXEMPTION_LIMIT = 125000; // ₹1,25,000 annual statutory exemption
export const CESS_RATE = 0.04; // 4% Health and Education Cess

/**
 * Format numbers according to Indian numbering system (Lakhs/Crores) with INR (₹) symbol
 * e.g., 100000 -> "₹1,00,000", 1250000 -> "₹12,50,000", 10000000 -> "₹1,00,00,000"
 */
export function formatINR(val) {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Format large Indian currency with words (e.g. ₹1.25 Lakh, ₹2.50 Cr)
 */
export function formatINRLakhCrore(val) {
  const num = Number(val) || 0;
  const abs = Math.abs(num);
  if (abs >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(num);
}

/**
 * Quarterly Advance Tax Installments Schedule for FY 2026-27
 */
export function getAdvanceTaxSchedule(totalTax) {
  const tax = Math.max(0, Number(totalTax) || 0);
  return [
    {
      quarter: 'Q1',
      dueDate: '15 June',
      cumulativePercentage: 15,
      cumulativeAmount: Math.round(tax * 0.15),
      installmentAmount: Math.round(tax * 0.15),
    },
    {
      quarter: 'Q2',
      dueDate: '15 September',
      cumulativePercentage: 45,
      cumulativeAmount: Math.round(tax * 0.45),
      installmentAmount: Math.round(tax * 0.30),
    },
    {
      quarter: 'Q3',
      dueDate: '15 December',
      cumulativePercentage: 75,
      cumulativeAmount: Math.round(tax * 0.75),
      installmentAmount: Math.round(tax * 0.30),
    },
    {
      quarter: 'Q4',
      dueDate: '15 March',
      cumulativePercentage: 100,
      cumulativeAmount: tax,
      installmentAmount: Math.round(tax * 0.25),
    },
  ];
}

/**
 * Calculate Capital Gains Tax from trade items
 */
export function calculateTaxImpact(trades = []) {
  let stcgGain = 0;
  let ltcgGain = 0;
  let totalConsideration = 0;

  for (const trade of trades) {
    if (trade.action === 'SELL') {
      const consideration = (Number(trade.quantity) || 0) * (Number(trade.sellPrice) || 0);
      const cost = (Number(trade.quantity) || 0) * (Number(trade.buyPrice) || 0);
      const gain = consideration - cost;
      totalConsideration += consideration;

      if (trade.holdingType === 'STCG') {
        stcgGain += gain;
      } else if (trade.holdingType === 'LTCG') {
        ltcgGain += gain;
      }
    }
  }

  const netCapitalGain = Math.max(0, stcgGain + ltcgGain);
  const stcgTax = Math.round(Math.max(0, stcgGain) * STCG_RATE_2024);
  const stcgCess = Math.round(stcgTax * CESS_RATE);

  const ltcgExemptionApplied = Math.min(Math.max(0, ltcgGain), LTCG_EXEMPTION_LIMIT);
  const taxableLtcg = Math.max(0, ltcgGain - LTCG_EXEMPTION_LIMIT);
  const ltcgTax = Math.round(taxableLtcg * LTCG_RATE_2024);
  const ltcgCess = Math.round(ltcgTax * CESS_RATE);

  const totalBaseTax = stcgTax + ltcgTax;
  const totalCess = stcgCess + ltcgCess;
  const totalTaxLiability = totalBaseTax + totalCess;

  return {
    stcgGain,
    ltcgGain,
    netCapitalGain,
    totalConsideration,
    stcgTax,
    stcgCess,
    ltcgExemptionApplied,
    taxableLtcg,
    ltcgTax,
    ltcgCess,
    totalBaseTax,
    totalCess,
    totalTaxLiability,
    advanceTaxAlertTriggered: netCapitalGain > 100000,
  };
}

/**
 * Standard summary calculator for amount inputs
 */
export function calculateIndianGainsTax({ stcgAmount = 0, ltcgAmount = 0 }) {
  const stcg = Math.max(0, Number(stcgAmount) || 0);
  const ltcg = Math.max(0, Number(ltcgAmount) || 0);

  // Equity STCG (Section 111A) @ 20%
  const stcgTax = Math.round(stcg * STCG_RATE_2024);

  // Equity LTCG (Section 112A) @ 12.5% post-₹1,25,000 exemption
  const taxableLtcg = Math.max(0, ltcg - LTCG_EXEMPTION_LIMIT);
  const ltcgTax = Math.round(taxableLtcg * LTCG_RATE_2024);

  // Health and Education Cess @ 4%
  const subtotal = stcgTax + ltcgTax;
  const cess = Math.round(subtotal * CESS_RATE);
  const totalTax = subtotal + cess;

  // Next Advance Tax Quarterly Installment
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  let nextInstallment = '4th Installment (100%) - Due 15th March';
  if (month < 6 || (month === 6 && day <= 15)) {
    nextInstallment = '1st Installment (15%) - Due 15th June';
  } else if (month < 9 || (month === 9 && day <= 15)) {
    nextInstallment = '2nd Installment (45%) - Due 15th September';
  } else if (month < 12 || (month === 12 && day <= 15)) {
    nextInstallment = '3rd Installment (75%) - Due 15th December';
  }

  return {
    stcg,
    ltcg,
    stcgTax,
    taxableLtcg,
    ltcgExemption: LTCG_EXEMPTION_LIMIT,
    ltcgTax,
    cess,
    totalTax,
    nextInstallment,
    advanceTaxSchedule: getAdvanceTaxSchedule(totalTax),
  };
}
