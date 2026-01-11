import { Station, StationPosition, PaginatedResult } from '@/types/station';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5068';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getStations(): Promise<StationPosition[]> {
    const endpoint = `/api/ChargingStations`;
    
    return this.request<StationPosition[]>(endpoint);
  }

  async getStationsByPostalCode(postalCode: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResult<Station>> {
    return this.request<PaginatedResult<Station>>(`/api/ChargingStations/postalCode?postalCode=${postalCode}&page=${page}&pageSize=${pageSize}`);
  }

  async getStationById(stationId: string): Promise<Station> {
    return this.request<Station>(`/api/ChargingStations/${stationId}`);
  }

}

export const apiClient = new ApiClient();
export default apiClient;