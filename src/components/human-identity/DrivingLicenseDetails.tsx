import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FileText,
  Search,
  AlertCircle,
  Loader2,
  RefreshCw,
  IdCard,
  User,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Truck,
  Gauge,
} from 'lucide-react';
import { fetchDrivingLicenseDetails } from '@/services/sarathiApi';
import { insertRequestLog } from '@/services/logService';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar, AnimatedPanel } from '@/components/ui/ActionBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FormValues {
  dlnumber: string;
}

function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function daysRemaining(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800 px-3 py-1 text-xs font-semibold">
        <CheckCircle2 className="h-3.5 w-3.5" /> Active
      </span>
    );
  }
  if (s === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-300 border border-error-200 dark:border-error-800 px-3 py-1 text-xs font-semibold">
        <XCircle className="h-3.5 w-3.5" /> Expired
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border border-warning-200 dark:border-warning-800 px-3 py-1 text-xs font-semibold">
      <AlertCircle className="h-3.5 w-3.5" /> {status}
    </span>
  );
}

export function DrivingLicenseDetails() {
  const queryClient = useQueryClient();
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('sarathi02-recent', []);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const query = useQuery({
    queryKey: ['sarathi02', trigger],
    queryFn: async () => {
      if (!trigger) throw new Error('No trigger');
      const startTime = Date.now();
      const status: 'success' | 'error' = 'success';
      let summary = '';
      try {
        const data = await fetchDrivingLicenseDetails(trigger);
        if (!data || data.message?.toLowerCase().includes('not found')) {
          setNotFound(true);
          summary = data?.message ?? 'Not found';
          return null;
        }
        setNotFound(false);
        summary = `${data.fullName} - ${data.licenseStatus}`;
        return data;
      } finally {
        const latency = Date.now() - startTime;
        insertRequestLog({
          module: 'SARATHI/02',
          endpoint: '/ulip/sarathi/02',
          method: 'POST',
          params: { dlnumber: trigger },
          status,
          latency_ms: latency,
          response_summary: summary,
        }).then(() => queryClient.invalidateQueries({ queryKey: ['request-stats'] }));
      }
    },
    enabled: !!trigger,
    retry: 1,
  });

  const onSubmit = (data: FormValues) => {
    setRecentSearches((prev) => [data.dlnumber, ...prev.filter((s) => s !== data.dlnumber)].slice(0, 5));
    setTrigger(data.dlnumber);
    setNotFound(false);
    toast.success('Fetching license details...');
  };

  const data = query.data;
  const isLoading = query.isLoading && !!trigger;

  const ntExpired = data ? isExpired(data.nonTransportValidity) : false;
  const tExpired = data ? isExpired(data.transportValidity) : false;
  const ntDays = data ? daysRemaining(data.nonTransportValidity) : 0;
  const tDays = data ? daysRemaining(data.transportValidity) : 0;

  return (
    <AnimatedPanel id="sarathi02">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            Driving License Details
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Retrieve Driving License Information using Driving License Number.
          </p>
        </div>

        {/* Search form */}
        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Driving License Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register('dlnumber', { required: 'Driving License Number is required' })}
                    placeholder="Enter Driving License Number"
                    className="input-field pl-10"
                    maxLength={25}
                  />
                </div>
                {errors.dlnumber && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.dlnumber.message}
                  </motion.p>
                )}
                <p className="mt-1.5 text-xs text-neutral-400">Example: AP01620210000019</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Get License Details
                </Button>
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-400">Recent:</span>
                    {recentSearches.slice(0, 3).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTrigger(s)}
                        className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </Card>

        {/* API endpoint badge */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-bold text-white">
            POST
          </span>
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">/ulip/sarathi/02</code>
          <span className="text-xs text-neutral-400">Body: dlnumber</span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Not found empty state */}
        {notFound && !isLoading && (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-50 dark:bg-error-950/40">
                <XCircle className="h-8 w-8 text-error-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Driving License Not Found
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                Details not found for the given Driving License Number.
              </p>
            </div>
          </Card>
        )}

        {/* Result dashboard */}
        {data && !isLoading && !notFound && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={() => query.refetch()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
              <ActionBar
                data={data}
                pdfTitle="Driving License Details"
                pdfSections={[
                  [
                    { label: 'Full Name', value: data.fullName },
                    { label: 'License Status', value: data.licenseStatus },
                    { label: 'Non-Transport Validity', value: data.nonTransportValidity },
                    { label: 'Transport Validity', value: data.transportValidity },
                  ],
                  [
                    { label: 'DL Number', value: data.dlnumber },
                    { label: 'Issuing Authority', value: data.issuingAuthority },
                    { label: 'Vehicle Classes', value: data.vehicleClasses.map((v) => v.cov).join(', ') },
                  ],
                ]}
                excelSheets={[
                  {
                    name: 'Details',
                    rows: [
                      ['Field', 'Value'],
                      ['DL Number', data.dlnumber],
                      ['Full Name', data.fullName],
                      ['License Status', data.licenseStatus],
                      ['Non-Transport Validity', data.nonTransportValidity],
                      ['Transport Validity', data.transportValidity],
                      ['Issuing Authority', data.issuingAuthority],
                      ...data.vehicleClasses.map((v) => [`COV: ${v.cov}`, v.covDescription]),
                    ],
                  },
                ]}
              />
            </div>

            {/* Driver summary */}
            <Card delay={0.05}>
              <CardHeader title="Driver Summary" subtitle="License holder information" icon={<User className="h-5 w-5" />} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5">
                <DetailItem label="Full Name" value={data.fullName} />
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Driving License Status</p>
                  {statusBadge(data.licenseStatus)}
                </div>
                <DetailItem label="Non-Transport Validity" value={data.nonTransportValidity} />
                <DetailItem label="Transport Validity" value={data.transportValidity} />
              </div>
            </Card>

            {/* License status card */}
            <Card delay={0.1}>
              <CardHeader title="License Status" subtitle="Current standing" icon={<IdCard className="h-5 w-5" />} />
              <div className="p-5 flex items-center gap-4">
                {statusBadge(data.licenseStatus)}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Issued by <span className="font-semibold text-neutral-900 dark:text-neutral-100">{data.issuingAuthority}</span>
                </p>
              </div>
            </Card>

            {/* Vehicle classes */}
            <Card delay={0.15}>
              <CardHeader title="Vehicle Classes" subtitle="Classes of Vehicle (COV)" icon={<Truck className="h-5 w-5" />} />
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.vehicleClasses.map((v, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 ${
                      v.covType === 'Transport'
                        ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/20'
                        : 'border-accent-200 dark:border-accent-800 bg-accent-50/50 dark:bg-accent-950/20'
                    }`}
                  >
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{v.cov}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{v.covDescription}</p>
                    <span
                      className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        v.covType === 'Transport'
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                          : 'bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300'
                      }`}
                    >
                      {v.covType}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Validity dashboard */}
            <Card delay={0.2}>
              <CardHeader title="Validity Dashboard" subtitle="License expiry tracking" icon={<Calendar className="h-5 w-5" />} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
                <ValidityCard
                  label="Non-Transport Valid Till"
                  date={data.nonTransportValidity}
                  expired={ntExpired}
                  daysRemaining={ntDays}
                />
                <ValidityCard
                  label="Transport Valid Till"
                  date={data.transportValidity}
                  expired={tExpired}
                  daysRemaining={tDays}
                />
              </div>
            </Card>

            {/* Analytics section */}
            <Card delay={0.25}>
              <CardHeader title="Analytics" subtitle="License metrics overview" icon={<Gauge className="h-5 w-5" />} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
                <AnalyticsCard
                  icon={Truck}
                  label="Total Vehicle Classes"
                  value={data.vehicleClasses.length}
                  color="primary"
                />
                <AnalyticsCard
                  icon={CheckCircle2}
                  label="License Status"
                  value={data.licenseStatus}
                  color={data.licenseStatus === 'Active' ? 'accent' : 'error'}
                />
                <AnalyticsCard
                  icon={Clock}
                  label="Days to Expiry (NT)"
                  value={ntDays > 0 ? `${ntDays} days` : 'Expired'}
                  color={ntExpired ? 'error' : 'accent'}
                />
              </div>
            </Card>

            {/* Verification timeline */}
            <Card delay={0.3}>
              <CardHeader title="Verification Timeline" subtitle="Process flow" icon={<CheckCircle2 className="h-5 w-5" />} />
              <div className="p-6">
                <Timeline
                  steps={[
                    { label: 'Request Submitted', description: 'DL number sent for retrieval', status: 'completed' },
                    { label: 'License Retrieved', description: 'Data fetched from SARATHI', status: 'completed' },
                    { label: 'Information Verified', description: 'Details confirmed', status: 'completed' },
                  ]}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </AnimatedPanel>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
    </div>
  );
}

function ValidityCard({
  label,
  date,
  expired,
  daysRemaining,
}: {
  label: string;
  date: string;
  expired: boolean;
  daysRemaining: number;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        expired
          ? 'border-error-200 dark:border-error-800 bg-error-50/50 dark:bg-error-950/20'
          : 'border-accent-200 dark:border-accent-800 bg-accent-50/50 dark:bg-accent-950/20'
      }`}
    >
      <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className={`text-lg font-bold ${expired ? 'text-error-600 dark:text-error-400' : 'text-accent-600 dark:text-accent-400'}`}>
        {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
      <p className={`mt-1 text-xs font-medium ${expired ? 'text-error-500' : 'text-accent-600 dark:text-accent-500'}`}>
        {expired ? 'Expired' : `${daysRemaining} days remaining`}
      </p>
    </div>
  );
}

function AnalyticsCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Truck;
  label: string;
  value: string | number;
  color: 'primary' | 'accent' | 'error';
}) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400',
    error: 'bg-error-50 text-error-600 dark:bg-error-950/40 dark:text-error-400',
  };
  return (
    <div className="card p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
    </div>
  );
}
