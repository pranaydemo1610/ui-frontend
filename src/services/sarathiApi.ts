import { apiClient } from './apiClient';
import type {
  SarathiVerificationRequest,
  SarathiVerificationResponse,
  SarathiDetailsResponse,
} from '@/types';

// SARATHI/01 - Driving License Verification
export async function verifyDrivingLicense(
  payload: SarathiVerificationRequest,
): Promise<SarathiVerificationResponse> {
  const { data } = await apiClient.post<SarathiVerificationResponse>('/sarathi/01', payload);
  return data;
}

// SARATHI/02 - Driving License Details
export async function fetchDrivingLicenseDetails(
  dlnumber: string,
): Promise<SarathiDetailsResponse> {
  const { data } = await apiClient.post<SarathiDetailsResponse>('/sarathi/02', { dlnumber });
  return data;
}
