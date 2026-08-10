import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, Package, MapPin, Brain as Train, Navigation, Clock, CircleCheck as CheckCircle2, Loader as Loader2, CircleAlert as AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { fetchFreightTracking } from '@/services/foisApi';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/KpiCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { MapView } from '@/components/ui/MapView';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar, AnimatedPanel } from '@/components/ui/ActionBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FormValues {
  fnrnumber: string;
}

export function FreightTracking() {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('fois01-recent', []);
  const [fnrNo, setFnrNo] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const query = useQuery({
    queryKey: ['fois01', fnrNo],
    queryFn: async () => {
      if (!fnrNo) throw new Error('No FNR');
      return fetchFreightTracking({ fnrnumber: fnrNo });
    },
    enabled: !!fnrNo,
    retry: 1,
  });

  const onSubmit = (data: FormValues) => {
    const fnr = data.fnrnumber.trim();
    setRecentSearches((prev) => [fnr, ...prev.filter((s) => s !== fnr)].slice(0, 5));
    setFnrNo(fnr);
    toast.success('Tracking freight...');
  };

  const data = query.data;
  const isLoading = query.isLoading && !!fnrNo;

  return (
    <AnimatedPanel id="fois01">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Rail Freight Tracking</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Track Railway Freight using Freight Number Record (FNR)
          </p>
        </div>

        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  FNR Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register('fnrnumber', {
                      required: 'FNR Number is required',
                      pattern: { value: /^\d{11}$/, message: 'FNR Number must be exactly 11 numeric digits' },
                    })}
                    placeholder="Enter 11 digit FNR Number"
                    className="input-field pl-10"
                    inputMode="numeric"
                    maxLength={11}
                  />
                </div>
                {errors.fnrnumber && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.fnrnumber.message}
                  </motion.p>
                )}
                <p className="mt-1.5 text-xs text-neutral-400">Example: 23091420258</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Track Freight
                </Button>
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-400">Recent:</span>
                    {recentSearches.slice(0, 3).map((s) => (
                      <button key={s} type="button"
                        onClick={() => setFnrNo(s)}
                        className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-bold text-white">POST</span>
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">/ulip/fois/01</code>
          <span className="text-xs text-neutral-400">Body: &#123; "fnrnumber": "..." &#125;</span>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        )}

        {data && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <button onClick={() => query.refetch()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </button>
              <ActionBar data={data} pdfTitle="Rail Freight Tracking"
                pdfSections={[
                  [{ label: 'FNR Number', value: data.fnrNo }, { label: 'Current Status', value: data.currentStatus }, { label: 'ETA', value: data.etaDstn }, { label: 'Commodity', value: data.cmdt }],
                  [{ label: 'Origin', value: data.stationFrom }, { label: 'Destination', value: data.stationTo }, { label: 'Last Location', value: data.lastRepLocn }, { label: 'Coordinates', value: `${data.lttd}, ${data.lgtd}` }],
                ]}
                excelSheets={[{ name: 'Tracking', rows: [
                  ['Field', 'Value'], ['FNR Number', data.fnrNo], ['Current Status', data.currentStatus], ['ETA', data.etaDstn],
                  ['Commodity', data.cmdt], ['Origin Station', data.stationFrom], ['Destination Station', data.stationTo],
                  ['Last Reported Location', data.lastRepLocn], ['Latitude', data.lttd], ['Longitude', data.lgtd],
                ]}]}
              />
            </div>

            <Card delay={0.05}>
              <CardHeader title="Shipment Status" subtitle="Real-time freight status" icon={<Package className="h-5 w-5" />} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5">
                <div><p className="text-xs text-neutral-400 mb-1.5">Current Status</p><StatusBadge status={data.currentStatus} /></div>
                <div><p className="text-xs text-neutral-400 mb-1.5">Delivery</p><p className="flex items-center gap-1.5 text-sm font-semibold text-accent-600 dark:text-accent-400"><CheckCircle2 className="h-4 w-4" />Success</p></div>
                <div><p className="text-xs text-neutral-400 mb-1.5">ETA</p><p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100"><Clock className="h-4 w-4 text-primary-500" />{data.etaDstn}</p></div>
                <div><p className="text-xs text-neutral-400 mb-1.5">Last Report</p><p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100"><Navigation className="h-4 w-4 text-primary-500" />{data.lastRepLocn}</p></div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card delay={0.1}>
                <CardHeader title="Shipment Details" subtitle="Freight information" icon={<FileText className="h-5 w-5" />} />
                <div className="grid grid-cols-2 gap-4 p-5">
                  <DetailItem label="FNR Number" value={data.fnrNo} />
                  <DetailItem label="Commodity" value={data.cmdt} />
                  <DetailItem label="Origin Station" value={data.stationFrom} />
                  <DetailItem label="Destination Station" value={data.stationTo} />
                </div>
              </Card>
              <Card delay={0.15}>
                <CardHeader title="Current Location" subtitle="Last reported position" icon={<MapPin className="h-5 w-5" />} />
                <div className="grid grid-cols-3 gap-4 p-5">
                  <DetailItem label="Last Station" value={data.lastRepLocn} />
                  <DetailItem label="Latitude" value={data.lttd} />
                  <DetailItem label="Longitude" value={data.lgtd} />
                </div>
              </Card>
            </div>

            <Card delay={0.2}>
              <CardHeader title="Live Location Map" subtitle="Interactive tracking map" icon={<MapPin className="h-5 w-5" />} />
              <div className="p-5">
                <MapView latitude={parseFloat(data.lttd) || 21.146633} longitude={parseFloat(data.lgtd) || 79.088860} label={data.lastRepLocn} />
              </div>
            </Card>

            <Card delay={0.25}>
              <CardHeader title="Tracking Timeline" subtitle="Shipment journey progress" icon={<Train className="h-5 w-5" />} />
              <div className="p-6">
                <Timeline steps={[
                  { label: 'Origin', description: data.stationFrom, status: 'completed' },
                  { label: 'In Transit', description: data.lastRepLocn, status: 'current' },
                  { label: 'Reached Destination', description: data.stationTo, status: 'pending' },
                ]} />
                <div className="mt-6 flex flex-wrap gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-accent-500" /> Completed</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary-500" /> Current</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-600" /> Pending</span>
                </div>
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
