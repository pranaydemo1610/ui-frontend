import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Package, Search, CircleAlert as AlertCircle, PackageX, User, MapPin, Brain as Train, Boxes, Calendar, Clock, Loader as Loader2, RefreshCw, CircleCheck as CheckCircle2 } from 'lucide-react';
import { fetchParcelTracking } from '@/services/foisApi';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/KpiCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Timeline, type TimelineStep } from '@/components/ui/Timeline';
import { ActionBar, AnimatedPanel } from '@/components/ui/ActionBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FormValues {
  lngpwbltno: string;
}

type ParcelResult =
  | { kind: 'invalid' }
  | { kind: 'notfound' }
  | { kind: 'found'; data: { parcelNumber: string } };

export function ParcelTracking() {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('fois04-recent', []);
  const [result, setResult] = useState<ParcelResult | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const query = useQuery({
    queryKey: ['fois04', result?.kind === 'found' ? result.data.parcelNumber : result?.kind],
    queryFn: async () => {
      if (!result || result.kind === 'invalid' || result.kind === 'notfound') return null;
      const parcelNo = result.data.parcelNumber;
      return fetchParcelTracking({ lngpwbltno: parcelNo });
    },
    enabled: result?.kind === 'found',
    retry: 1,
  });

  const onSubmit = (data: FormValues) => {
    const parcelNo = data.lngpwbltno.trim();
    setRecentSearches((prev) => [parcelNo, ...prev.filter((s) => s !== parcelNo)].slice(0, 5));
    setResult({ kind: 'found', data: { parcelNumber: parcelNo } });
    toast.success('Tracking parcel...');
  };

  const data = query.data;
  const isLoading = query.isLoading && result?.kind === 'found';

  return (
    <AnimatedPanel id="fois04">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Rail Parcel Tracking</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Track Parcel using Parcel Receipt Number</p>
        </div>

        {/* Search Card */}
        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Parcel Number</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register('lngpwbltno', {
                      required: 'Parcel Number is required',
                      pattern: {
                        value: /^\d{10}$/,
                        message: 'Parcel Number must be exactly 10 digits',
                      },
                    })}
                    placeholder="Enter 10 digit Parcel Number"
                    className="input-field pl-10"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
                {errors.lngpwbltno && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.lngpwbltno.message}
                  </motion.p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Track Parcel
                </Button>
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-400">Recent:</span>
                    {recentSearches.slice(0, 3).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setResult({ kind: 'found', data: { parcelNumber: s } })}
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

        {/* API Info */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-bold text-white">POST</span>
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">/ulip/fois/04</code>
          <span className="text-xs text-neutral-400">Body: &#123; "lngpwbltno": "..." &#125;</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Case 1: Invalid */}
        <AnimatePresence mode="wait">
          {result?.kind === 'invalid' && !isLoading && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="overflow-hidden">
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-error-50 dark:bg-error-950/40 mb-4"
                  >
                    <AlertCircle className="h-10 w-10 text-error-500" />
                  </motion.div>
                  <h3 className="font-display text-xl font-bold text-error-700 dark:text-error-400">Invalid Parcel Number</h3>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                    Please enter a valid 10 digit Parcel Number.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Case 2: Not Found */}
          {result?.kind === 'notfound' && !isLoading && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="overflow-hidden">
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 150 }}
                    className="mb-4"
                  >
                    <PackageX className="h-20 w-20 text-neutral-300 dark:text-neutral-600" strokeWidth={1.2} />
                  </motion.div>
                  <h3 className="font-display text-xl font-bold text-neutral-700 dark:text-neutral-200">No Parcel Found</h3>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                    No record exists for this Parcel Number.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Case 3: Found */}
          {result?.kind === 'found' && data && !isLoading && (
            <motion.div
              key="found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <button
                  onClick={() => query.refetch()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
                <ActionBar
                  data={data}
                  pdfTitle="Rail Parcel Tracking"
                  pdfSections={[
                    [
                      { label: 'Parcel Number', value: data.parcelNumber },
                      { label: 'Booking Date', value: data.bookingDate },
                      { label: 'Status', value: data.status },
                      { label: 'Delivery Date', value: data.deliveryDate },
                    ],
                    [
                      { label: 'Consignor', value: data.consignor.name },
                      { label: 'Consignor Address', value: data.consignor.address },
                      { label: 'Consignee', value: data.consignee.name },
                      { label: 'Consignee Address', value: data.consignee.address },
                    ],
                    [
                      { label: 'Origin', value: data.journey.originStation },
                      { label: 'Destination', value: data.journey.destinationStation },
                      { label: 'Item Description', value: data.item.description },
                      { label: 'Weight', value: data.item.weight },
                      { label: 'Total Items', value: data.item.totalItems },
                    ],
                  ]}
                  excelSheets={[
                    { name: 'Parcel', rows: [
                      ['Field', 'Value'],
                      ['Parcel Number', data.parcelNumber], ['Booking Date', data.bookingDate], ['Status', data.status], ['Delivery Date', data.deliveryDate],
                      ['Consignor Name', data.consignor.name], ['Consignor Address', data.consignor.address],
                      ['Consignee Name', data.consignee.name], ['Consignee Address', data.consignee.address],
                      ['Origin Station', data.journey.originStation], ['Destination Station', data.journey.destinationStation],
                      ['Item Description', data.item.description], ['Weight', data.item.weight], ['Total Items', data.item.totalItems],
                    ]},
                  ]}
                />
              </div>

              {/* Summary Card */}
              <Card delay={0.05}>
                <CardHeader title="Parcel Summary" subtitle="Booking and delivery information" icon={<Package className="h-5 w-5" />} />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5">
                  <DetailItem label="Parcel Number" value={data.parcelNumber} icon={<Package className="h-4 w-4" />} />
                  <DetailItem label="Booking Date" value={data.bookingDate} icon={<Calendar className="h-4 w-4" />} />
                  <div>
                    <p className="text-xs text-neutral-400 mb-1.5">Status</p>
                    <StatusBadge status={data.status} />
                  </div>
                  <DetailItem label="Delivery Date" value={data.deliveryDate} icon={<Clock className="h-4 w-4" />} />
                </div>
              </Card>

              {/* Consignor + Consignee */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card delay={0.1}>
                  <CardHeader title="Consignor" subtitle="Sender details" icon={<User className="h-5 w-5" />} />
                  <div className="p-5 space-y-3">
                    <DetailItem label="Name" value={data.consignor.name} />
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Address</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                        {data.consignor.address}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card delay={0.15}>
                  <CardHeader title="Consignee" subtitle="Receiver details" icon={<User className="h-5 w-5" />} />
                  <div className="p-5 space-y-3">
                    <DetailItem label="Name" value={data.consignee.name} />
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Address</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                        {data.consignee.address}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Journey + Item */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card delay={0.2}>
                  <CardHeader title="Journey" subtitle="Route information" icon={<Train className="h-5 w-5" />} />
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <DetailItem label="Origin Station" value={data.journey.originStation} />
                    <DetailItem label="Destination Station" value={data.journey.destinationStation} />
                  </div>
                </Card>
                <Card delay={0.25}>
                  <CardHeader title="Item Details" subtitle="Parcel contents" icon={<Boxes className="h-5 w-5" />} />
                  <div className="p-5 grid grid-cols-3 gap-4">
                    <DetailItem label="Description" value={data.item.description} />
                    <DetailItem label="Weight" value={data.item.weight} />
                    <DetailItem label="Total Items" value={data.item.totalItems} />
                  </div>
                </Card>
              </div>

              {/* Tracking Timeline */}
              <Card delay={0.3}>
                <CardHeader title="Tracking Timeline" subtitle="Parcel journey progress" icon={<CheckCircle2 className="h-5 w-5" />} />
                <div className="p-6">
                  <Timeline
                    steps={buildParcelTimeline(data.currentStep)}
                  />
                  <div className="mt-6 flex flex-wrap gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-accent-500" /> Completed</span>
                    <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary-500" /> Current</span>
                    <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-600" /> Pending</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPanel>
  );
}

function buildParcelTimeline(currentStep: string): TimelineStep[] {
  const steps = ['Booked', 'Loaded', 'In Transit', 'Unloaded', 'Delivered'];
  const currentIdx = steps.indexOf(currentStep);
  return steps.map((s, i) => ({
    label: s,
    status: i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'pending',
  }));
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
        {icon && <span className="text-primary-500">{icon}</span>}
        {value}
      </p>
    </div>
  );
}
