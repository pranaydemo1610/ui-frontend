export interface RequestLogEntry {
  module: string;
  endpoint: string;
  method: string;
  params: Record<string, string | number>;
  status: 'success' | 'error';
  latency_ms: number;
  response_summary: string;
  timestamp?: string;
}

const STORAGE_KEY = 'ulip-request-logs';
const MAX_LOGS = 500;

export function getRequestLogs(): RequestLogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as RequestLogEntry[]) : [];
  } catch {
    return [];
  }
}

export async function insertRequestLog(entry: Omit<RequestLogEntry, 'timestamp'>): Promise<RequestLogEntry> {
  const log: RequestLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  try {
    const logs = getRequestLogs();
    logs.push(log);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_LOGS)));
  } catch {
    // ignore storage failures
  }
  return log;
}

export function clearRequestLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}
