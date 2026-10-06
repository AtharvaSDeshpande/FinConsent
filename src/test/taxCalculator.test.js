import { describe, it, expect } from 'vitest';
import {
  calculateTaxImpact,
  formatINR,
  getAdvanceTaxSchedule,
  LTCG_EXEMPTION_LIMIT,
  LTCG_RATE_2024,
  STCG_RATE_2024,
  CESS_RATE,
} from '../features/tax-engine/taxCalculator.js';

describe('Indian Tax Engine (Union Budget 2024-25)', () => {
  it('correctly uses the revised Budget 2024 tax rates and exemption limits', () => {
    expect(STCG_RATE_2024).toBe(0.20);
    expect(LTCG_RATE_2024).toBe(0.125);
    expect(LTCG_EXEMPTION_LIMIT).toBe(125000);
    expect(CESS_RATE).toBe(0.04);
  });

  it('computes STCG at 20% + 4% cess with zero gain under exemption not applicable to STCG', () => {
    const trades = [
      {
        id: 't1',
        symbol: 'INFY',
        action: 'SELL',
        holdingType: 'STCG',
        quantity: 100,
        buyPrice: 1500,
        sellPrice: 1800, // profit = 100 * 300 = 30,000
      },
    ];

    const result = calculateTaxImpact(trades);
    expect(result.stcgGain).toBe(30000);
    expect(result.ltcgGain).toBe(0);
    expect(result.netCapitalGain).toBe(30000);
    // Base STCG tax = 30000 * 0.20 = 6000
    // Cess (4%) = 240
    // Total STCG tax = 6240
    expect(result.stcgTax).toBe(6000);
    expect(result.stcgCess).toBe(240);
    expect(result.totalTaxLiability).toBe(6240);
  });

  it('computes LTCG with ₹1.25 Lakh exemption limit under Budget 2024', () => {
    // Trade with LTCG profit of ₹2,25,000
    // Exemption: ₹1,25,000
    // Taxable LTCG: ₹1,00,000
    // Base LTCG tax: ₹1,00,000 * 12.5% = ₹12,500
    // Cess (4%): ₹500
    // Total LTCG tax: ₹13,000
    const trades = [
      {
        id: 't2',
        symbol: 'TCS',
        action: 'SELL',
        holdingType: 'LTCG',
        quantity: 100,
        buyPrice: 3000,
        sellPrice: 5250, // gain = 100 * 2250 = 2,25,000
      },
    ];

    const result = calculateTaxImpact(trades);
    expect(result.ltcgGain).toBe(225000);
    expect(result.ltcgExemptionApplied).toBe(125000);
    expect(result.taxableLtcg).toBe(100000);
    expect(result.ltcgTax).toBe(12500);
    expect(result.ltcgCess).toBe(500);
    expect(result.totalTaxLiability).toBe(13000);
  });

  it('applies full LTCG exemption when gain is below or equal to ₹1.25 Lakh', () => {
    const trades = [
      {
        id: 't3',
        symbol: 'HDFCBANK',
        action: 'SELL',
        holdingType: 'LTCG',
        quantity: 100,
        buyPrice: 1500,
        sellPrice: 2500, // gain = 1,00,000 (< 1,25,000)
      },
    ];

    const result = calculateTaxImpact(trades);
    expect(result.ltcgGain).toBe(100000);
    expect(result.ltcgExemptionApplied).toBe(100000);
    expect(result.taxableLtcg).toBe(0);
    expect(result.ltcgTax).toBe(0);
    expect(result.totalTaxLiability).toBe(0);
  });

  it('triggers advance tax alert flag when net capital gain exceeds ₹1,00,000', () => {
    const trades = [
      {
        id: 't4',
        symbol: 'RELIANCE',
        action: 'SELL',
        holdingType: 'STCG',
        quantity: 100,
        buyPrice: 2000,
        sellPrice: 3200, // gain = 1,20,000 > 1,00,000
      },
    ];

    const result = calculateTaxImpact(trades);
    expect(result.netCapitalGain).toBe(120000);
    expect(result.advanceTaxAlertTriggered).toBe(true);
  });

  it('does NOT trigger advance tax alert when net capital gain is under ₹1,00,000', () => {
    const trades = [
      {
        id: 't5',
        symbol: 'WIPRO',
        action: 'SELL',
        holdingType: 'STCG',
        quantity: 50,
        buyPrice: 400,
        sellPrice: 500, // gain = 5,000
      },
    ];

    const result = calculateTaxImpact(trades);
    expect(result.netCapitalGain).toBe(5000);
    expect(result.advanceTaxAlertTriggered).toBe(false);
  });

  it('computes the 4 quarterly advance tax installments accurately', () => {
    const totalTax = 40000;
    const schedule = getAdvanceTaxSchedule(totalTax);

    expect(schedule.length).toBe(4);
    // Q1: 15% due Jun 15
    expect(schedule[0].dueDate).toContain('15 June');
    expect(schedule[0].cumulativePercentage).toBe(15);
    expect(schedule[0].cumulativeAmount).toBe(6000);

    // Q2: 45% due Sep 15
    expect(schedule[1].dueDate).toContain('15 September');
    expect(schedule[1].cumulativePercentage).toBe(45);
    expect(schedule[1].cumulativeAmount).toBe(18000);

    // Q3: 75% due Dec 15
    expect(schedule[2].dueDate).toContain('15 December');
    expect(schedule[2].cumulativePercentage).toBe(75);
    expect(schedule[2].cumulativeAmount).toBe(30000);

    // Q4: 100% due Mar 15
    expect(schedule[3].dueDate).toContain('15 March');
    expect(schedule[3].cumulativePercentage).toBe(100);
    expect(schedule[3].cumulativeAmount).toBe(40000);
  });

  it('formats currency correctly in Indian numbering system with ₹ symbol', () => {
    expect(formatINR(100000)).toBe('₹1,00,000');
    expect(formatINR(1250000)).toBe('₹12,50,000');
    expect(formatINR(10000000)).toBe('₹1,00,00,000');
    expect(formatINR(0)).toBe('₹0');
  });
});
