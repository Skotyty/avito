import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { DiffViewer } from '../components/DiffViewer';

const theme = createTheme();

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('DiffViewer', () => {
  it('renders "Было" and "Стало" labels', () => {
    renderWithProviders(<DiffViewer original="Old text" improved="New text" />);
    expect(screen.getByText('Было')).toBeInTheDocument();
    expect(screen.getByText('Стало')).toBeInTheDocument();
  });

  it('shows content in both panels', () => {
    renderWithProviders(<DiffViewer original="Hello world" improved="Hello universe" />);
    expect(screen.getAllByText(/Hello/).length).toBeGreaterThan(0);
  });

  it('handles empty strings gracefully', () => {
    renderWithProviders(<DiffViewer original="" improved="New content" />);
    expect(screen.getByText('Было')).toBeInTheDocument();
  });
});
