import { useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { useThemeStore } from './store/themeStore';
import { Layout } from './components/Layout';
import { AdsListPage } from './pages/AdsList';
import { AdViewPage } from './pages/AdView';
import { AdEditPage } from './pages/AdEdit';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppContent() {
  const { colorScheme } = useThemeStore();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorScheme,
          primary: { main: '#2196F3' },
          warning: { main: '#FF9800' },
          background: {
            default: colorScheme === 'light' ? '#F5F7FA' : '#121212',
            paper: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { textTransform: 'none', fontWeight: 500 },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { fontWeight: 500 },
            },
          },
        },
      }),
    [colorScheme],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={3500}
      >
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/ads" replace />} />
              <Route path="/ads" element={<AdsListPage />} />
              <Route path="/ads/:id" element={<AdViewPage />} />
              <Route path="/ads/:id/edit" element={<AdEditPage />} />
              <Route path="*" element={<Navigate to="/ads" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
