import { apiClient } from './apiClient';
import {
  mockFreightTracking,
  mockFreightCalc,
  mockParcelTracking,
} from './mockData';
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
  try {
    const { data } = await apiClient.post<FreightTrackingResponse>('/fois/01', payload);
    return data;
  } catch {
    return mockFreightTracking(payload.fnrnumber);
  }
}

// FOIS 02 - Freight Calculator
export async function calculateFreight(payload: FreightCalcRequest): Promise<FreightCalcResponse> {
  try {
    const { data } = await apiClient.post<FreightCalcResponse>('/fois/02', payload);
    return data;
  } catch {
    return mockFreightCalc(payload);
  }
}

// FOIS 04 - Parcel Tracking
export async function fetchParcelTracking(
  payload: ParcelTrackingRequest,
): Promise<ParcelTrackingResponse> {
  try {
    const { data } = await apiClient.post<ParcelTrackingResponse>('/fois/04', payload);
    return data;
  } catch {
    return mockParcelTracking(payload.lngpwbltno);
  }
}
