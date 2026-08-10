import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, User, Hash, MapPin, Building2, Car, CircleCheck as CheckCircle2, Circle as XCircle, TriangleAlert as AlertTriangle, Clock, RefreshCw, IndianRupee, ChevronDown, ChevronRight, Gavel, Receipt, TrendingUp, CalendarClock, FileWarning } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar } from '@/components/ui/ActionBar';
import { formatINR } from '@/utils/exportUtils';
import type { EchallanResponse, EchallanRecord } from '@/types';

function challanStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (s.includes('pending')) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border border-warning-200 dark:border-warning-800 px-2.5 py-0.5 text-xs font-semibold">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  }
  if (s.includes('disposed') || s.includes('paid')) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800 px-2.5 py-0.5 text-xs font-semibold">
        <CheckCircle2 className="h-3 w-3" /> Disposed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 px-2.5 py-0.5 text-xs font-semibold">
      {status}
    </span>
  );
}

function parseAmount(value: string): number {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

interface EchallanDashboardProps {
  data: EchallanResponse;
  onRetry: () => void;
}

export function EchallanDashboard({ data, onRetry }: EchallanDashboardProps) {
  const pending = data.pending_data;
  const disposed = data.disposed_data;
  const totalChallans = pending.length + disposed.length;

  const pendingFine = pending.reduce((sum, r) => sum + parseAmount(r.fine_imposed), 0);
  const disposedFine = disposed.reduce((sum, r) => sum + parseAmount(r.fine_imposed), 0);
  const totalFine = pendingFine + disposedFine;

  const allDates = [...pending, ...disposed]
    .map((r) => r.challan_date_time)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));
  const latestDate = allDates[0] ?? '—';

  const donutData = [
    { name: 'Pending', value: pending.length, color: '#f59e0b' },
    { name: 'Disposed', value: disposed.length, color: '#22c55e' },
  ];
  const barData = [
    { name: 'Pending', amount: pendingFine },
    { name: 'Disposed', amount: disposedFine },
  ];

  const pdfSections: { label: string; value: string }[][] = [
    [
      { label: 'Vehicle Number', value: data.vehicle_number },
      { label: 'Owner Name', value: data.owner_name },
      { label: 'State', value: data.state_code },
      { label: 'Department', value: data.department },
      { label: 'Driver Name', value: data.driver_name },
    ],
    [
      { label: 'Total Challans', value: String(totalChallans) },
      { label: 'Pending Challans', value: String(pending.length) },
      { label: 'Disposed Challans', value: String(disposed.length) },
      { label: 'Total Fine', value: formatINR(totalFine) },
      { label: 'Pending Fine', value: formatINR(pendingFine) },
      { label: 'Disposed Fine', value: formatINR(disposedFine) },
    ],
  ];

  const excelSheets = [
    {
      name: 'Summary',
      rows: [
        ['Field', 'Value'] as (string | number)[],
        ['Vehicle Number', data.vehicle_number],
        ['Owner Name', data.owner_name],
        ['State', data.state_code],
        ['Department', data.department],
        ['Driver Name', data.driver_name],
        ['Total Challans', totalChallans],
        ['Pending Challans', pending.length],
        ['Disposed Challans', disposed.length],
        ['Total Fine', formatINR(totalFine)],
        ['Pending Fine', formatINR(pendingFine)],
        ['Disposed Fine', formatINR(disposedFine)],
      ],
    },
    {
      name: 'Pending Challans',
      rows: [
        ['Challan No', 'Date & Time', 'Place', 'District', 'Fine', 'Status', 'Remark'] as (string | number)[],
        ...pending.map((r) => [r.challan_no, r.challan_date_time, r.challan_place, r.rto_distric_name, r.fine_imposed, r.challan_status, r.remark]),
      ],
    },
    {
      name: 'Disposed Challans',
      rows: [
        ['Challan No', 'Date & Time', 'Fine', 'Receipt No', 'Remark'] as (string | number)[],
        ...disposed.map((r) => [r.challan_no, r.challan_date_time, r.fine_imposed, r.receipt_no ?? '—', r.remark]),
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
        <ActionBar data={data} pdfTitle="Vehicle E-Challan Report" pdfSections={pdfSections} excelSheets={excelSheets} />
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Challans" value={totalChallans} icon={ScrollText} accent="primary" delay={0.05} />
        <KpiCard label="Pending Challans" value={pending.length} icon={Clock} accent="warning" delay={0.1} />
        <KpiCard label="Disposed Challans" value={disposed.length} icon={CheckCircle2} accent="accent" delay={0.15} />
        <KpiCard label="Total Fine" value={formatINR(totalFine)} icon={IndianRupee} accent="primary" delay={0.2} />
        <KpiCard label="Pending Fine" value={formatINR(pendingFine)} icon={AlertTriangle} accent="warning" delay={0.25} />
        <KpiCard label="Disposed Fine" value={formatINR(disposedFine)} icon={CheckCircle2} accent="accent" delay={0.3} />
      </div>

      {/* Vehicle Information */}
      <Card delay={0.1}>
        <CardHeader title="Vehicle Information" subtitle="Registered owner and department details" icon={<Car className="h-5 w-5" />} />
        <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-3 xl:grid-cols-5">
          <DetailItem label="Owner Name" value={data.owner_name} icon={User} />
          <DetailItem label="Vehicle Number" value={data.vehicle_number} icon={Hash} />
          <DetailItem label="State" value={data.state_code} icon={MapPin} />
          <DetailItem label="Department" value={data.department} icon={Building2} />
          <DetailItem label="Driver Name" value={data.driver_name} icon={User} />
        </div>
      </Card>

      {/* Pending Challans Table */}
      <Card delay={0.15}>
        <CardHeader
          title="Pending Challans"
          subtitle={`${pending.length} pending challan(s)`}
          icon={<Clock className="h-5 w-5" />}
          action={<span className="rounded-full bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border border-warning-200 dark:border-warning-800 px-3 py-1 text-xs font-semibold">{pending.length}</span>}
        />
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-accent-400 mb-2" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No pending challans</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Status</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Challan No</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Date & Time</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Location</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">District</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Department</th>
                  <th className="text-right font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Fine Amount</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Court Status</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Remark</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r, i) => (
                  <PendingRow key={i} record={r} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Disposed Challans Table */}
      <Card delay={0.2}>
        <CardHeader
          title="Disposed Challans"
          subtitle={`${disposed.length} disposed challan(s)`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          action={<span className="rounded-full bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800 px-3 py-1 text-xs font-semibold">{disposed.length}</span>}
        />
        {disposed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No disposed challans</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800">
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Status</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Challan No</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Date</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Department</th>
                  <th className="text-right font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Fine Paid</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Receipt Number</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Remark</th>
                  <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disposed.map((r, i) => (
                  <DisposedRow key={i} record={r} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary Analytics with charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card delay={0.25}>
          <CardHeader title="Pending vs Disposed" subtitle="Challan distribution" icon={<TrendingUp className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.3}>
          <CardHeader title="Fine Amount by Status" subtitle="Pending vs disposed fine" icon={<IndianRupee className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }}
                  formatter={(v) => formatINR(Number(v))}
                />
                <Bar dataKey="amount" name="Fine Amount" radius={[6, 6, 0, 0]}>
                  <Cell fill="#f59e0b" />
                  <Cell fill="#22c55e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Analytics summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AnalyticsMiniCard icon={IndianRupee} label="Total Pending Amount" value={formatINR(pendingFine)} color="warning" delay={0.35} />
        <AnalyticsMiniCard icon={IndianRupee} label="Total Paid Amount" value={formatINR(disposedFine)} color="accent" delay={0.4} />
        <AnalyticsMiniCard icon={Clock} label="Pending Challans" value={pending.length} color="warning" delay={0.45} />
        <AnalyticsMiniCard icon={CheckCircle2} label="Disposed Challans" value={disposed.length} color="accent" delay={0.5} />
        <AnalyticsMiniCard icon={CalendarClock} label="Latest Challan Date" value={formatDate(latestDate)} color="primary" delay={0.55} />
      </div>

      {/* Timeline */}
      <Card delay={0.4}>
        <CardHeader title="Challan Activity Timeline" subtitle="Latest challan status flow" icon={<ScrollText className="h-5 w-5" />} />
        <div className="p-6">
          <Timeline
            steps={[
              { label: 'Issued', description: 'Challan issued by traffic authority', status: 'completed' },
              { label: 'Pending', description: 'Awaiting payment or court hearing', status: pending.length > 0 ? 'current' : 'completed' },
              { label: 'Paid', description: 'Fine amount paid', status: disposed.length > 0 ? 'completed' : 'pending' },
              { label: 'Disposed', description: 'Challan closed and settled', status: disposed.length > 0 ? 'completed' : 'pending' },
            ]}
          />
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

function PendingRow({ record, index }: { record: EchallanRecord; index: number }) {
  const [open, setOpen] = useState(false);
  const offences = record.offence_details ?? [];
  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: Math.min(index * 0.05, 0.3) }}
        className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <td className="px-5 py-3">{challanStatusBadge(record.challan_status)}</td>
        <td className="px-5 py-3 font-mono text-xs font-medium text-neutral-900 dark:text-neutral-100">{record.challan_no}</td>
        <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{record.challan_date_time}</td>
        <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{record.challan_place}</td>
        <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{record.rto_distric_name}</td>
        <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{record.department ?? '—'}</td>
        <td className="px-5 py-3 text-right font-semibold text-primary-600 dark:text-primary-400">{formatINR(record.fine_imposed)}</td>
        <td className="px-5 py-3">
          {record.court_status ? (
            <span className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300">
              <Gavel className="h-3.5 w-3.5 text-neutral-400" />
              {record.court_status}
            </span>
          ) : '—'}
        </td>
        <td className="px-5 py-3 text-neutral-500 dark:text-neutral-400 max-w-[180px] truncate" title={record.remark}>{record.remark || '—'}</td>
        <td className="px-5 py-3">
          {offences.length > 0 ? (
            <button
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
            >
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              View
            </button>
          ) : <span className="text-xs text-neutral-400">—</span>}
        </td>
      </motion.tr>
      <AnimatePresence>
        {open && offences.length > 0 && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={10} className="px-5 pb-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {offences.map((off, i) => (
                  <div key={i} className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-mono">
                        {off.act}
                      </span>
                      <FileWarning className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">{off.name}</p>
                  </div>
                ))}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

function DisposedRow({ record, index }: { record: EchallanRecord; index: number }) {
  const [open, setOpen] = useState(false);
  const offences = record.offence_details ?? [];
  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: Math.min(index * 0.05, 0.3) }}
        className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <td className="px-5 py-3">{challanStatusBadge(record.challan_status)}</td>
        <td className="px-5 py-3 font-mono text-xs font-medium text-neutral-900 dark:text-neutral-100">{record.challan_no}</td>
        <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{record.challan_date_time}</td>
        <td className="px-5 py-3 text-neutral-600 dark:text-neutral-300">{record.department ?? '—'}</td>
        <td className="px-5 py-3 text-right font-semibold text-accent-600 dark:text-accent-400">{formatINR(record.fine_imposed)}</td>
        <td className="px-5 py-3">
          {record.receipt_no ? (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-neutral-600 dark:text-neutral-300">
              <Receipt className="h-3.5 w-3.5 text-accent-500" />
              {record.receipt_no}
            </span>
          ) : '—'}
        </td>
        <td className="px-5 py-3 text-neutral-500 dark:text-neutral-400 max-w-[180px] truncate" title={record.remark}>{record.remark || '—'}</td>
        <td className="px-5 py-3">
          {offences.length > 0 ? (
            <button
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-lg bg-accent-50 dark:bg-accent-950/40 px-2 py-1 text-xs font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
            >
              {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              View
            </button>
          ) : <span className="text-xs text-neutral-400">—</span>}
        </td>
      </motion.tr>
      <AnimatePresence>
        {open && offences.length > 0 && (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={8} className="px-5 pb-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {offences.map((off, i) => (
                  <div key={i} className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 font-mono">
                        {off.act}
                      </span>
                      <FileWarning className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                    <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">{off.name}</p>
                  </div>
                ))}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
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
