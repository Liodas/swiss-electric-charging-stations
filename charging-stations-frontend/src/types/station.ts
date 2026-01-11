export interface Station {
  id: string;
  name: string;
  address: string;
  isOpen24Hours: boolean;
}

export interface StationPosition {
  id: string;
  latitude: number;
  longitude: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
}