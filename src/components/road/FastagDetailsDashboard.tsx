import { motion } from 'framer-motion';
import {
  Tag,
  Hash,
  Car,
  CreditCard,
  Building2,
  CalendarDays,
  ShieldCheck,
  CircleCheck as CheckCircle2,
  MinusCircle,
  TriangleAlert as AlertTriangle,
  Circle,
  RefreshCw,
  TrendingUp,
  Landmark,
  BadgeCheck,
} from 'lucide-react';
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
  LineChart,
  Line,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar } from '@/components/ui/ActionBar';
import type { FastagDetailsResponse, FastagTag } from '@/types';

const CHART_COLORS = ['#22c55e', '#94a3b8', '#f59e0b', '#2563eb', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

type TagStatus = 'active' | 'inactive' | 'blocked' | 'unknown';

function classifyTagStatus(status: string): TagStatus {
  const s = (status || '').toLowerCase();
  if (s === 'a' || s === 'active' || s === 'issued' || s === 'y') return 'active';
  if (s === 'i' || s === 'inactive' || s === 'n') return 'inactive';
  if (s === 'b' || s === 'blocked' || s === 'suspended' || s === 'd') return 'blocked';
  return 'unknown';
}

function tagStatusBadge(status: string) {
  const cls = classifyTagStatus(status);
  const map: Record<TagStatus, string> = {
    active: 'bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border-accent-200 dark:border-accent-800',
    inactive: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
    blocked: 'bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border-warning-200 dark:border-warning-800',
    unknown: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
  };
  const label: Record<TagStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    blocked: 'Blocked',
    unknown: status || 'Unknown',
  };
  const Icon: Record<TagStatus, LucideIcon> = {
    active: CheckCircle2,
    inactive: MinusCircle,
    blocked: AlertTriangle,
    unknown: Circle,
  };
  const StatusIcon = Icon[cls];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[cls]}`}>
      <StatusIcon className="h-3 w-3" />
      {label[cls]}
    </span>
  );
}

function isCommercial(value: string): boolean {
  const s = (value || '').toUpperCase();
  return s === 'T' || s === 'Y' || s === 'TRUE' || s === 'YES' || /commercial/i.test(s);
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

interface FastagDetailsDashboardProps {
  data: FastagDetailsResponse;
  onRetry: () => void;
}

export function FastagDetailsDashboard({ data, onRetry }: FastagDetailsDashboardProps) {
  const tags = data.tags;
  const totalTags = tags.length;

  const activeCount = tags.filter((t) => classifyTagStatus(t.tagStatus) === 'active').length;
  const inactiveCount = tags.filter((t) => classifyTagStatus(t.tagStatus) === 'inactive').length;
  const blockedCount = tags.filter((t) => classifyTagStatus(t.tagStatus) === 'blocked').length;
  const unknownCount = totalTags - activeCount - inactiveCount - blockedCount;

  const bankIds = new Set(tags.map((t) => t.bankId).filter(Boolean));
  const issuedBanks = bankIds.size;

  const commercialCount = tags.filter((t) => isCommercial(t.commercialVehicle ?? data.commercialVehicle)).length;
  const nonCommercialCount = totalTags - commercialCount;

  const bankCounts: Record<string, number> = {};
  tags.forEach((t) => {
    const b = t.bankId || 'Unknown';
    bankCounts[b] = (bankCounts[b] ?? 0) + 1;
  });
  const bankData = Object.entries(bankCounts).map(([bankId, count]) => ({ bankId, count }));

  const yearCounts: Record<string, number> = {};
  tags.forEach((t) => {
    const year = (t.issueDate || '').slice(0, 4);
    if (year) yearCounts[year] = (yearCounts[year] ?? 0) + 1;
  });
  const lineData = Object.entries(yearCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({ year, count }));

  const classCounts: Record<string, number> = {};
  tags.forEach((t) => {
    const c = t.vehicleClass || data.vehicleClass || 'Unknown';
    classCounts[c] = (classCounts[c] ?? 0) + 1;
  });
  const barData = Object.entries(classCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const statusDonut = [
    { name: 'Active', value: activeCount, color: '#22c55e' },
    { name: 'Inactive', value: inactiveCount, color: '#94a3b8' },
    { name: 'Blocked', value: blockedCount, color: '#f59e0b' },
    { name: 'Unknown', value: unknownCount, color: '#cbd5e1' },
  ].filter((d) => d.value > 0);

  const issueDates = tags.map((t) => t.issueDate).filter(Boolean).sort();
  const earliestIssue = issueDates[0] ?? '—';
  const latestIssue = issueDates[issueDates.length - 1] ?? '—';

  const timelineSteps = [
    { label: 'Tag Issued', description: earliestIssue !== '—' ? formatDate(earliestIssue) : '—', status: 'completed' as const },
    { label: 'Activation', description: 'Tag activated on issuer network', status: activeCount > 0 ? ('completed' as const) : ('current' as const) },
    { label: 'Current Status', description: `${activeCount} active · ${inactiveCount} inactive · ${blockedCount} blocked`, status: 'current' as const },
  ];

  const pdfSections = [
    [
      { label: 'Vehicle Registration Number', value: data.regNumber },
      { label: 'Vehicle Class', value: data.vehicleClass },
      { label: 'Commercial Vehicle', value: isCommercial(data.commercialVehicle) ? 'Yes' : 'No' },
      { label: 'Total Tags', value: String(totalTags) },
    ],
    [
      { label: 'Active Tags', value: String(activeCount) },
      { label: 'Inactive Tags', value: String(inactiveCount) },
      { label: 'Blocked Tags', value: String(blockedCount) },
      { label: 'Issued Banks', value: String(issuedBanks) },
    ],
  ];

  const excelSheets = [
    {
      name: 'Summary',
      rows: [
        ['Field', 'Value'] as (string | number)[],
        ['Vehicle Registration Number', data.regNumber],
        ['Vehicle Class', data.vehicleClass],
        ['Commercial Vehicle', isCommercial(data.commercialVehicle) ? 'Yes' : 'No'],
        ['Total Tags', totalTags],
        ['Active Tags', activeCount],
        ['Inactive Tags', inactiveCount],
        ['Blocked Tags', blockedCount],
        ['Issued Banks', issuedBanks],
      ],
    },
    {
      name: 'Tags',
      rows: [
        ['Tag ID', 'TID', 'Tag Status', 'Issue Date', 'Vehicle Class', 'Bank ID', 'Exception Code', 'Commercial'] as (string | number)[],
        ...tags.map((t) => [
          t.tagId,
          t.tid,
          t.tagStatus,
          t.issueDate,
          t.vehicleClass ?? data.vehicleClass,
          t.bankId,
          t.excCode,
          isCommercial(t.commercialVehicle ?? data.commercialVehicle) ? 'Yes' : 'No',
        ]),
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
        <ActionBar data={data} pdfTitle="FASTag Vehicle & Tag Details" pdfSections={pdfSections} excelSheets={excelSheets} />
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard label="Total Tags" value={totalTags} icon={Tag} accent="primary" delay={0.05} />
        <KpiCard label="Vehicle Number" value={data.regNumber} icon={Hash} accent="accent" delay={0.1} />
        <KpiCard label="Active Tags" value={activeCount} icon={CheckCircle2} accent="accent" delay={0.15} />
        <KpiCard label="Inactive Tags" value={inactiveCount} icon={MinusCircle} accent="warning" delay={0.2} />
        <KpiCard label="Issued Banks" value={issuedBanks} icon={Landmark} accent="primary" delay={0.25} />
      </div>

      {/* Vehicle Summary */}
      <Card delay={0.1}>
        <CardHeader title="Vehicle Summary" subtitle="Registered vehicle information" icon={<Car className="h-5 w-5" />} />
        <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
          <DetailItem label="Vehicle Registration Number" value={data.regNumber} icon={Hash} />
          <DetailItem label="Vehicle Class" value={data.vehicleClass} icon={Car} />
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
              <BadgeCheck className="h-3.5 w-3.5" /> Commercial Vehicle
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                isCommercial(data.commercialVehicle)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {isCommercial(data.commercialVehicle) ? 'Commercial' : 'Non-Commercial'}
            </span>
          </div>
          <DetailItem label="Total Tags" value={String(totalTags)} icon={Tag} />
        </div>
      </Card>

      {/* FASTag Cards */}
      <Card delay={0.15}>
        <CardHeader
          title="FASTag Cards"
          subtitle={`${totalTags} tag(s) registered`}
          icon={<CreditCard className="h-5 w-5" />}
          action={<span className="rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800 px-3 py-1 text-xs font-semibold">{totalTags}</span>}
        />
        {totalTags === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No FASTag cards found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
            {tags.map((tag, i) => (
              <FastagCard key={tag.tagId || i} tag={tag} defaultClass={data.vehicleClass} defaultCommercial={data.commercialVehicle} delay={i * 0.05} />
            ))}
          </div>
        )}
      </Card>

      {/* Bank Information */}
      <Card delay={0.2}>
        <CardHeader title="Bank Information" subtitle="Tags grouped by issuing bank" icon={<Landmark className="h-5 w-5" />} />
        <div className="p-5">
          {bankData.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">No bank information available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {bankData.map((b, i) => (
                <div key={i} className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">{b.bankId}</p>
                      <p className="text-xs text-neutral-400">{b.count} tag(s)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Vehicle Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card delay={0.25}>
          <CardHeader title="Tag Status" subtitle="Active vs inactive distribution" icon={<ShieldCheck className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {statusDonut.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.3}>
          <CardHeader title="Vehicle Classes" subtitle="Class distribution" icon={<Car className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }} />
                <Bar dataKey="count" name="Tags" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card delay={0.35}>
          <CardHeader title="Tags Issued by Year" subtitle="Issue year trend" icon={<TrendingUp className="h-5 w-5" />} />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', background: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="count" name="Tags Issued" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Analytics summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AnalyticsMiniCard icon={CheckCircle2} label="Active Tags" value={activeCount} color="accent" delay={0.4} />
        <AnalyticsMiniCard icon={MinusCircle} label="Inactive Tags" value={inactiveCount} color="warning" delay={0.45} />
        <AnalyticsMiniCard icon={BadgeCheck} label="Commercial" value={commercialCount} color="primary" delay={0.5} />
        <AnalyticsMiniCard icon={Car} label="Non-Commercial" value={nonCommercialCount} color="warning" delay={0.55} />
        <AnalyticsMiniCard icon={CalendarDays} label="Latest Issue" value={latestIssue !== '—' ? latestIssue.slice(0, 10) : '—'} color="primary" delay={0.6} />
      </div>

      {/* Timeline */}
      <Card delay={0.4}>
        <CardHeader title="Tag Lifecycle Timeline" subtitle="Issue → Activation → Current status" icon={<CalendarDays className="h-5 w-5" />} />
        <div className="p-6">
          <Timeline steps={timelineSteps} />
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-accent-500" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary-500" /> Current</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function FastagCard({
  tag,
  defaultClass,
  defaultCommercial,
  delay = 0,
}: {
  tag: FastagTag;
  defaultClass: string;
  defaultCommercial: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 card-hover"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">{tag.tagId}</p>
            <p className="truncate text-xs text-neutral-400">TID: {tag.tid}</p>
          </div>
        </div>
        {tagStatusBadge(tag.tagStatus)}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-1 text-xs text-neutral-400"><CalendarDays className="h-3 w-3" /> Issue Date</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatDate(tag.issueDate)}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-neutral-400"><Car className="h-3 w-3" /> Vehicle Class</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{tag.vehicleClass || defaultClass || '—'}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-neutral-400"><Building2 className="h-3 w-3" /> Bank ID</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">{tag.bankId || '—'}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-neutral-400"><ShieldCheck className="h-3 w-3" /> Exception Code</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">{tag.excCode || '—'}</p>
        </div>
        <div>
          <p className="flex items-center gap-1 text-xs text-neutral-400"><BadgeCheck className="h-3 w-3" /> Commercial</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {isCommercial(tag.commercialVehicle ?? defaultCommercial) ? 'Yes' : 'No'}
          </p>
        </div>
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
