import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { itemsApi } from '../api/items';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

const mockItemsList = {
  items: [
    { id: 1, category: 'electronics', title: 'Phone', price: 50000, needsRevision: false },
  ],
  total: 1,
};

const mockItem = {
  id: 1,
  category: 'electronics',
  title: 'Phone',
  description: 'Good phone',
  price: 50000,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  needsRevision: false,
  params: { type: 'phone', brand: 'Apple', model: 'iPhone', condition: 'new', color: 'black' },
};

describe('itemsApi.getItems', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls /api/items and returns data', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItemsList });

    const result = await itemsApi.getItems({ limit: 10, skip: 0 });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({ params: { limit: '10', skip: '0' } }),
    );
    expect(result).toEqual(mockItemsList);
  });

  it('passes search query param', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItemsList });

    await itemsApi.getItems({ q: 'iphone', limit: 10, skip: 0 });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({ params: expect.objectContaining({ q: 'iphone' }) }),
    );
  });

  it('passes categories as comma-separated string', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItemsList });

    await itemsApi.getItems({ categories: ['auto', 'electronics'] });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({
        params: expect.objectContaining({ categories: 'auto,electronics' }),
      }),
    );
  });

  it('passes needsRevision=true when set', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItemsList });

    await itemsApi.getItems({ needsRevision: true });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({
        params: expect.objectContaining({ needsRevision: 'true' }),
      }),
    );
  });

  it('does not pass needsRevision when false', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItemsList });

    await itemsApi.getItems({ needsRevision: false });

    const call = (mockedAxios.get as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1].params).not.toHaveProperty('needsRevision');
  });

  it('passes sort params', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItemsList });

    await itemsApi.getItems({ sortColumn: 'createdAt', sortDirection: 'desc' });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({
        params: expect.objectContaining({ sortColumn: 'createdAt', sortDirection: 'desc' }),
      }),
    );
  });

  it('passes signal for request cancellation', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItemsList });
    const controller = new AbortController();

    await itemsApi.getItems({}, controller.signal);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});

describe('itemsApi.getItem', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls /api/items/:id and returns item', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItem });

    const result = await itemsApi.getItem(1);

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/items/1', expect.any(Object));
    expect(result).toEqual(mockItem);
  });

  it('passes signal for request cancellation', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: mockItem });
    const controller = new AbortController();

    await itemsApi.getItem(1, controller.signal);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/items/1',
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});

describe('itemsApi.updateItem', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls PUT /api/items/:id with payload', async () => {
    mockedAxios.put = vi.fn().mockResolvedValue({ data: { success: true } });

    const payload = {
      category: 'electronics' as const,
      title: 'Updated Phone',
      price: 45000,
      params: { brand: 'Samsung' },
    };

    await itemsApi.updateItem(1, payload);

    expect(mockedAxios.put).toHaveBeenCalledWith('/api/items/1', payload, expect.any(Object));
  });

  it('passes signal for request cancellation', async () => {
    mockedAxios.put = vi.fn().mockResolvedValue({ data: { success: true } });
    const controller = new AbortController();

    await itemsApi.updateItem(1, { category: 'auto', title: 'Car', price: 0, params: {} }, controller.signal);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      '/api/items/1',
      expect.any(Object),
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
