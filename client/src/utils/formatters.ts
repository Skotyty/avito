import type { Category } from '../types';

const KNOWN_LABELS: Partial<Record<Category, string>> = {
  auto: 'Транспорт',
  real_estate: 'Недвижимость',
  electronics: 'Электроника',
};

const KNOWN_COLORS: Partial<Record<Category, string>> = {
  auto: 'blue',
  real_estate: 'green',
  electronics: 'violet',
};

export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'Цена не указана';
  return `${price.toLocaleString('ru-RU')} ₽`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getCategoryLabel(category: string): string {
  return KNOWN_LABELS[category as Category] ?? category;
}

export function getCategoryColor(category: string): string {
  return KNOWN_COLORS[category as Category] ?? 'grey';
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}
