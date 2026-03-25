import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { AdCard } from '../components/AdCard';
import type { ItemListEntry } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const theme = createTheme();

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>,
  );
}

const mockItem: ItemListEntry = {
  id: 42,
  category: 'electronics',
  title: 'Тестовый телефон',
  price: 50000,
  needsRevision: false,
};

describe('AdCard', () => {
  it('renders item title', () => {
    renderWithProviders(<AdCard item={mockItem} />);
    expect(screen.getByText('Тестовый телефон')).toBeInTheDocument();
  });

  it('renders category label', () => {
    renderWithProviders(<AdCard item={mockItem} />);
    expect(screen.getByText('Электроника')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    renderWithProviders(<AdCard item={mockItem} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('navigates to item page on click', () => {
    renderWithProviders(<AdCard item={mockItem} />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith('/ads/42');
  });

  it('shows revision badge when needsRevision is true', () => {
    renderWithProviders(<AdCard item={{ ...mockItem, needsRevision: true }} />);
    expect(screen.getByText(/Требует доработок/)).toBeInTheDocument();
  });

  it('does not show revision badge when needsRevision is false', () => {
    renderWithProviders(<AdCard item={mockItem} />);
    expect(screen.queryByText(/Требует доработок/)).not.toBeInTheDocument();
  });

  it('renders in list mode', () => {
    renderWithProviders(<AdCard item={mockItem} viewMode="list" />);
    expect(screen.getByText('Тестовый телефон')).toBeInTheDocument();
  });
});
