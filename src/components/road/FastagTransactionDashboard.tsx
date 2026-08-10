import { motion } from 'framer-motion';
import {
  Tag,
  Hash,
  Car,
  MapPin,
  Clock,
  Route,
  TrendingUp,
  Navigation,
  Building2,
  Gauge,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar } from '@/components/ui/ActionBar';
import { TollPlazaMap, type MapPoint } from '@/components/ui/TollPlazaMap';
import type { FastagTransaction, FastagTransactionHistoryResponse } from '@/types';

const CHART_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

function parseGeocode(geocode: string): { lat: number; lng: number } | null {
  if (!geocode) return null;
  const parts = geocode.split(',').map((s) => parseFloat(s.trim()));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return { lat: parts[0], lng: parts[1] };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fastagStatusBadge(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'a' || s === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800 px-2.5 py-0.5 text-xs font-semibold">
        Active
      </span>
    );
  }
  if (s === 'i' || s === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 px-2.5 py-0.5 text-xs font-semibold">
        Inactive
      </span>
    );
  }
  if (s === 'b' || s === 'blocked') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border border-warning-200 dark:border-warning-800 px-2.5 py-0.5 text-xs font-semibold">
        Blocked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 px-2.5 py-0.5 text-xs font-semibold">
      {status || '—'}
    </span>
  );
}

function laneBadge(direction: string) {
  const d = (direction || '').toUpperCase();
  const dirName: Record<string, string> = { N: 'Northbound', S: 'Southbound', E: 'Eastbound', W: 'Westbound' };
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800 px-2.5 py-0.5 text-xs font-semibold">
      <Navigation className="h-3 w-3" />
      {d} · {dirName[d] ?? ''}
    </span>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  icon?: LucideIcon;
}

function DetailItem({ label, value, icon: Icon }: DetailItemProps) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value || '—'}</p>
    </div>
  );
}

interface FastagTransactionDashboardProps {
  data: FastagTransactionHistoryResponse;
  onRetry: () => void;
}

export function FastagTransactionDashboard({ data, onRetry }: FastagTransactionDashboardProps) {
  const transactions = data.transactions;
  const total = transactions.length;

  const sortedAsc = [...transactions].sort((a, b) => a.readerReadTime.localeCompare(b.readerReadTime));
  const sortedDesc = [...sortedAsc].reverse();
  const latest = sortedDesc[0];
  const latestPlaza = latest?.tollPlazaName ?? '—';
  const lastTransactionTime = latest?.readerReadTime ?? '—';

  const mapPoints: MapPoint[] = transactions
    .map((t) => ({ t, geo: parseGeocode(t.tollPlazaGeocode) }))
    .filter((x): x is { t: FastagTransaction; geo: { lat: number; lng: number } } => x.geo !== null)
    .map((x) => ({ lat: x.geo.lat, lng: x.geo.lng, label: x.t.tollPlazaName || 'Toll Plaza' }));

  const dailyCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    const date = (t.readerReadTime || '').slice(0, 10);
    if (date) dailyCounts[date] = (dailyCounts[date] ?? 0) + 1;
  });
  const lineData = Object.entries(dailyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  const dirCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    const d = t.laneDirection || 'Unknown';
    dirCounts[d] = (dirCounts[d] ?? 0) + 1;
  });
  const donutData = Object.entries(dirCounts).map(([name, value]) => ({ name, value }));

  const plazaCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    const p = t.tollPlazaName || 'Unknown';
    plazaCounts[p] = (plazaCounts[p] ?? 0) + 1;
  });
  const barData = Object.entries(plazaCounts)
    .map(([name, visits]) => ({ name, visits }))
    .sort((a, b) => b.visits - a.visits);

  const vehicleTypeCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    const v = t.vehicleType || 'Unknown';
    vehicleTypeCounts[v] = (vehicleTypeCounts[v] ?? 0) + 1;
  });
  const mostVisited = barData[0]?.name ?? '—';
  const mostDirection = donutData.reduce((max, d) => (d.value > (max?.value ?? 0) ? d : max), donutData[0])?.name ?? '—';
  const mostVehicleType = Object.entries(vehicleTypeCounts).reduce(
    (max, [name, value]) => (value > (max?.value ?? 0) ? { name, value } : max),
    { name: '', value: 0 },
  ).name || '—';

  const timelineSteps = [
    { label: 'Vehicle Entry', description: `${data.vehiclenumber} detected on network`, status: 'completed' as const },
    ...sortedAsc.slice(0, Math.min(3, sortedAsc.length)).map((t) => ({
      label: t.tollPlazaName || 'Toll Plaza',
      description: formatDate(t.readerReadTime),
      status: 'completed' as const,
    })),
    { label: 'Transaction Recorded', description: lastTransactionTime ? formatDate(lastTransactionTime) : '—', status: 'current' as const },
  ];

  const pdfSections = [
    [
      { label: 'Vehicle Number', value: data.vehiclenumber },
      { label: 'Vehicle Class', value: data.vehicleClass },
      { label: 'FASTag Status', value: data.fastagStatus },
      { label: 'Total Transactions', value: String(total) },
    ],
    [
      { label: 'Latest Toll Plaza', value: latestPlaza },
      { label: 'Last Transaction Time', value: lastTransactionTime },
      { label: 'Tag ID', value: data.tagId },
      { label: 'TID', value: data.tid },
    ],
  ];

  const excelSheets = [
    {
      name: 'Summary',
      rows: [
        ['Field', 'Value'] as (string | number)[],
        ['Vehicle Number', data.vehiclenumber],
        ['Vehicle Class', data.vehicleClass],
        ['FASTag Status', data.fastagStatus],
        ['Total Transactions', total],
        ['Latest Toll Plaza', latestPlaza],
        ['Last Transaction Time', lastTransactionTime],
      ],
    },
    {
      name: 'Transactions',
      rows: [
        ['Transaction Time', 'Toll Plaza', 'Lane Direction', 'Vehicle Type', 'Sequence Number', 'Geo Coordinates'] as (string | number)[],
        ...sortedDesc.map((t) => [t.readerReadTime, t.tollPlazaName, t.laneDirection, t.vehicleType, t.seqNo, t.tollPlazaGeocode]),
      ],
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
        <ActionBar data={data} pdfTitle="FASTag Transaction History" pdfSections={pdfSections} excelSheets={excelSheets} />
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Total Transactions" value={total} icon={Tag} accent="primary" delay={0.05} />
        <KpiCard label="Vehicle Number" value={data.vehiclenumber} icon={Hash} accent="accent" delay={0.1} />
        <KpiCard label="Vehicle Class" value={data.vehicleClass} icon={Car} accent="warning" delay={0.15} />
        <KpiCard label="Latest Toll Plaza" value={latestPlaza} icon={MapPin} accent="primary" delay={0.2} />
        <KpiCard label="Last Transaction Time" value={lastTransactionTime} icon={Clock} accent="warning" delay={0.25} />
      </div>

      {/* Vehicle Information */}
      <Card delay={0.1}>
        <CardHeader title="Vehicle Information" subtitle="FASTag & vehicle summary" icon={<Car className="h-5 w-5" />} />
        <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
          <DetailItem label="Vehicle Registration Number" value={data.vehiclenumber} icon={Hash} />
          <DetailItem label="Vehicle Class" value={data.vehicleClass} icon={Car} />
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
              <Tag className="h-3.5 w-3.5" /> FASTag Status
            </p>
            {fastagStatusBadge(data.fastagStatus)}
          </div>
          <DetailItem label="Total Transactions" value={String(total)} icon={Receipt} />
        </div>
      </Card>

      {/* Transaction History Table */}
      <Card delay={0.15}>
        <CardHeader
          title="Transaction History"
          subtitle={`${total} toll transaction(s)`}
          icon={<Receipt className="h-5 w-5" />}
          action={<span className="rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800 px-3 py-1 text-xs font-semibold">{total}</span>}
        />
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Transaction Time</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Toll Plaza</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Lane Direction</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Vehicle Type</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Sequence Number</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Geo Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {sortedDesc.map((t, i) => (
                  <motion.tr
                    key={t.seqNo || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(t.readerReadTime)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100">
                        <MapPin className="h-3.5 w-3.5 text-primary-500" />
                        {t.tollPlazaName || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">{laneBadge(t.laneDirection)}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300">
                        {t.vehicleType || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">{t.seqNo || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">{t.tollPlazaGeocode || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Interactive Map */}
      <Card delay={0.2}>
        <CardHeader title="Interactive Toll Map" subtitle="Toll plaza locations visited" icon={<Route className="h-5 w-5" />} />
        <div className="p-5">
          {mapPoints.length > 0 ? (
            <TollPlazaMap points={mapPoints} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Route className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mb-2" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Geo coordinates not available for these transactions
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Timeline */}
      <Card delay={0.25}>
        <CardHeader title="Transaction Timeline" subtitle="Chronological toll journey" icon={<Clock className="h-5 w-5" />} />
        <div className="p-6">
          <Timeline steps={timelineSteps} />
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-accent-500" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary-500" /> Current</span>
          </div>
        </div>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card delay={0.3}>
          <CardHeader title="Transactions Over Time" subtitle="Daily transaction volume" icon={<TrendingUp className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="count" name="Transactions" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.35}>
          <CardHeader title="Lane Direction" subtitle="Direction distribution" icon={<Navigation className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.4}>
          <CardHeader title="Toll Plaza Visits" subtitle="Most frequented plazas" icon={<Building2 className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }} />
                <Bar dataKey="visits" name="Visits" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Analytics summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsMiniCard icon={Tag} label="Daily Transactions" value={total} color="primary" delay={0.45} />
        <AnalyticsMiniCard icon={Building2} label="Most Visited Toll Plaza" value={mostVisited} color="accent" delay={0.5} />
        <AnalyticsMiniCard icon={Navigation} label="Top Lane Direction" value={mostDirection} color="warning" delay={0.55} />
        <AnalyticsMiniCard icon={Gauge} label="Vehicle Type" value={mostVehicleType} color="primary" delay={0.6} />
      </div>
    </motion.div>
  );
}

function AnalyticsMiniCard({
  icon: Icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'primary' | 'accent' | 'warning' | 'error';
  delay?: number;
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-400',
    error: 'bg-error-50 text-error-600 dark:bg-error-950/40 dark:text-error-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="card p-4 card-hover"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
    </motion.div>
  );
}
