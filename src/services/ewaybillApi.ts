import { apiClient } from './apiClient';
import { mockEwaybill } from './mockData';
import type { EwaybillRequest, EwaybillResponse, EwaybillVehicle } from '@/types';

// The raw ULIP E-Way Bill response is nested (response[] → response → EWB/VehiclListDetails)
// and varies between the raw gateway and normalized gateway shapes. These helpers
// recursively normalise the payload into the dashboard contract used by the UI.

function asRecord(obj: unknown): Record<string, unknown> {
  return obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : {};
}

function pick(obj: unknown, keys: string[]): string {
  const r = asRecord(obj);
  for (const k of keys) {
    const v = r[k];
    if (v !== undefined && v !== null && v !== '') {
      if (Array.isArray(v)) return v.join(',');
      return String(v);
    }
  }
  return '';
}

function deepPick(obj: unknown, keys: string[], depth = 0, maxDepth = 10): string {
  if (depth > maxDepth || obj === null || typeof obj !== 'object') return '';
  const r = asRecord(obj);
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(r, k)) {
      const v = r[k];
      if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') return String(v);
      if (Array.isArray(v) && v.length > 0) return v.join(',');
    }
  }
  for (const k of Object.keys(r)) {
    const found = deepPick(r[k], keys, depth + 1, maxDepth);
    if (found) return found;
  }
  return '';
}

function collectArrays(
  obj: unknown,
  matches: (item: Record<string, unknown>) => boolean,
  depth = 0,
  maxDepth = 10,
): unknown[] {
  const out: unknown[] = [];
  if (depth > maxDepth || obj === null || typeof obj !== 'object') return out;
  if (Array.isArray(obj)) {
    if (obj.some((x) => matches(asRecord(x)))) {
      out.push(...obj);
    }
    for (const item of obj) out.push(...collectArrays(item, matches, depth + 1, maxDepth));
    return out;
  }
  for (const k of Object.keys(asRecord(obj))) {
    out.push(...collectArrays(asRecord(obj)[k], matches, depth + 1, maxDepth));
  }
  return out;
}

const isVehicle = (o: Record<string, unknown>) =>
  Object.prototype.hasOwnProperty.call(o, 'vehicleNumber') ||
  Object.prototype.hasOwnProperty.call(o, 'vehicleNo') ||
  Object.prototype.hasOwnProperty.call(o, 'VEHICLENO') ||
  (Object.prototype.hasOwnProperty.call(o, 'enteredDate') && Object.prototype.hasOwnProperty.call(o, 'transMode'));

function mapVehicle(v: unknown): EwaybillVehicle {
  const r = asRecord(v);
  return {
    vehicleNumber: pick(r, ['vehicleNumber', 'vehicleNo', 'VEHICLENO', 'vehicle_no', 'regNumber']),
    enteredDate: pick(r, ['enteredDate', 'enterddate', 'entereddate', 'ENT_DT', 'docDate']),
    transMode: pick(r, ['transMode', 'transmode', 'transModeCode', 'TRANSPORTMODE', 'mode']),
  };
}

export function normalizeEwaybill(raw: unknown, requestEwbNo: string): EwaybillResponse {
  const vehicles = collectArrays(raw, isVehicle).map(mapVehicle);

  return {
    ewbNo: deepPick(raw, ['ewbNo', 'EWBNo', 'ewbno', 'ewb_number']) || requestEwbNo,
    status: deepPick(raw, ['status', 'ewbStatus', 'EWB_STATUS']),
    ewayBillDate: deepPick(raw, ['ewayBillDate', 'ewaybilldate', 'EWAYBILLDATE', 'docDate', 'DocDate']),
    validUpto: deepPick(raw, ['validUpto', 'validupto', 'VALIDUPTO', 'validTill', 'validTillDate']),
    fromPincode: deepPick(raw, ['fromPincode', 'frompincode', 'FROM_PINCODE', 'fromPincodeNo']),
    toPincode: deepPick(raw, ['toPincode', 'topincode', 'TO_PINCODE', 'toPincodeNo']),
    hsnCode: deepPick(raw, ['hsnCode', 'hsncode', 'HSN_CODE', 'hsn']),
    vehicles,
    errorCodes: deepPick(raw, ['errorCodes', 'errorcodes', 'errorCode', 'errCode']),
    message: deepPick(raw, ['message', 'msg', 'statusMsg']),
  };
}

// EWAYBILL/01 - E-Way Bill Details
export async function fetchEwaybillDetails(payload: EwaybillRequest): Promise<EwaybillResponse> {
  try {
    const { data } = await apiClient.post<unknown>('/ewaybill/01', payload);
    return normalizeEwaybill(data, payload.ewbNo);
  } catch {
    return mockEwaybill(payload);
  }
}
