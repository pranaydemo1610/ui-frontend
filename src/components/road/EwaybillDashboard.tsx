import { motion } from 'framer-motion';
import {
  FileCheck,
  Hash,
  CalendarDays,
  Clock,
  MapPin,
  Package,
  Route,
  ArrowDown,
  TrendingUp,
  Truck,
  TrainFront,
  Plane,
  Ship,
  RefreshCw,
  Activity,
  CircleCheck as CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar } from '@/components/ui/ActionBar';
import type { EwaybillResponse, EwaybillVehicle } from '@/types';

const CHART_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

function parseDateTime(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?$/i);
  if (m) {
    let h = parseInt(m[4], 10);
    const min = parseInt(m[5], 10);
    const sec = m[6] ? parseInt(m[6], 10) : 0;
    const ampm = (m[7] || '').toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), h, min, sec);
  }
  return null;
}

function formatDate(s: string): string {
  const d = parseDateTime(s);
  if (!d) return s || '—';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function daysRemaining(validUpto: string): number | null {
  const d = parseDateTime(validUpto);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function transportModeInfo(mode: string): { label: string; icon: LucideIcon } {
  const m = (mode || '').toLowerCase();
  if (m === '1' || m.includes('road')) return { label: 'Road', icon: Truck };
  if (m === '2' || m.includes('rail')) return { label: 'Rail', icon: TrainFront };
  if (m === '3' || m.includes('air')) return { label: 'Air', icon: Plane };
  if (m === '4' || m.includes('water') || m.includes('ship')) return { label: 'Water', icon: Ship };
  return { label: mode || 'Unknown', icon: Truck };
}

function ewaybillStatusBadge(status: string, validUpto: string) {
  const s = (status || '').toUpperCase();
  const days = daysRemaining(validUpto);

  if (s === 'ACT') {
    if (days !== null && days < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-300 border border-error-200 dark:border-error-800 px-3 py-1 text-xs font-semibold">
          Expired
        </span>
      );
    }
    if (days !== null && days <= 7) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border border-warning-200 dark:border-warning-800 px-3 py-1 text-xs font-semibold">
          Active · Expiring Soon
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800 px-3 py-1 text-xs font-semibold">
        <CheckCircle2 className="h-3 w-3" /> Active
      </span>
    );
  }

  if (/expired|invalid/i.test(s)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-300 border border-error-200 dark:border-error-800 px-3 py-1 text-xs font-semibold">
        {s}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 px-3 py-1 text-xs font-semibold">
      {status || '—'}
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

function TransportModeBadge({ mode }: { mode: string }) {
  const { label, icon: Icon } = transportModeInfo(mode);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800 px-2.5 py-0.5 text-xs font-semibold">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

interface EwaybillDashboardProps {
  data: EwaybillResponse;
  onRetry: () => void;
}

export function EwaybillDashboard({ data, onRetry }: EwaybillDashboardProps) {
  const vehicles = data.vehicles;
  const totalVehicles = vehicles.length;

  const days = daysRemaining(data.validUpto);
  const isExpired = days !== null && days < 0;
  const expiringSoon = days !== null && !isExpired && days <= 7;

  const primaryMode = vehicles[0]?.transMode ?? '';
  const modeLabel = primaryMode ? transportModeInfo(primaryMode).label : '—';

  const dateCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    const date = (v.enteredDate || '').slice(0, 10);
    if (date) dateCounts[date] = (dateCounts[date] ?? 0) + 1;
  });
  const movementData = Object.entries(dateCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  const modeCounts: Record<string, number> = {};
  vehicles.forEach((v) => {
    const label = transportModeInfo(v.transMode).label;
    modeCounts[label] = (modeCounts[label] ?? 0) + 1;
  });

  const steps = [
    { label: 'E-Way Bill Generated', description: formatDate(data.ewayBillDate), status: 'completed' as const },
    {
      label: 'Vehicle Assigned',
      description: totalVehicles > 0 ? `${totalVehicles} vehicle(s) assigned` : 'No vehicle assigned yet',
      status: totalVehicles > 0 ? ('completed' as const) : ('pending' as const),
    },
    {
      label: 'Transport Started',
      description: `Mode: ${modeLabel}`,
      status: totalVehicles > 0 ? ('completed' as const) : ('current' as const),
    },
    {
      label: 'Valid Until',
      description: formatDate(data.validUpto),
      status: isExpired ? ('current' as const) : ('pending' as const),
    },
  ];

  const pdfSections = [
    [
      { label: 'E-Way Bill Number', value: data.ewbNo },
      { label: 'Status', value: data.status },
      { label: 'Generated Date', value: data.ewayBillDate },
      { label: 'Valid Until', value: data.validUpto },
    ],
    [
      { label: 'From Pincode', value: data.fromPincode },
      { label: 'To Pincode', value: data.toPincode },
      { label: 'HSN Code', value: data.hsnCode },
      { label: 'Total Vehicles', value: String(totalVehicles) },
    ],
  ];

  const excelSheets = [
    {
      name: 'Summary',
      rows: [
        ['Field', 'Value'] as (string | number)[],
        ['E-Way Bill Number', data.ewbNo],
        ['Status', data.status],
        ['Generated Date', data.ewayBillDate],
        ['Valid Until', data.validUpto],
        ['From Pincode', data.fromPincode],
        ['To Pincode', data.toPincode],
        ['HSN Code', data.hsnCode],
        ['Total Vehicles', totalVehicles],
      ],
    },
    {
      name: 'Vehicles',
      rows: [
        ['Vehicle Number', 'Entered Date', 'Transport Mode'] as (string | number)[],
        ...vehicles.map((v) => [v.vehicleNumber, v.enteredDate, transportModeInfo(v.transMode).label]),
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
        <ActionBar data={data} pdfTitle="E-Way Bill Details" pdfSections={pdfSections} excelSheets={excelSheets} />
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="E-Way Bill Number" value={data.ewbNo} icon={Hash} accent="primary" delay={0.05} />
        <KpiCard label="Status" value={data.status || '—'} icon={FileCheck} accent="accent" delay={0.1} />
        <KpiCard label="Generated Date" value={formatDate(data.ewayBillDate)} icon={CalendarDays} accent="warning" delay={0.15} />
        <KpiCard label="Valid Until" value={formatDate(data.validUpto)} icon={Clock} accent="warning" delay={0.2} />
      </div>

      {/* Shipment Summary */}
      <Card delay={0.1}>
        <CardHeader title="Shipment Summary" subtitle="E-Way Bill shipment information" icon={<Package className="h-5 w-5" />} />
        <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-5">
          <DetailItem label="From Pincode" value={data.fromPincode} icon={MapPin} />
          <DetailItem label="To Pincode" value={data.toPincode} icon={MapPin} />
          <DetailItem label="HSN Code" value={data.hsnCode} icon={Hash} />
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
              <Truck className="h-3.5 w-3.5" /> Transport Mode
            </p>
            <TransportModeBadge mode={primaryMode} />
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
              <Activity className="h-3.5 w-3.5" /> Current Status
            </p>
            {ewaybillStatusBadge(data.status, data.validUpto)}
          </div>
        </div>
      </Card>

      {/* Vehicle Information */}
      <Card delay={0.15}>
        <CardHeader
          title="Vehicle Information"
          subtitle={`${totalVehicles} vehicle(s) registered`}
          icon={<Truck className="h-5 w-5" />}
          action={<span className="rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800 px-3 py-1 text-xs font-semibold">{totalVehicles}</span>}
        />
        {totalVehicles === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Truck className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No vehicles registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Vehicle Number</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Entered Date</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Transport Mode</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v: EwaybillVehicle, i: number) => (
                  <motion.tr
                    key={v.vehicleNumber || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        <Truck className="h-3.5 w-3.5 text-primary-500" />
                        {v.vehicleNumber || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{formatDate(v.enteredDate)}</td>
                    <td className="px-5 py-3"><TransportModeBadge mode={v.transMode} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Route Information */}
      <Card delay={0.2}>
        <CardHeader title="Route Information" subtitle="Shipment flow" icon={<Route className="h-5 w-5" />} />
        <div className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-10">
            <div className="w-full max-w-[280px] rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20 p-5 text-center">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Origin Pincode</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary-600 dark:text-primary-400">{data.fromPincode || '—'}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <ArrowDown className="h-6 w-6 text-primary-500 sm:rotate-0" />
            </div>
            <div className="w-full max-w-[280px] rounded-2xl border border-accent-200 dark:border-accent-800 bg-accent-50/50 dark:bg-accent-950/20 p-5 text-center">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Destination Pincode</p>
              <p className="mt-1 font-display text-2xl font-bold text-accent-600 dark:text-accent-400">{data.toPincode || '—'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Vehicle movement chart (only when multiple vehicles) */}
      {movementData.length > 1 && (
        <Card delay={0.25}>
          <CardHeader title="Vehicle Movement" subtitle="Vehicle entries over time" icon={<TrendingUp className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="count" name="Vehicles Entered" radius={[6, 6, 0, 0]}>
                  {movementData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Analytics summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsMiniCard icon={Truck} label="Total Vehicles" value={totalVehicles} color="primary" delay={0.3} />
        <AnalyticsMiniCard icon={FileCheck} label="Transport Mode" value={modeLabel} color="accent" delay={0.35} />
        <AnalyticsMiniCard
          icon={Activity}
          label="Validity Status"
          value={isExpired ? 'Expired' : expiringSoon ? 'Expiring Soon' : 'Active'}
          color={isExpired ? 'error' : expiringSoon ? 'warning' : 'accent'}
          delay={0.4}
        />
        <AnalyticsMiniCard
          icon={Clock}
          label="Days Remaining Until Expiry"
          value={days !== null ? `${days} day(s)` : '—'}
          color={isExpired ? 'error' : expiringSoon ? 'warning' : 'primary'}
          delay={0.45}
        />
      </div>

      {/* Timeline */}
      <Card delay={0.4}>
        <CardHeader title="E-Way Bill Timeline" subtitle="Shipment lifecycle progress" icon={<Clock className="h-5 w-5" />} />
        <div className="p-6">
          <Timeline steps={steps} />
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-accent-500" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary-500" /> Current</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-600" /> Pending</span>
          </div>
        </div>
      </Card>
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
