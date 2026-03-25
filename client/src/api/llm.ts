import axios, { AxiosError } from 'axios';
import type { Item, ChatMessage } from '../types';

const LLM_BASE_URL = import.meta.env.VITE_LLM_BASE_URL ?? 'http://localhost:11434';
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL ?? 'llama3';

function buildItemContext(item: Item): string {
  const lines: string[] = [
    `Категория: ${item.category === 'auto' ? 'Транспорт' : item.category === 'real_estate' ? 'Недвижимость' : 'Электроника'}`,
    `Название: ${item.title}`,
    `Цена: ${item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : 'не указана'}`,
    `Описание: ${item.description || '(не заполнено)'}`,
  ];

  if (item.category === 'auto') {
    const p = item.params;
    if (p.brand) lines.push(`Марка: ${p.brand}`);
    if (p.model) lines.push(`Модель: ${p.model}`);
    if (p.yearOfManufacture) lines.push(`Год выпуска: ${p.yearOfManufacture}`);
    if (p.transmission) lines.push(`КПП: ${p.transmission === 'automatic' ? 'Автомат' : 'Механика'}`);
    if (p.mileage) lines.push(`Пробег: ${p.mileage.toLocaleString('ru-RU')} км`);
    if (p.enginePower) lines.push(`Мощность двигателя: ${p.enginePower} л.с.`);
  } else if (item.category === 'real_estate') {
    const p = item.params;
    const typeLabel = p.type === 'flat' ? 'Квартира' : p.type === 'house' ? 'Дом' : 'Комната';
    if (p.type) lines.push(`Тип: ${typeLabel}`);
    if (p.address) lines.push(`Адрес: ${p.address}`);
    if (p.area) lines.push(`Площадь: ${p.area} м²`);
    if (p.floor) lines.push(`Этаж: ${p.floor}`);
  } else if (item.category === 'electronics') {
    const p = item.params;
    const typeLabel = p.type === 'phone' ? 'Телефон' : p.type === 'laptop' ? 'Ноутбук' : 'Другое';
    if (p.type) lines.push(`Тип: ${typeLabel}`);
    if (p.brand) lines.push(`Бренд: ${p.brand}`);
    if (p.model) lines.push(`Модель: ${p.model}`);
    if (p.condition) lines.push(`Состояние: ${p.condition === 'new' ? 'Новый' : 'Б/у'}`);
    if (p.color) lines.push(`Цвет: ${p.color}`);
  }

  return lines.join('\n');
}

export function getLlmErrorMessage(err: unknown): string {
  if (axios.isCancel(err)) return '';
  const name = (err as { name?: string }).name ?? '';
  if (name === 'AbortError' || name === 'CanceledError') return '';

  const axiosErr = err as AxiosError;
  if (axiosErr.code === 'ERR_NETWORK' || axiosErr.code === 'ECONNREFUSED' || axiosErr.message?.includes('Network Error')) {
    return `Ollama не отвечает. Убедитесь, что она запущена:\n• ollama serve\n• OLLAMA_ORIGINS=* ollama serve (если нужен CORS)`;
  }
  if (axiosErr.response?.status === 404) {
    return `Модель "${LLM_MODEL}" не найдена. Загрузите её: ollama pull ${LLM_MODEL}`;
  }
  return 'Ошибка AI-ассистента. Проверьте настройки LLM в .env';
}

async function callLLM(systemPrompt: string, userMessage: string, signal?: AbortSignal): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const { data } = await axios.post(
    `${LLM_BASE_URL}/api/chat`,
    {
      model: LLM_MODEL,
      messages,
      stream: false,
    },
    { signal },
  );
  return data.message?.content ?? '';
}

export const llmApi = {
  generateDescription: async (item: Item, signal?: AbortSignal): Promise<string> => {
    const context = buildItemContext(item);
    const systemPrompt =
      'Ты — профессиональный копирайтер для сайта объявлений Авито. ' +
      'Пиши живые, убедительные описания на русском языке. ' +
      'Описание должно быть 2-4 абзаца, подчёркивать достоинства товара и мотивировать к покупке. ' +
      'Отвечай только текстом описания, без заголовков и вступлений.';

    const userMessage = `Напиши продающее описание для объявления:\n${context}`;

    return callLLM(systemPrompt, userMessage, signal);
  },

  suggestPrice: async (item: Item, signal?: AbortSignal): Promise<string> => {
    const context = buildItemContext(item);
    const systemPrompt =
      'Ты — эксперт по оценке рыночной стоимости товаров на российском рынке. ' +
      'Анализируй характеристики товара и называй реалистичный диапазон цен. ' +
      'Отвечай кратко: назови диапазон цен и 1-2 предложения с обоснованием.';

    const userMessage = `Оцени рыночную стоимость товара:\n${context}`;

    return callLLM(systemPrompt, userMessage, signal);
  },

  chat: async (
    item: Item,
    history: ChatMessage[],
    userMessage: string,
    signal?: AbortSignal,
  ): Promise<string> => {
    const context = buildItemContext(item);
    const systemPrompt =
      'Ты — AI-ассистент для продавца на Авито. ' +
      'Помогай улучшать объявление, давай советы по ценообразованию, описанию и фотографиям. ' +
      'Отвечай на русском языке, кратко и по делу.\n\n' +
      `Контекст текущего объявления:\n${context}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const { data } = await axios.post(
      `${LLM_BASE_URL}/api/chat`,
      { model: LLM_MODEL, messages, stream: false },
      { signal },
    );
    return data.message?.content ?? '';
  },
};
