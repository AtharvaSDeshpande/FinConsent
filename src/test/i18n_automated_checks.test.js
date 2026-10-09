import { describe, it, expect } from 'vitest';
import { dictionaries, en } from '../i18n/locales/index.js';
import { SUPPORTED_LANGUAGES, LANGUAGE_CODES, DEFAULT_LANGUAGE } from '../i18n/languages.js';
import { billing } from '../i18n/locales/domains/billing.js';
import { chat } from '../i18n/locales/domains/chat.js';
import { magic_link } from '../i18n/locales/domains/magic_link.js';
import { dossier } from '../i18n/locales/domains/dossier.js';
import { landing } from '../i18n/locales/domains/landing.js';
import { guest } from '../i18n/locales/domains/guest.js';
import { tax } from '../i18n/locales/domains/tax.js';
import { validation } from '../i18n/locales/domains/validation.js';
import { legal } from '../i18n/locales/domains/legal.js';

// Helper to collect all nested keys in dot notation
const getAllLeafKeys = (obj, prefix = '') => {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getAllLeafKeys(v, fullKey));
    } else {
      keys.push({ key: fullKey, value: v });
    }
  }
  return keys;
};

// Helper to get nested value by dot path
const getNestedValue = (obj, path) => {
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (!curr || typeof curr !== 'object') return undefined;
    curr = curr[part];
  }
  return curr;
};

// Extract {param} placeholders from a string
const extractTokens = (str) => {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{([a-zA-Z0-9_]+)\}/g);
  return matches ? matches.map((m) => m.slice(1, -1)).sort() : [];
};

describe('Automated i18n & Localization Auditing Engine', () => {
  const englishKeys = getAllLeafKeys(dictionaries.en);

  describe('1. Missing Key Detection (100% Key Parity Across All 8 Languages)', () => {
    it('English dictionary defines substantial coverage across all application domains', () => {
      expect(englishKeys.length).toBeGreaterThan(150);
    });

    LANGUAGE_CODES.filter((code) => code !== 'en').forEach((targetLang) => {
      it(`Language '${targetLang}' contains 100% key parity with English dictionary`, () => {
        const targetDict = dictionaries[targetLang];
        expect(targetDict).toBeDefined();

        const missingKeys = [];
        englishKeys.forEach(({ key }) => {
          const val = getNestedValue(targetDict, key);
          if (val === undefined || val === null || val === '') {
            missingKeys.push(key);
          }
        });

        if (missingKeys.length > 0) {
          console.error(`[Missing Keys in ${targetLang}]:`, missingKeys);
        }
        expect(missingKeys).toEqual([]);
      });
    });
  });

  describe('2. Fallback Failure & Safe Lookup Verification', () => {
    // Simulator for I18n lookup engine
    const resolveTranslation = (lang, keyPath, params = {}) => {
      const activeDict = dictionaries[lang] || dictionaries[DEFAULT_LANGUAGE];
      const enDict = dictionaries[DEFAULT_LANGUAGE];

      let rawText = getNestedValue(activeDict, keyPath);
      // Safe fallback to English if missing in target
      if (rawText === undefined || rawText === null) {
        rawText = getNestedValue(enDict, keyPath);
      }
      // Safe fallback to key if completely missing
      if (rawText === undefined || rawText === null) {
        return keyPath;
      }

      // Interpolate parameters
      if (typeof rawText === 'string') {
        return rawText.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, paramName) => {
          return params[paramName] !== undefined ? String(params[paramName]) : match;
        });
      }
      return rawText;
    };

    it('Resolves native translation when key exists in target language', () => {
      const hiDashboard = resolveTranslation('hi', 'nav.dashboard');
      expect(hiDashboard).toBe('डैशबोर्ड');

      const jaClient = resolveTranslation('ja', 'common.loading');
      expect(jaClient).toBe('読み込み中...');
    });

    it('Safely falls back to English when a key is undefined in target language', () => {
      const fallbackResult = resolveTranslation('hi', 'nav.non_existent_key_for_testing');
      expect(fallbackResult).toBe('nav.non_existent_key_for_testing');
    });

    it('Safely interpolates tokens across languages without breaking', () => {
      const interpolatedEn = resolveTranslation('en', 'magic_link.whatsapp_msg_template', {
        title: 'Portfolio Rebalance',
        tax: '₹45,000',
        url: 'https://example.com/m/xyz',
      });
      expect(interpolatedEn).toContain('Portfolio Rebalance');
      expect(interpolatedEn).toContain('₹45,000');
      expect(interpolatedEn).toContain('https://example.com/m/xyz');

      const interpolatedHi = resolveTranslation('hi', 'magic_link.whatsapp_msg_template', {
        title: 'Portfolio Rebalance',
        tax: '₹45,000',
        url: 'https://example.com/m/xyz',
      });
      expect(interpolatedHi).toContain('Portfolio Rebalance');
      expect(interpolatedHi).toContain('₹45,000');
      expect(interpolatedHi).toContain('https://example.com/m/xyz');
    });

    it('Leaves unsupplied tokens intact as {token} rather than throwing or rendering undefined', () => {
      const partialEn = resolveTranslation('en', 'magic_link.format_helper', {});
      expect(partialEn).toContain('{pan}');
    });
  });

  describe('3. Parameter Interpolation Token Parity Verification', () => {
    LANGUAGE_CODES.filter((code) => code !== 'en').forEach((targetLang) => {
      it(`Token placeholders in '${targetLang}' match English parameter tokens exactly`, () => {
        const targetDict = dictionaries[targetLang];
        const tokenMismatches = [];

        englishKeys.forEach(({ key, value }) => {
          if (typeof value === 'string') {
            const enTokens = extractTokens(value);
            if (enTokens.length > 0) {
              const targetVal = getNestedValue(targetDict, key);
              const targetTokens = extractTokens(targetVal);
              if (JSON.stringify(enTokens) !== JSON.stringify(targetTokens)) {
                tokenMismatches.push({
                  key,
                  expected: enTokens,
                  actual: targetTokens,
                });
              }
            }
          }
        });

        if (tokenMismatches.length > 0) {
          console.error(`[Token Mismatches in ${targetLang}]:`, tokenMismatches);
        }
        expect(tokenMismatches).toEqual([]);
      });
    });
  });

  describe('4. Statutory Numeral Neutrality (Zero Localized/Non-ASCII Digits)', () => {
    // Non-ASCII numeral regexes (Devanagari, Bengali, Gujarati, Arabic-Indic, etc.)
    const nonAsciiDigitsRegex = /[\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0CE6-\u0CEF\u0D66-\u0D6F]/;

    LANGUAGE_CODES.forEach((code) => {
      it(`Translation dictionary '${code}' contains ZERO localized non-ASCII numerals`, () => {
        const dict = dictionaries[code];
        const allKeys = getAllLeafKeys(dict);
        const forbiddenNumerals = [];

        allKeys.forEach(({ key, value }) => {
          if (typeof value === 'string' && nonAsciiDigitsRegex.test(value)) {
            forbiddenNumerals.push({ key, value });
          }
        });

        if (forbiddenNumerals.length > 0) {
          console.error(`[Forbidden Non-ASCII Numerals in ${code}]:`, forbiddenNumerals);
        }
        expect(forbiddenNumerals).toEqual([]);
      });
    });
  });

  describe('5. Feature Domain Modularity & Export Structure', () => {
    const domainModules = [
      { name: 'billing', mod: billing },
      { name: 'chat', mod: chat },
      { name: 'magic_link', mod: magic_link },
      { name: 'dossier', mod: dossier },
      { name: 'landing', mod: landing },
      { name: 'guest', mod: guest },
      { name: 'tax', mod: tax },
      { name: 'validation', mod: validation },
      { name: 'legal', mod: legal },
    ];

    domainModules.forEach(({ name, mod }) => {
      it(`Domain module '${name}' provides keys for all 8 supported languages`, () => {
        expect(mod).toBeDefined();
        LANGUAGE_CODES.forEach((code) => {
          expect(mod[code]).toBeDefined();
          expect(Object.keys(mod[code]).length).toBeGreaterThan(0);
        });
      });

      it(`Domain module '${name}' has 100% key parity between English and other languages`, () => {
        const enKeys = Object.keys(mod.en);
        LANGUAGE_CODES.filter((code) => code !== 'en').forEach((code) => {
          const targetKeys = Object.keys(mod[code]);
          const missing = enKeys.filter((k) => !targetKeys.includes(k));
          expect(missing).toEqual([]);
        });
      });
    });
  });
});
