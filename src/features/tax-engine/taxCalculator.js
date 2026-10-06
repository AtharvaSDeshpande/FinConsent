// Indian Capital Gains Tax Calculator for FY 2026-27 (Finance Act 2024 revisions)
export function calculateIndianGainsTax({ stcgAmount = 0, ltcgAmount = 0 }) {
  const stcg = Math.max(0, Number(stcgAmount) || 0);
  const ltcg = Math.max(0, Number(ltcgAmount) || 0);

  // Equity STCG (Section 111A) @ 20%
  const stcgTax = Math.round(stcg * 0.20);

  // Equity LTCG (Section 112A) @ 12.5% post-₹1,25,000 exemption
  const ltcgExemption = 125000;
  const taxableLtcg = Math.max(0, ltcg - ltcgExemption);
  const ltcgTax = Math.round(taxableLtcg * 0.125);

  // Health and Education Cess @ 4%
  const subtotal = stcgTax + ltcgTax;
  const cess = Math.round(subtotal * 0.04);
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
    ltcgExemption,
    ltcgTax,
    cess,
    totalTax,
    nextInstallment,
  };
}
