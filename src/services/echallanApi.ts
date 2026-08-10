import { apiClient } from './apiClient';
import { mockEchallan } from './mockData';
import type { EchallanRequest, EchallanResponse } from '@/types';

// ECHALLAN/01 - Vehicle Challan Search
export async function searchVehicleChallan(
  payload: EchallanRequest,
): Promise<EchallanResponse> {
  try {
    const { data } = await apiClient.post<EchallanResponse>('/echallan/01', payload);
    return data;
  } catch {
    return mockEchallan(payload.vehicleNumber);
  }
}
