import { type ClassValue, clsx } from 'clsx';

/**
 * Utility to conditionally join classNames together.
 * Uses clsx under the hood for a clean API.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a number as currency.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'CLP',
  locale: string = 'es-CL'
): string {
  const isCLP = currency === 'CLP';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: isCLP ? 0 : 2,
    maximumFractionDigits: isCLP ? 0 : 2,
  }).format(amount);
}

/**
 * Format a date for display.
 */
export function formatDate(
  date: Date | string,
  locale: string = 'es-DO',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Get the first and last day of a given month.
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get the first and last day of a given year.
 */
export function getYearRange(year: number): { start: Date; end: Date } {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Safe JSON parse with a fallback.
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Helper to check if a transaction represents a payment to a credit card.
 */
export function isCreditCardPayment(txn: any): boolean {
  if (!txn) return false;
  if (txn.category === 'abono_tarjeta') return true;
  if (txn.type === 'transfer' || txn.category === 'transfer') {
    const desc = (txn.description || '').toLowerCase();
    const notes = (txn.notes || '').toLowerCase();
    return (
      desc.includes('pago tarjeta') ||
      desc.includes('pago cupo internacional') ||
      notes.includes('pago de tarjeta de crédito') ||
      notes.includes('pago de cupo internacional')
    );
  }
  return false;
}

