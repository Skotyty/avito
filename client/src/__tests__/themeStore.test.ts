import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../store/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ colorScheme: 'light' });
    localStorage.clear();
  });

  it('starts with light color scheme', () => {
    expect(useThemeStore.getState().colorScheme).toBe('light');
  });

  it('toggles from light to dark', () => {
    useThemeStore.getState().toggleColorScheme();
    expect(useThemeStore.getState().colorScheme).toBe('dark');
  });

  it('toggles from dark back to light', () => {
    useThemeStore.setState({ colorScheme: 'dark' });
    useThemeStore.getState().toggleColorScheme();
    expect(useThemeStore.getState().colorScheme).toBe('light');
  });

  it('toggles correctly multiple times', () => {
    useThemeStore.getState().toggleColorScheme(); // dark
    useThemeStore.getState().toggleColorScheme(); // light
    useThemeStore.getState().toggleColorScheme(); // dark
    expect(useThemeStore.getState().colorScheme).toBe('dark');
  });
});
