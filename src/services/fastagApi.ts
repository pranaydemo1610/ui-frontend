import { apiClient } from './apiClient';
import type {
  FastagDetailsRequest,
  FastagDetailsResponse,
  FastagTag,
  FastagTransaction,
  FastagTransactionHistoryRequest,
  FastagTransactionHistoryResponse,
} from '@/types';

// ULIP FASTag responses are heavily nested (result → vehltxnList → txn / tagList) and
// vary between the raw gateway response and normalized gateway shapes. These helpers
// recursively normalise the payload into the dashboard contract used by the UI.

function asRecord(obj: unknown): Record<string, unknown> {
  return obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : {};
}

function pick(obj: unknown, keys: string[]): string {
  const r = asRecord(obj);
  for (const k of keys) {
    const v = r[k];
    if (v !== undefined && v !== null && v !== '') return String(v);
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

const isTransaction = (o: Record<string, unknown>) =>
  Object.prototype.hasOwnProperty.call(o, 'tollPlazaName') ||
  Object.prototype.hasOwnProperty.call(o, 'tollplazaname') ||
  Object.prototype.hasOwnProperty.call(o, 'readerReadTime') ||
  Object.prototype.hasOwnProperty.call(o, 'readerreadtime') ||
  Object.prototype.hasOwnProperty.call(o, 'tollPlazaGeocode') ||
  Object.prototype.hasOwnProperty.call(o, 'tollplazageocode');

const isTag = (o: Record<string, unknown>) =>
  Object.prototype.hasOwnProperty.call(o, 'TAGID') ||
  Object.prototype.hasOwnProperty.call(o, 'tagId') ||
  Object.prototype.hasOwnProperty.call(o, 'TID') ||
  Object.prototype.hasOwnProperty.call(o, 'tagDetails') ||
  (Object.prototype.hasOwnProperty.call(o, 'TAGSTATUS') && Object.prototype.hasOwnProperty.call(o, 'BANKID'));

function mapTransaction(t: unknown): FastagTransaction {
  const r = asRecord(t);
  return {
    readerReadTime: pick(r, ['readerReadTime', 'readerreadtime', 'transactionTime', 'txnTime', 'dateTime']),
    seqNo: pick(r, ['seqNo', 'seqno', 'sequenceNumber', 'txnId', 'transactionId']),
    laneDirection: pick(r, ['laneDirection', 'lanedirection', 'direction']),
    tollPlazaGeocode: pick(r, ['tollPlazaGeocode', 'tollplazageocode', 'geocode', 'geoCode', 'geolocation']),
    tollPlazaName: pick(r, ['tollPlazaName', 'tollplazaname', 'plazaName', 'plaza_name', 'name']),
    vehicleType: pick(r, ['vehicleType', 'vehicletype', 'vehicleClass', 'vehicleclass']),
    vehicleRegNo: pick(r, ['vehicleRegNo', 'vehicleregno', 'vehicleNumber', 'vehiclenumber']),
  };
}

function mapTag(t: unknown): FastagTag {
  const r = asRecord(t);
  return {
    tagId: pick(r, ['TAGID', 'tagId', 'tagid']),
    tid: pick(r, ['TID', 'tid']),
    tagStatus: pick(r, ['TAGSTATUS', 'tagStatus', 'tagstatus', 'status']),
    issueDate: pick(r, ['ISSUEDATE', 'issueDate', 'issuedate']),
    bankId: pick(r, ['BANKID', 'bankId', 'bankid']),
    excCode: pick(r, ['EXCCODE', 'excCode', 'exccode']),
    vehicleClass: pick(r, ['VEHICLECLASS', 'vehicleClass', 'vehicleclass']),
    commercialVehicle: pick(r, ['COMVEHICLE', 'commercialVehicle', 'comvehicle']),
    regNumber: pick(r, ['REGNUMBER', 'regNumber', 'regnumber']),
  };
}

function isFailure(raw: unknown): boolean {
  const status = deepPick(raw, ['status', 'result', 'responseStatus']);
  const errCode = deepPick(raw, ['errCode', 'errcode', 'respCode']);
  const message = deepPick(raw, ['message', 'msg', 'statusMsg']);
  return (
    /fail/i.test(status) ||
    errCode === '740' ||
    /not found/i.test(message) ||
    /no records/i.test(message)
  );
}

export function normalizeFastagTransactionHistory(
  raw: unknown,
  vehiclenumber: string,
): FastagTransactionHistoryResponse {
  const txnItems = collectArrays(raw, isTransaction);
  const transactions = txnItems.map(mapTransaction);

  return {
    vehiclenumber: deepPick(raw, ['vehiclenumber', 'vehicleNumber', 'regNumber', 'REGNUMBER', 'vehicleregno']) || vehiclenumber,
    vehicleClass: deepPick(raw, ['vehicleClass', 'vehicleclass', 'VEHICLECLASS', 'class']) || (transactions[0]?.vehicleType ?? ''),
    fastagStatus: deepPick(raw, ['tagStatus', 'tagstatus', 'TAGSTATUS', 'status']),
    tagId: deepPick(raw, ['tagId', 'tagid', 'TAGID']),
    tid: deepPick(raw, ['tid', 'TID']),
    transactions,
    result: deepPick(raw, ['result', 'status']),
    errCode: deepPick(raw, ['errCode', 'errcode', 'respCode', 'code']),
    message: deepPick(raw, ['message', 'msg', 'statusMsg']),
  };
}

export function normalizeFastagDetails(
  raw: unknown,
  request: FastagDetailsRequest,
): FastagDetailsResponse {
  const tagItems = collectArrays(raw, isTag);
  const tags = tagItems.map(mapTag).filter((t) => t.tagId || t.tid);

  return {
    regNumber: deepPick(raw, ['regNumber', 'regnumber', 'REGNUMBER', 'vehicleNumber', 'vehiclenumber']) || request.vehiclenumber,
    vehicleClass: deepPick(raw, ['vehicleClass', 'vehicleclass', 'VEHICLECLASS']) || tags[0]?.vehicleClass || '',
    commercialVehicle: deepPick(raw, ['commercialVehicle', 'comvehicle', 'COMVEHICLE']) || tags[0]?.commercialVehicle || '',
    tags,
    result: deepPick(raw, ['result', 'status']),
    errCode: deepPick(raw, ['errCode', 'errcode', 'respCode', 'code']),
    message: deepPick(raw, ['message', 'msg', 'statusMsg']),
  };
}

// FASTAG/01 - FASTag Transaction History
export async function fetchFastagTransactionHistory(
  payload: FastagTransactionHistoryRequest,
): Promise<FastagTransactionHistoryResponse> {
  const { data } = await apiClient.post<unknown>('/fastag/01', payload);
  return normalizeFastagTransactionHistory(data, payload.vehiclenumber);
}

// FASTAG/02 - FASTag Vehicle & Tag Details
export async function fetchFastagDetails(
  payload: FastagDetailsRequest,
): Promise<FastagDetailsResponse> {
  const { data } = await apiClient.post<unknown>('/fastag/02', payload);
  return normalizeFastagDetails(data, payload);
}

export { isFailure };
