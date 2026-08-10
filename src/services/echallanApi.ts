import { apiClient } from './apiClient';
import type { EchallanRequest, EchallanResponse } from '@/types';

// ECHALLAN/01 - Vehicle Challan Search
export async function searchVehicleChallan(
  payload: EchallanRequest,
): Promise<EchallanResponse> {
  const { data } = await apiClient.post<EchallanResponse>('/echallan/01', payload);
  return data;
}
