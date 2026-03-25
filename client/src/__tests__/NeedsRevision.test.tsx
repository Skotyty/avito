import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { NeedsRevisionAlert } from '../components/NeedsRevisionBadge';
import type { Item } from '../types';

const theme = createTheme();

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const fullItem: Item = {
  id: 1,
  category: 'electronics',
  title: 'Test Phone',
  description: 'Full description',
  price: 50000,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  needsRevision: false,
  params: { type: 'phone', brand: 'Apple', model: 'iPhone 15', condition: 'new', color: 'black' },
};

describe('NeedsRevisionAlert', () => {
  it('renders nothing when all fields are filled', () => {
    renderWithProviders(<NeedsRevisionAlert item={fullItem} />);
    expect(screen.queryByText('Требуются доработки')).not.toBeInTheDocument();
  });

  it('shows when description is missing', () => {
    renderWithProviders(<NeedsRevisionAlert item={{ ...fullItem, description: undefined }} />);
    expect(screen.getByText('Требуются доработки')).toBeInTheDocument();
    expect(screen.getByText('Описание')).toBeInTheDocument();
  });

  it('shows missing electronics params', () => {
    renderWithProviders(<NeedsRevisionAlert item={{ ...fullItem, description: 'desc', params: {} }} />);
    expect(screen.getByText('Бренд')).toBeInTheDocument();
  });

  it('shows missing auto params', () => {
    const autoItem: Item = {
      id: 2, category: 'auto', title: 'Car', description: undefined,
      price: 500000, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
      needsRevision: true, params: {},
    };
    renderWithProviders(<NeedsRevisionAlert item={autoItem} />);
    expect(screen.getByText('Марка')).toBeInTheDocument();
  });
});
