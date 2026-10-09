/**
 * Localization Formatters (l10n)
 *
 * CRITICAL STATUTORY & USER SPECIFICATION:
 * All numbers, currencies, percentages, and numerical quantities MUST REMAIN
 * STRICTLY IN ENGLISH DIGITS (0-9) regardless of active language.
 * No conversion to Devanagari numerals, Bengali numerals, Gujarati numerals,
 * or localized numeral sets is permitted.
 */

/**
 * Format Indian Rupee currency amount strictly in English numerals
 * e.g. 825000 -> "₹8,25,000"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format number strictly in English numerals (en-IN Lakhs/Crores grouping)
 * e.g. 1850000 -> "18,50,000"
 */
export function formatNumber(num, options = {}) {
  if (num == null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN', options).format(Number(num));
}

/**
 * Format percentage strictly in English numerals
 * e.g. 50 -> "50%"
 */
export function formatPercent(num) {
  if (num == null || isNaN(num)) return '0%';
  return `${num}%`;
}

/**
 * Format date strictly using English digits and English month abbreviations
 * e.g. "14 Aug 2026, 06:30 PM"
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date only (no time) in DD/MM/YYYY with English digits
 */
export function formatDateOnly(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format time strictly using English digits
 * e.g. "06:30 PM"
 */
export function formatTime(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date and time alias strictly using English digits
 */
export const formatDateTime = formatDate;
