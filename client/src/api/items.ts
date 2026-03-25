import axios from 'axios';
import type { Category, Item, ItemsQueryParams, ItemsResponse, ItemUpdatePayload } from '../types';

const BASE_URL = '/api';

export const itemsApi = {
  getCategories: async (signal?: AbortSignal): Promise<Category[]> => {
    const { data } = await axios.get<ItemsResponse>(`${BASE_URL}/items`, {
      params: { limit: 9999 },
      signal,
    });
    const unique = [...new Set(data.items.map((item) => item.category))];
    return unique.sort() as Category[];
  },

  getItems: async (params: ItemsQueryParams, signal?: AbortSignal): Promise<ItemsResponse> => {
    const searchParams: Record<string, string> = {};

    if (params.q) searchParams.q = params.q;
    if (params.limit !== undefined) searchParams.limit = String(params.limit);
    if (params.skip !== undefined) searchParams.skip = String(params.skip);
    if (params.needsRevision) searchParams.needsRevision = 'true';
    if (params.categories?.length) searchParams.categories = params.categories.join(',');
    if (params.sortColumn) searchParams.sortColumn = params.sortColumn;
    if (params.sortDirection) searchParams.sortDirection = params.sortDirection;

    const { data } = await axios.get<ItemsResponse>(`${BASE_URL}/items`, {
      params: searchParams,
      signal,
    });

    return data;
  },

  getItem: async (id: number, signal?: AbortSignal): Promise<Item> => {
    const { data } = await axios.get<Item>(`${BASE_URL}/items/${id}`, { signal });
    return data;
  },

  updateItem: async (id: number, payload: ItemUpdatePayload, signal?: AbortSignal): Promise<void> => {
    await axios.put(`${BASE_URL}/items/${id}`, payload, { signal });
  },
};
