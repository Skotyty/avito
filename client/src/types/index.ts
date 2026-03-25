export type KnownCategory = 'auto' | 'real_estate' | 'electronics';
export type Category = KnownCategory | (string & {});

export type SortColumn = 'title' | 'createdAt' | 'price';
export type SortDirection = 'asc' | 'desc';

export interface AutoItemParams {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  enginePower?: number;
}

export interface RealEstateItemParams {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number;
  floor?: number;
}

export interface ElectronicsItemParams {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
}

export type ItemParams = AutoItemParams | RealEstateItemParams | ElectronicsItemParams;

export interface ItemListEntry {
  id: number;
  category: Category;
  title: string;
  price: number | null;
  needsRevision: boolean;
}

export interface AutoItem {
  id: number;
  category: 'auto';
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  needsRevision: boolean;
  params: AutoItemParams;
}

export interface RealEstateItem {
  id: number;
  category: 'real_estate';
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  needsRevision: boolean;
  params: RealEstateItemParams;
}

export interface ElectronicsItem {
  id: number;
  category: 'electronics';
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  needsRevision: boolean;
  params: ElectronicsItemParams;
}

export type Item = AutoItem | RealEstateItem | ElectronicsItem;

export interface ItemsResponse {
  items: ItemListEntry[];
  total: number;
}

export interface ItemsQueryParams {
  q?: string;
  limit?: number;
  skip?: number;
  categories?: Category[];
  needsRevision?: boolean;
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
}

export interface ItemUpdatePayload {
  category: Category;
  title: string;
  description?: string;
  price: number;
  params: ItemParams;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}
