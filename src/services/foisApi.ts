import { apiClient } from './apiClient';
import type {
  FreightTrackingRequest,
  FreightTrackingResponse,
  FreightCalcRequest,
  FreightCalcResponse,
  ParcelTrackingRequest,
  ParcelTrackingResponse,
} from '@/types';

// FOIS 01 - Freight Tracking
export async function fetchFreightTracking(
  payload: FreightTrackingRequest,
): Promise<FreightTrackingResponse> {
  const { data } = await apiClient.post<FreightTrackingResponse>('/fois/01', payload);
  return data;
}

// FOIS 02 - Freight Calculator
export async function calculateFreight(payload: FreightCalcRequest): Promise<FreightCalcResponse> {
  const { data } = await apiClient.post<FreightCalcResponse>('/fois/02', payload);
  return data;
}

// FOIS 04 - Parcel Tracking
export async function fetchParcelTracking(
  payload: ParcelTrackingRequest,
): Promise<ParcelTrackingResponse> {
  const { data } = await apiClient.post<ParcelTrackingResponse>('/fois/04', payload);
  return data;
}
