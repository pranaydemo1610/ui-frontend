import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  IdCard,
  User,
  CheckCircle2,
  XCircle,
  Truck,
  Award,
  FileWarning,
  Clock,
  Database,
} from 'lucide-react';
import { verifyDrivingLicense } from '@/services/sarathiApi';
import { insertRequestLog } from '@/services/logService';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar, AnimatedPanel } from '@/components/ui/ActionBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SarathiVerificationRequest } from '@/types';

const DL_REGEX = /^(([A-Z]{2}(-)[0-9]{2})|([A-Z]{2}[0-9]{2} ))((19|20)[0-9][0-9])[0-9]{7}$/;

interface FormValues {
  dlnumber: string;
  dob: string;
}

export function DrivingLicenseVerification() {
  const queryClient = useQueryClient();
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('sarathi01-recent', []);
  const [trigger, setTrigger] = useState<SarathiVerificationRequest | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const query = useQuery({
    queryKey: ['sarathi01', trigger],
    queryFn: async () => {
      if (!trigger) throw new Error('No trigger');
      const startTime = Date.now();
      const status: 'success' | 'error' = 'success';
      let summary = '';
      try {
        const data = await verifyDrivingLicense(trigger);
        if (!data || data.verificationStatus === 'failed' || data.message?.toLowerCase().includes('not found')) {
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
          module: 'SARATHI/01',
          endpoint: '/ulip/sarathi/01',
          method: 'POST',
          params: { dlnumber: trigger.dlnumber, dob: trigger.dob },
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
    setTrigger(data);
    setNotFound(false);
    toast.success('Verifying driving license...');
  };

  const data = query.data;
  const isLoading = query.isLoading && !!trigger;

  return (
    <AnimatedPanel id="sarathi01">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            Driving License Verification
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Verify Driving License using Driving License Number and Date of Birth from the National SARATHI Database.
          </p>
        </div>

        {/* Search form */}
        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Driving License Number
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      {...register('dlnumber', {
                        required: 'Driving License Number is required',
                        pattern: { value: DL_REGEX, message: 'Invalid DL format' },
                      })}
                      placeholder="Enter Driving License Number"
                      className="input-field pl-10"
                      maxLength={16}
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
                  <p className="mt-1.5 text-xs text-neutral-400">Example: GJ04 20120005008</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="date"
                      {...register('dob', { required: 'Date of Birth is required' })}
                      className="input-field pl-10"
                    />
                  </div>
                  {errors.dob && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.dob.message}
                    </motion.p>
                  )}
                  <p className="mt-1.5 text-xs text-neutral-400">Format: yyyy-MM-dd</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Verify License
                </Button>
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-400">Recent:</span>
                    {recentSearches.slice(0, 3).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTrigger({ dlnumber: s, dob: '1987-05-26' })}
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
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">/ulip/sarathi/01</code>
          <span className="text-xs text-neutral-400">Body: dlnumber, dob</span>
        </div>

        {/* Validation error cards */}
        {errors.dlnumber?.type === 'pattern' && trigger && (
          <ValidationErrorCard
            title="Invalid Driving License Number"
            description="The Driving License Number format is invalid."
            format="(([A-Z]{2}(-)[0-9]{2})|([A-Z]{2}[0-9]{2} ))((19|20)[0-9][0-9])[0-9]{7}$"
          />
        )}

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
                No details are available for the entered Driving License Number.
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
                pdfTitle="Driving License Verification"
                pdfSections={[
                  [
                    { label: 'DL Number', value: data.dlnumber },
                    { label: 'Verification Status', value: data.verificationStatus },
                    { label: 'Data Source', value: data.dataSource },
                    { label: 'Last Updated', value: data.lastUpdated },
                  ],
                  [
                    { label: 'Full Name', value: data.fullName },
                    { label: 'Date of Birth', value: data.dob },
                    { label: 'License Status', value: data.licenseStatus },
                    { label: 'License Type', value: data.licenseType },
                  ],
                  [
                    { label: 'Issuing Authority', value: data.issuingAuthority },
                    { label: 'Current Status', value: data.currentStatus },
                    { label: 'Hazardous Goods', value: data.hazardousGoodsEndorsement },
                    { label: 'Badge Info', value: data.badgeInformation },
                  ],
                ]}
                excelSheets={[
                  {
                    name: 'Verification',
                    rows: [
                      ['Field', 'Value'],
                      ['DL Number', data.dlnumber],
                      ['Full Name', data.fullName],
                      ['Date of Birth', data.dob],
                      ['License Status', data.licenseStatus],
                      ['License Type', data.licenseType],
                      ['Issuing Authority', data.issuingAuthority],
                      ['Current Status', data.currentStatus],
                      ['Hazardous Goods', data.hazardousGoodsEndorsement],
                      ['Badge Info', data.badgeInformation],
                      ['Data Source', data.dataSource],
                      ['Last Updated', data.lastUpdated],
                    ],
                  },
                ]}
              />
            </div>

            {/* Top summary card */}
            <Card delay={0.05}>
              <CardHeader title="Verification Summary" subtitle="National SARATHI Database" icon={<ShieldCheck className="h-5 w-5" />} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5">
                <SummaryItem label="Driving License Number" value={data.dlnumber} icon={IdCard} />
                <SummaryItem
                  label="Verification Status"
                  value={data.verificationStatus === 'verified' ? 'Verified' : 'Failed'}
                  icon={data.verificationStatus === 'verified' ? CheckCircle2 : XCircle}
                  badgeColor={data.verificationStatus === 'verified' ? 'green' : 'red'}
                />
                <SummaryItem label="Data Source" value={data.dataSource} icon={Database} />
                <SummaryItem label="Last Updated" value={data.lastUpdated} icon={Clock} />
              </div>
            </Card>

            {/* Personal + License info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card delay={0.1}>
                <CardHeader title="Personal Information" subtitle="Driver details" icon={<User className="h-5 w-5" />} />
                <div className="grid grid-cols-2 gap-4 p-5">
                  <DetailItem label="Full Name" value={data.fullName} />
                  <DetailItem label="Date of Birth" value={data.dob} />
                  <DetailItem label="Driving License Status" value={data.licenseStatus} />
                  <DetailItem label="License Type" value={data.licenseType} />
                </div>
              </Card>

              <Card delay={0.15}>
                <CardHeader title="License Information" subtitle="Issuance details" icon={<IdCard className="h-5 w-5" />} />
                <div className="grid grid-cols-1 gap-4 p-5">
                  <DetailItem label="License Number" value={data.dlnumber} />
                  <DetailItem label="Issuing Authority" value={data.issuingAuthority} />
                  <DetailItem label="Current Status" value={data.currentStatus} />
                </div>
              </Card>
            </div>

            {/* Driving classes */}
            <Card delay={0.2}>
              <CardHeader title="Driving Classes" subtitle="Authorized vehicle categories" icon={<Truck className="h-5 w-5" />} />
              <div className="p-5 flex flex-wrap gap-2">
                {data.drivingClasses.map((dc, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      dc.type === 'Transport'
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                        : 'bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800'
                    }`}
                  >
                    {dc.class} <span className="opacity-60">·</span> {dc.type}
                  </span>
                ))}
              </div>
            </Card>

            {/* Transport info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card delay={0.25}>
                <CardHeader title="Hazardous Goods Endorsement" icon={<FileWarning className="h-5 w-5" />} />
                <div className="p-5">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {data.hazardousGoodsEndorsement}
                  </p>
                </div>
              </Card>

              <Card delay={0.3}>
                <CardHeader title="Badge Information" icon={<Award className="h-5 w-5" />} />
                <div className="p-5">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {data.badgeInformation}
                  </p>
                </div>
              </Card>
            </div>

            {/* Objections */}
            {data.objections.length > 0 && (
              <Card delay={0.35}>
                <CardHeader title="Objections" subtitle="Driving history issues" icon={<AlertCircle className="h-5 w-5" />} />
                <div className="p-5 space-y-3">
                  {data.objections.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-error-50 dark:bg-error-950/30 p-3">
                      <XCircle className="h-5 w-5 text-error-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{obj.description}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{obj.date} · {obj.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Verification timeline */}
            <Card delay={0.4}>
              <CardHeader title="Verification Timeline" subtitle="Process flow" icon={<CheckCircle2 className="h-5 w-5" />} />
              <div className="p-6">
                <Timeline
                  steps={[
                    { label: 'Submitted', description: 'DL + DOB sent for verification', status: 'completed' },
                    { label: 'SARATHI Validation', description: 'National Register lookup', status: 'completed' },
                    {
                      label: 'Verified Successfully',
                      description: data.verificationStatus === 'verified' ? 'License confirmed valid' : 'Verification failed',
                      status: data.verificationStatus === 'verified' ? 'completed' : 'current',
                    },
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

function ValidationErrorCard({ title, description, format }: { title: string; description: string; format?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-2xl border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/30 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-100 dark:bg-error-900/50 shrink-0">
            <AlertCircle className="h-6 w-6 text-error-600" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-error-700 dark:text-error-300">{title}</h3>
            <p className="mt-1 text-sm text-error-600 dark:text-error-400">{description}</p>
            {format && (
              <code className="mt-2 block rounded-lg bg-error-100 dark:bg-error-900/50 px-3 py-1.5 text-xs text-error-700 dark:text-error-300 font-mono">
                {format}
              </code>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SummaryItem({
  label,
  value,
  icon: Icon,
  badgeColor,
}: {
  label: string;
  value: string;
  icon: typeof IdCard;
  badgeColor?: 'green' | 'red';
}) {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-1.5 flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      {badgeColor === 'green' ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800 px-3 py-1 text-xs font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {value}
        </span>
      ) : badgeColor === 'red' ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-300 border border-error-200 dark:border-error-800 px-3 py-1 text-xs font-semibold">
          <XCircle className="h-3.5 w-3.5" />
          {value}
        </span>
      ) : (
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
      )}
    </div>
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
