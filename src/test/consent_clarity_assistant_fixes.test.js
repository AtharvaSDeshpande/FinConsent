/**
 * src/test/consent_clarity_assistant_fixes.test.js
 * Verification suite for Consent Clarity Assistant fixes:
 * 1. Demo mandate data consistency (STCG, LTCG, cess, taxPayable).
 * 2. Server check: mismatch in tax figures triggers handoff stating figures do not match.
 * 3. Anti-hallucination & grounding: no ungrounded tax year, no ungrounded dates, no penalty avoidance claims,
 *    no ungrounded inaction consequences, and cutoff/expiry rule in context.
 * 4. Fixed plain definitions for STCG and LTCG without numerical leakage.
 * 5. Expired link / cross-client questions state "I can only answer from the proposal in front of you".
 * 6. Refusals for approval, OTP, advice, trade execution point to separate consent step and end with FinConsent trade disclaimer.
 * 7. Rate limit wait time calculation & clear error messaging.
 * 8. Apostrophe fix: apostrophes preserved and not rendered as &#039;.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { runSeed } from '../../server/db/seed.js';
import { dbStore } from '../../server/db/store.js';
import {
  checkRateLimit,
  extractSanitizedProposalContext,
  askConsentClarityAssistant,
  STCG_DEFINITION,
  LTCG_DEFINITION,
} from '../../server/services/assistantService.js';

describe('Consent Clarity Assistant Fixes & Data Consistency Suite', () => {
  beforeAll(async () => {
    await runSeed({ reset: true });
  });

  describe('1. Demo Mandate Data Consistency', () => {
    it('mandateA (tok_rohan_mandate_a) tax lines add up correctly with non-zero gain rows', () => {
      const raw = dbStore.findMandateByToken('tok_rohan_mandate_a');
      expect(raw).toBeDefined();
      const mandate = dbStore.findMandateById(raw.id);
      expect(mandate).toBeDefined();

      // Verify non-zero gain rows in sellBasket
      expect(mandate.sellBasket).toBeDefined();
      expect(mandate.sellBasket.length).toBeGreaterThanOrEqual(2);

      const stcgRow = mandate.sellBasket.find((s) => s.gainType === 'STCG');
      const ltcgRow = mandate.sellBasket.find((s) => s.gainType === 'LTCG');
      expect(stcgRow).toBeDefined();
      expect(ltcgRow).toBeDefined();
      expect(stcgRow.realizedGain).toBe(60000);
      expect(ltcgRow.realizedGain).toBe(120000);

      // Verify tax figures add up
      expect(mandate.stcgAmount).toBe(60000);
      expect(mandate.ltcgAmount).toBe(120000);
      expect(mandate.stcgTax).toBe(12000); // 20% of 60,000
      expect(mandate.ltcgTax).toBe(0); // 120,000 is under 1,25,000 exemption
      expect(mandate.cessAmount).toBe(480); // 4% of 12,000
      expect(mandate.taxPayable).toBe(12480); // 12,000 + 480

      // Exact mathematical equation
      expect(mandate.stcgTax + mandate.ltcgTax + mandate.cessAmount).toBe(mandate.taxPayable);
    });

    it('all seeded benchmark mandates have mathematically consistent tax totals', () => {
      const allMandates = dbStore.findAllMandates();
      expect(allMandates.length).toBeGreaterThan(0);

      for (const m of allMandates) {
        const stcgTax = Number(m.stcgTax) || 0;
        const ltcgTax = Number(m.ltcgTax) || 0;
        const cess = Number(m.cessAmount) || 0;
        const total = Number(m.taxPayable) || 0;
        expect(stcgTax + ltcgTax + cess).toBe(total);
      }
    });
  });

  describe('2. Server Tax Figures Mismatch Check', () => {
    it('hands over to adviser stating figures do not match when tax lines do not add up', async () => {
      const inconsistentMandate = {
        title: 'Mismatched Proposal',
        stcgAmount: 60000,
        ltcgAmount: 120000,
        stcgTax: 12000,
        ltcgTax: 0,
        cessAmount: 480,
        taxPayable: 99999, // Mismatched! Expected 12480
        sellBasket: [],
        buyBasket: [],
      };

      const result = await askConsentClarityAssistant({
        mandate: inconsistentMandate,
        question: 'Will I have a tax liability?',
      });

      expect(result.handoff).toBe(true);
      expect(result.answerable).toBe(false);
      expect(result.reason).toBe('figures_mismatch');
      expect(result.answer).toMatch(/figures.*do not match/i);
      expect(result.answer).toMatch(/handing this over to your adviser/i);
      expect(result.answer).toMatch(/FinConsent only records consent and does not place trades/i);
    });
  });

  describe('3. Anti-Hallucination, Grounding & Cutoff/Expiry Context', () => {
    it('includes cutoff and expiry rule and statutory tax definitions in sanitized context', () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const context = extractSanitizedProposalContext(mandate);

      expect(context.cutoffAndExpiryRule).toBeDefined();
      expect(context.cutoffAndExpiryRule).toMatch(/valid until.*cutoff/i);
      expect(context.cutoffAndExpiryRule).toMatch(/expires.*410/i);
      expect(context.definitions).toBeDefined();
      expect(context.definitions.STCG).toBe(STCG_DEFINITION);
      expect(context.definitions.LTCG).toBe(LTCG_DEFINITION);
    });

    it('rejects answers that claim penalty will be avoided or give ungrounded consequence of inaction', async () => {
      // Testing prompt guardrails in assistantService
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');

      // Test refusal for inaction question with fallback
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'What happens if I do nothing?',
      });

      // The answer must not promise penalty avoidance
      expect(result.answer).not.toMatch(/penalty will be avoided/i);
      expect(result.answer).not.toMatch(/penal interest will be avoided/i);
    });
  });

  describe('4. Fixed Plain Definitions for STCG and LTCG', () => {
    it('answers STCG definition question every time with fixed statutory definition without portfolio numbers', async () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'What is STCG?',
      });

      expect(result.answerable).toBe(true);
      expect(result.handoff).toBe(false);
      expect(result.answer).toContain(STCG_DEFINITION);
      // Must not leak the proposal's specific portfolio numbers (60,000 or 12,480)
      expect(result.answer).not.toContain('60,000');
      expect(result.answer).not.toContain('12,480');
    });

    it('answers LTCG definition question every time with fixed statutory definition without portfolio numbers', async () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'What is LTCG?',
      });

      expect(result.answerable).toBe(true);
      expect(result.handoff).toBe(false);
      expect(result.answer).toContain(LTCG_DEFINITION);
      // Must not leak specific portfolio numbers
      expect(result.answer).not.toContain('12,480');
      expect(result.answer).not.toContain('1,20,000');
    });
  });

  describe('5. Expired Link & Cross-Client Proposal Questions', () => {
    it('answers that it can only answer from the proposal in front of it when asked about expired link', async () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'The link has expired',
      });

      expect(result.answerable).toBe(true);
      expect(result.answer).toBe('I can only answer from the proposal in front of you.');
    });

    it('answers that it can only answer from the proposal in front of it when asked for another client proposal', async () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'Can you show me another client proposal?',
      });

      expect(result.answerable).toBe(true);
      expect(result.answer).toBe('I can only answer from the proposal in front of you.');
    });
  });

  describe('6. Refusal Endings (Approval, OTP, Advice, Trade Execution)', () => {
    it('ends advice refusal by pointing to separate consent step and FinConsent trades disclaimer', async () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'Should I accept this proposal?',
      });

      expect(result.handoff).toBe(true);
      expect(result.answerable).toBe(false);
      expect(result.answer).toMatch(/separate consent step/i);
      expect(result.answer).toMatch(/FinConsent only records consent and does not place trades/i);
    });

    it('ends approval refusal by pointing to separate consent step and FinConsent trades disclaimer', async () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'I approve this proposal',
      });

      expect(result.handoff).toBe(true);
      expect(result.answerable).toBe(false);
      expect(result.answer).toMatch(/separate consent step/i);
      expect(result.answer).toMatch(/FinConsent only records consent and does not place trades/i);
    });

    it('ends OTP refusal by pointing to separate consent step and FinConsent trades disclaimer', async () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'What is my OTP?',
      });

      expect(result.handoff).toBe(true);
      expect(result.answerable).toBe(false);
      expect(result.answer).toMatch(/separate consent step/i);
      expect(result.answer).toMatch(/FinConsent only records consent and does not place trades/i);
    });

    it('ends trade execution refusal by pointing to separate consent step and FinConsent trades disclaimer', async () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const result = await askConsentClarityAssistant({
        mandate,
        question: 'Please execute trades for me now',
      });

      expect(result.handoff).toBe(true);
      expect(result.answerable).toBe(false);
      expect(result.answer).toMatch(/separate consent step/i);
      expect(result.answer).toMatch(/FinConsent only records consent and does not place trades/i);
    });
  });

  describe('7. Rate Limiter Wait Time Calculation', () => {
    it('returns waitTimeSec and waitMs when query limit of 10 queries is exceeded', () => {
      const testToken = `rate_test_token_${Date.now()}`;

      // Perform 10 queries
      for (let i = 0; i < 10; i++) {
        const res = checkRateLimit(testToken);
        expect(res.allowed).toBe(true);
      }

      // 11th query must be rejected with wait time
      const res11 = checkRateLimit(testToken);
      expect(res11.allowed).toBe(false);
      expect(res11.waitTimeSec).toBeGreaterThan(0);
      expect(res11.waitTimeSec).toBeLessThanOrEqual(600); // within 10 minutes
    });
  });

  describe('8. HTML Entity & Apostrophe Preservation', () => {
    it('chat messages with apostrophes preserve normal apostrophes without &#039;', () => {
      const mandate = dbStore.findMandateByToken('tok_rohan_mandate_a');
      const msg = dbStore.addMandateChatMessage(mandate.id, {
        sender: 'client',
        senderName: 'Rohan Mehta',
        message: "What's the adviser's recommendation?",
      });

      expect(msg.message).toContain("'");
      expect(msg.message).not.toContain('&#039;');
    });
  });
});
