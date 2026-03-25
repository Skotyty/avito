import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, getCategoryLabel, getCategoryColor, truncate } from '../utils/formatters';

describe('formatPrice', () => {
  it('formats price with ruble sign', () => {
    expect(formatPrice(1000)).toContain('₽');
    expect(formatPrice(1000)).toContain('1');
  });

  it('returns placeholder when price is null', () => {
    expect(formatPrice(null)).toBe('Цена не указана');
  });

  it('formats large numbers with separators', () => {
    const formatted = formatPrice(1_000_000);
    expect(formatted).toContain('₽');
    expect(formatted.length).toBeGreaterThan(7);
  });
});

describe('getCategoryLabel', () => {
  it('returns correct label for auto', () => {
    expect(getCategoryLabel('auto')).toBe('Транспорт');
  });

  it('returns correct label for real_estate', () => {
    expect(getCategoryLabel('real_estate')).toBe('Недвижимость');
  });

  it('returns correct label for electronics', () => {
    expect(getCategoryLabel('electronics')).toBe('Электроника');
  });
});

describe('getCategoryColor', () => {
  it('returns a non-empty string for each category', () => {
    expect(getCategoryColor('auto')).toBeTruthy();
    expect(getCategoryColor('real_estate')).toBeTruthy();
    expect(getCategoryColor('electronics')).toBeTruthy();
  });
});

describe('truncate', () => {
  it('does not truncate short text', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates long text with ellipsis', () => {
    const result = truncate('Hello World', 5);
    expect(result).toBe('Hello…');
    expect(result.length).toBeLessThan(12);
  });

  it('returns text as-is when exactly at limit', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('formatDate', () => {
  it('returns a non-empty string for a valid date', () => {
    const result = formatDate('2026-03-10T00:00:00.000Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
