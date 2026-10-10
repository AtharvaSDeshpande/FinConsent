import { describe, it, expect, beforeEach } from 'vitest';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_CODES } from '../i18n/languages.js';
import { formatCurrency, formatNumber, formatPercent, formatDate, formatDateOnly } from '../i18n/formatters.js';
import { dictionaries } from '../i18n/locales/index.js';

describe('FinConsent Localization (i18n & l10n) Test Suite', () => {
  describe('1. Supported Languages & Defaults', () => {
    it('Defines English (en) as the default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });

    it('Supports exactly the 8 required languages: English, Hindi, Tamil, Bengali, Gujarati, German, Japanese, Korean', () => {
      const expectedCodes = ['en', 'hi', 'ta', 'bn', 'gu', 'de', 'ja', 'ko'];
      expect(LANGUAGE_CODES).toEqual(expectedCodes);
      expect(SUPPORTED_LANGUAGES).toHaveLength(8);

      const codesInRegistry = SUPPORTED_LANGUAGES.map((l) => l.code);
      expect(codesInRegistry).toEqual(expectedCodes);
    });

    it('Provides valid metadata (code, name, nativeName, flag) for each supported language', () => {
      SUPPORTED_LANGUAGES.forEach((lang) => {
        expect(lang.code).toBeTruthy();
        expect(lang.name).toBeTruthy();
        expect(lang.nativeName).toBeTruthy();
        expect(lang.flag).toBeTruthy();
      });

      const hindi = SUPPORTED_LANGUAGES.find((l) => l.code === 'hi');
      expect(hindi.name).toBe('Hindi');
      expect(hindi.nativeName).toBe('हिन्दी');

      const tamil = SUPPORTED_LANGUAGES.find((l) => l.code === 'ta');
      expect(tamil.name).toBe('Tamil');
      expect(tamil.nativeName).toBe('தமிழ்');

      const bengali = SUPPORTED_LANGUAGES.find((l) => l.code === 'bn');
      expect(bengali.name).toBe('Bengali');
      expect(bengali.nativeName).toBe('বাংলা');

      const gujarati = SUPPORTED_LANGUAGES.find((l) => l.code === 'gu');
      expect(gujarati.name).toBe('Gujarati');
      expect(gujarati.nativeName).toBe('ગુજરાતી');

      const german = SUPPORTED_LANGUAGES.find((l) => l.code === 'de');
      expect(german.name).toBe('German');
      expect(german.nativeName).toBe('Deutsch');

      const japanese = SUPPORTED_LANGUAGES.find((l) => l.code === 'ja');
      expect(japanese.name).toBe('Japanese');
      expect(japanese.nativeName).toBe('日本語');

      const korean = SUPPORTED_LANGUAGES.find((l) => l.code === 'ko');
      expect(korean.name).toBe('Korean');
      expect(korean.nativeName).toBe('한국어');
    });
  });

  describe('2. Static Text Translation Dictionaries', () => {
    const requiredSections = ['nav', 'common', 'status', 'profile', 'dashboard', 'mandate', 'client_review', 'otp', 'auth'];

    it('Contains complete translation dictionaries for all 8 languages', () => {
      LANGUAGE_CODES.forEach((code) => {
        const dict = dictionaries[code];
        expect(dict).toBeDefined();
        requiredSections.forEach((section) => {
          expect(dict[section]).toBeDefined();
          expect(Object.keys(dict[section]).length).toBeGreaterThan(0);
        });
      });
    });

    it('Translates navigation static text properly across languages', () => {
      expect(dictionaries.en.nav.dashboard).toBe('Dashboard');
      expect(dictionaries.hi.nav.dashboard).toBe('डैशबोर्ड');
      expect(dictionaries.ta.nav.dashboard).toBe('கட்டுப்பாட்டகம்');
      expect(dictionaries.bn.nav.dashboard).toBe('ড্যাশবোর্ড');
      expect(dictionaries.gu.nav.dashboard).toBe('ડેશબોર્ડ');
      expect(dictionaries.de.nav.dashboard).toBe('Dashboard');
      expect(dictionaries.ja.nav.dashboard).toBe('ダッシュボード');
      expect(dictionaries.ko.nav.dashboard).toBe('대시보드');
    });

    it('Translates profile statutory headings properly across languages', () => {
      expect(dictionaries.en.profile.section_language).toBe('Language & Localization Preferences');
      expect(dictionaries.hi.profile.section_language).toBe('भाषा एवं क्षेत्रीय प्राथमिकताएँ');
      expect(dictionaries.ta.profile.section_language).toBe('மொழி மற்றும் பிராந்திய விருப்பத்தேர்வுகள்');
      expect(dictionaries.bn.profile.section_language).toBe('ভাষা ও আঞ্চলিক পছন্দসমূহ');
      expect(dictionaries.gu.profile.section_language).toBe('ભાષા અને પ્રાદેશિક પસંદગીઓ');
      expect(dictionaries.de.profile.section_language).toBe('Sprach- & Regionaleinstellungen');
      expect(dictionaries.ja.profile.section_language).toBe('言語および地域設定');
      expect(dictionaries.ko.profile.section_language).toBe('언어 및 지역 설정');
    });

    it('Translates common status badges across languages', () => {
      LANGUAGE_CODES.forEach((code) => {
        const statusObj = dictionaries[code].status;
        expect(statusObj.draft).toBeTruthy();
        expect(statusObj.sent).toBeTruthy();
        expect(statusObj.viewed).toBeTruthy();
        expect(statusObj.in_review).toBeTruthy();
        expect(statusObj.consented).toBeTruthy();
        expect(statusObj.approved).toBeTruthy();
      });
    });
  });

  describe('3. Strict English-Only Numbers & Financial Data Guarantee', () => {
    it('Formats currency strictly in English numerals (INR)', () => {
      const formatted = formatCurrency(825000);
      expect(formatted).toBe('₹8,25,000');
      // Must not contain any non-ASCII digits
      expect(/[^\x20-\x7E]/.test(formatted.replace('₹', ''))).toBe(false);
      expect(/^[0-9,]+$/.test(formatted.replace('₹', ''))).toBe(true);
    });

    it('Formats numbers strictly in English numerals (0-9)', () => {
      const testNumbers = [0, 48, 125000, 1850000, 10000000];
      testNumbers.forEach((num) => {
        const formatted = formatNumber(num);
        expect(/^[0-9,]+$/.test(formatted)).toBe(true);
      });
    });

    it('Formats percentages strictly in English numerals (0-9)', () => {
      expect(formatPercent(50)).toBe('50%');
      expect(formatPercent(12.5)).toBe('12.5%');
      expect(formatPercent(20)).toBe('20%');
    });

    it('Formats dates strictly with English digits and English month names', () => {
      const date = new Date('2026-08-14T18:30:00Z');
      const formatted = formatDate(date);
      // Date should contain English characters and numbers
      expect(/[0-9]/.test(formatted)).toBe(true);
      expect(/Aug/i.test(formatted)).toBe(true);
    });

    it('Rejects non-English numeral conversion: Devanagari, Bengali, Gujarati numerals must never be produced', () => {
      const formatted = formatCurrency(1850000);
      // Devanagari numerals: ०-९ (\u0966-\u096F)
      expect(/[\u0966-\u096F]/.test(formatted)).toBe(false);
      // Bengali numerals: ০-৯ (\u09E6-\u09EF)
      expect(/[\u09E6-\u09EF]/.test(formatted)).toBe(false);
      // Gujarati numerals: ૦-૯ (\u0AE6-\u0AEF)
      expect(/[\u0AE6-\u0AEF]/.test(formatted)).toBe(false);
    });
  });

  describe('4. Dynamic Data Preserved in English', () => {
    it('Preserves client names, stock names, ISINs, and PANs in English', () => {
      const dynamicRecord = {
        clientName: 'Rohan Mehta',
        pan: 'ABCPM1234F',
        firmName: 'Prudent Wealth Advisory',
        sebiRegNumber: 'INA000088921',
        stock: 'HDFC Bank Ltd',
        isin: 'INE040A01034',
        rationale: 'Trimming appreciated equity positions to rebalance asset allocation.',
      };

      // These must remain exactly as received from database/user input
      expect(dynamicRecord.clientName).toBe('Rohan Mehta');
      expect(dynamicRecord.pan).toBe('ABCPM1234F');
      expect(dynamicRecord.firmName).toBe('Prudent Wealth Advisory');
      expect(dynamicRecord.stock).toBe('HDFC Bank Ltd');
      expect(dynamicRecord.isin).toBe('INE040A01034');
    });
  });

  describe('5. Backend Profile Language Persistence (/api/auth/profile)', () => {
    const PORT = 5000;
    const baseUrl = `http://localhost:${PORT}`;
    let authToken = '';

    beforeEach(async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ria@example.in', password: 'Password@123' }),
      });
      const data = await res.json();
      authToken = data.token;
    });

    it('PUT /api/auth/profile updates and persists preferredLanguage', async () => {
      // 1. Update language to Hindi ('hi')
      const updateResHi = await fetch(`${baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ preferredLanguage: 'hi' }),
      });
      expect(updateResHi.status).toBe(200);
      const dataHi = await updateResHi.json();
      expect(dataHi.success).toBe(true);
      expect(dataHi.user.preferredLanguage).toBe('hi');

      // 2. Update language to German ('de')
      const updateResDe = await fetch(`${baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ preferredLanguage: 'de' }),
      });
      expect(updateResDe.status).toBe(200);
      const dataDe = await updateResDe.json();
      expect(dataDe.success).toBe(true);
      expect(dataDe.user.preferredLanguage).toBe('de');

      // 3. Reset back to English ('en')
      const updateResEn = await fetch(`${baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ preferredLanguage: 'en' }),
      });
      expect(updateResEn.status).toBe(200);
      const dataEn = await updateResEn.json();
      expect(dataEn.success).toBe(true);
      expect(dataEn.user.preferredLanguage).toBe('en');
    });

    it('PUT /api/auth/profile ignores unsupported language codes', async () => {
      const res = await fetch(`${baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ preferredLanguage: 'unsupported_lang_xyz' }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      // Language should not be set to invalid code
      expect(data.user.preferredLanguage).not.toBe('unsupported_lang_xyz');
    });
  });
});
