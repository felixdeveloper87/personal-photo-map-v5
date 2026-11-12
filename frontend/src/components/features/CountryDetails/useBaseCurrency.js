import { useCallback, useState } from 'react';

export const BASE_CURRENCIES = ['USD', 'EUR', 'GBP', 'BRL'];
const STORAGE_KEY = 'photomap.baseCurrency';
const EURO_LANGS = ['de', 'fr', 'es', 'it', 'nl', 'pt-PT', 'fi', 'el', 'sk', 'sl', 'et', 'lv', 'lt', 'ga', 'mt'];

const guessFromLocale = () => {
  const lang = typeof navigator !== 'undefined' ? navigator.language || '' : '';
  if (lang === 'pt-BR' || lang === 'pt') return 'BRL';
  if (lang === 'en-GB') return 'GBP';
  if (EURO_LANGS.some((l) => lang === l || lang.startsWith(`${l}-`))) return 'EUR';
  return 'USD';
};

const readStored = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return BASE_CURRENCIES.includes(value) ? value : null;
  } catch {
    return null;
  }
};

/** User's preferred "home" currency for the exchange-rate card, remembered per browser. */
export default function useBaseCurrency() {
  const [base, setBase] = useState(() => readStored() || guessFromLocale());

  const cycleBase = useCallback(() => {
    setBase((current) => {
      const next = BASE_CURRENCIES[(BASE_CURRENCIES.indexOf(current) + 1) % BASE_CURRENCIES.length];
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable — keep in memory only */
      }
      return next;
    });
  }, []);

  return { base, cycleBase };
}

/**
 * Builds "1 BASE = x QUOTE" from USD-based rates. If the country uses the base currency
 * itself, falls back to showing it against USD (or EUR when the base is USD).
 */
export function formatExchange(rates, base, quote) {
  if (!rates || !quote || quote === 'N/A' || !rates[quote]) return null;
  let from = base;
  if (from === quote) from = quote === 'USD' ? 'EUR' : 'USD';
  if (!rates[from]) return null;
  const rate = rates[quote] / rates[from];
  const digits = rate >= 100 ? 0 : rate >= 1 ? 2 : 4;
  return {
    from,
    label: `1 ${from} = ${rate.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${quote}`,
  };
}
