import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: 'light',
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'avito-color-scheme',
    },
  ),
);
