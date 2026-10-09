import { en as rawEn } from './en.js';
import { hi as rawHi } from './hi.js';
import { ta as rawTa } from './ta.js';
import { bn as rawBn } from './bn.js';
import { gu as rawGu } from './gu.js';
import { de as rawDe } from './de.js';
import { ja as rawJa } from './ja.js';
import { ko as rawKo } from './ko.js';

import { billing } from './domains/billing.js';
import { chat } from './domains/chat.js';
import { magic_link } from './domains/magic_link.js';
import { dossier } from './domains/dossier.js';
import { landing } from './domains/landing.js';
import { guest } from './domains/guest.js';
import { tax } from './domains/tax.js';
import { validation } from './domains/validation.js';
import { legal } from './domains/legal.js';

const mergeDomains = (baseDict, lang) => ({
  ...baseDict,
  billing: { ...(baseDict.billing || {}), ...(billing[lang] || {}) },
  chat: { ...(baseDict.chat || {}), ...(chat[lang] || {}) },
  magic_link: { ...(baseDict.magic_link || {}), ...(magic_link[lang] || {}) },
  dossier: { ...(baseDict.dossier || {}), ...(dossier[lang] || {}) },
  landing: { ...(baseDict.landing || {}), ...(landing[lang] || {}) },
  guest: { ...(baseDict.guest || {}), ...(guest[lang] || {}) },
  tax: { ...(baseDict.tax || {}), ...(tax[lang] || {}) },
  validation: { ...(baseDict.validation || {}), ...(validation[lang] || {}) },
  legal: { ...(baseDict.legal || {}), ...(legal[lang] || {}) },
});

export const en = mergeDomains(rawEn, 'en');
export const hi = mergeDomains(rawHi, 'hi');
export const ta = mergeDomains(rawTa, 'ta');
export const bn = mergeDomains(rawBn, 'bn');
export const gu = mergeDomains(rawGu, 'gu');
export const de = mergeDomains(rawDe, 'de');
export const ja = mergeDomains(rawJa, 'ja');
export const ko = mergeDomains(rawKo, 'ko');

export const dictionaries = {
  en,
  hi,
  ta,
  bn,
  gu,
  de,
  ja,
  ko,
};
