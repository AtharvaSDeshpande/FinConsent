import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_CODES } from './languages.js';
import { dictionaries } from './locales/index.js';
import { formatCurrency, formatNumber, formatPercent, formatDate, formatDateOnly, formatTime, formatDateTime } from './formatters.js';

const I18nContext = createContext(null);

const STORAGE_KEY = 'finconsent_language';

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && LANGUAGE_CODES.includes(stored)) {
        return stored;
      }
    } catch {
      // localStorage may not be accessible in some environments
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((newLang) => {
    if (!newLang || !LANGUAGE_CODES.includes(newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore storage errors
    }
  }, []);

  // Translation function t(key, params)
  const t = useCallback((keyPath, params = {}) => {
    if (!keyPath || typeof keyPath !== 'string') return '';

    const parts = keyPath.split('.');
    
    // 1. Look up in active language dictionary
    let value = dictionaries[language];
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }

    // 2. Fallback to English dictionary if missing
    if (value === undefined && language !== 'en') {
      let fallbackValue = dictionaries['en'];
      for (const part of parts) {
        if (fallbackValue && typeof fallbackValue === 'object' && part in fallbackValue) {
          fallbackValue = fallbackValue[part];
        } else {
          fallbackValue = undefined;
          break;
        }
      }
      value = fallbackValue;
    }

    // 3. Fallback to key itself if not found
    if (value === undefined || typeof value !== 'string') {
      return keyPath;
    }

    // 4. Parameter interpolation (numbers strictly preserved in English digits)
    if (params && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        if (paramKey in params) {
          const val = params[paramKey];
          // Ensure numbers are represented in English numerals
          if (typeof val === 'number') {
            return String(val);
          }
          return String(val);
        }
        return match;
      });
    }

    return value;
  }, [language]);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    currentLanguageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
    // Formatters ensuring English-only numbers and currency
    formatCurrency,
    formatNumber,
    formatPercent,
    formatDate,
    formatDateOnly,
    formatTime,
    formatDateTime,
  }), [language, setLanguage, t, currentLanguageInfo]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const useTranslation = () => useI18n();

export default I18nContext;
