import { apiClient } from './apiClient';
import type {
  VahanVehicleNumberRequest,
  VahanChassisNumberRequest,
  VahanEngineNumberRequest,
  VahanVehicleResponse,
} from '@/types';

// VAHAN/04 - Vehicle Details by Vehicle Number
export async function searchByVehicleNumber(
  payload: VahanVehicleNumberRequest,
): Promise<VahanVehicleResponse> {
  const { data } = await apiClient.post<VahanVehicleResponse>('/vahan/04', payload);
  return data;
}

// VAHAN/05 - Vehicle Details by Chassis Number
export async function searchByChassisNumber(
  payload: VahanChassisNumberRequest,
): Promise<VahanVehicleResponse> {
  const { data } = await apiClient.post<VahanVehicleResponse>('/vahan/05', payload);
  return data;
}

// VAHAN/06 - Vehicle Details by Engine Number
export async function searchByEngineNumber(
  payload: VahanEngineNumberRequest,
): Promise<VahanVehicleResponse> {
  const { data } = await apiClient.post<VahanVehicleResponse>('/vahan/06', payload);
  return data;
}
