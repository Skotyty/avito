import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

export function useDraftStorage<T>(id: number | string, _initialValue: T) {
  const key = `avito-draft-${id}`;

  const [draft, setDraft, clearDraft] = useLocalStorage<T | null>(key, null);
  return { draft, setDraft, clearDraft };
}

export function useChatStorage(itemId: number | string) {
  const key = `avito-chat-${itemId}`;
  const [messages, setMessages, clearMessages] = useLocalStorage<{ id: string; role: string; content: string; timestamp: string }[]>(key, []);
  return { messages, setMessages, clearMessages };
}
