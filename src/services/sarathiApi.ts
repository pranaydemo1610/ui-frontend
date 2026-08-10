import { apiClient } from './apiClient';
import { mockSarathiVerification, mockSarathiDetails } from './mockData';
import type {
  SarathiVerificationRequest,
  SarathiVerificationResponse,
  SarathiDetailsResponse,
} from '@/types';

// SARATHI/01 - Driving License Verification
export async function verifyDrivingLicense(
  payload: SarathiVerificationRequest,
): Promise<SarathiVerificationResponse> {
  try {
    const { data } = await apiClient.post<SarathiVerificationResponse>('/sarathi/01', payload);
    return data;
  } catch {
    return mockSarathiVerification(payload);
  }
}

// SARATHI/02 - Driving License Details
export async function fetchDrivingLicenseDetails(
  dlnumber: string,
): Promise<SarathiDetailsResponse> {
  try {
    const { data } = await apiClient.post<SarathiDetailsResponse>('/sarathi/02', { dlnumber });
    return data;
  } catch {
    return mockSarathiDetails(dlnumber);
  }
}
