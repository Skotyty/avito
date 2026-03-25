import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, useDraftStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when key is not set', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('saves value to localStorage on set', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('new value');
  });

  it('supports functional updater', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('removes value from localStorage on removeValue', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('stores and retrieves objects', () => {
    const { result } = renderHook(() => useLocalStorage<{ name: string }>('obj-key', { name: '' }));

    act(() => {
      result.current[1]({ name: 'test' });
    });

    expect(result.current[0]).toEqual({ name: 'test' });
    expect(JSON.parse(localStorage.getItem('obj-key')!)).toEqual({ name: 'test' });
  });
});

describe('useDraftStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null draft when nothing is saved', () => {
    const { result } = renderHook(() => useDraftStorage(1, {}));
    expect(result.current.draft).toBeNull();
  });

  it('saves draft to localStorage with item-specific key', () => {
    const { result } = renderHook(() => useDraftStorage(42, {}));

    act(() => {
      result.current.setDraft({ title: 'Test draft' });
    });

    expect(result.current.draft).toEqual({ title: 'Test draft' });
    expect(localStorage.getItem('avito-draft-42')).toBeTruthy();
  });

  it('clears draft from localStorage', () => {
    const { result } = renderHook(() => useDraftStorage(42, {}));

    act(() => { result.current.setDraft({ title: 'draft' }); });
    act(() => { result.current.clearDraft(); });

    expect(result.current.draft).toBeNull();
    expect(localStorage.getItem('avito-draft-42')).toBeNull();
  });

  it('uses different keys for different item ids', () => {
    const { result: r1 } = renderHook(() => useDraftStorage(1, {}));
    const { result: r2 } = renderHook(() => useDraftStorage(2, {}));

    act(() => { r1.current.setDraft({ title: 'item 1' }); });

    expect(r1.current.draft).toEqual({ title: 'item 1' });
    expect(r2.current.draft).toBeNull();
  });
});
