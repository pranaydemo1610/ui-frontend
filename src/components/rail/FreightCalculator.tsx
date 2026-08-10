import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Calculator,
  MapPin,
  Clock,
  Route,
  IndianRupee,
  Loader2,
  RefreshCw,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { calculateFreight } from '@/services/foisApi';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { KpiCard } from '@/components/ui/KpiCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar, AnimatedPanel } from '@/components/ui/ActionBar';
import { SearchableSelect, type DropdownOption } from '@/components/ui/SearchableSelect';
import type { FreightCalcRequest } from '@/types';

const stationOptions: DropdownOption[] = [
  { value: 'BSP', label: 'Bilaspur (BSP)' },
  { value: 'DLI', label: 'Delhi (DLI)' },
  { value: 'NGP', label: 'Nagpur (NGP)' },
  { value: 'BPL', label: 'Bhopal (BPL)' },
  { value: 'RPR', label: 'Raipur (RPR)' },
  { value: 'HWH', label: 'Howrah (HWH)' },
  { value: 'MAS', label: 'Chennai (MAS)' },
  { value: 'BCT', label: 'Mumbai (BCT)' },
];

const commodityOptions: DropdownOption[] = [
  { value: 'Coal', label: 'Coal' },
  { value: 'Iron Ore', label: 'Iron Ore' },
  { value: 'Cement', label: 'Cement' },
  { value: 'Food Grains', label: 'Food Grains' },
  { value: 'Containers', label: 'Containers' },
  { value: 'Steel', label: 'Steel' },
  { value: 'Fertilizer', label: 'Fertilizer' },
];

const wagonOptions: DropdownOption[] = [
  { value: 'BOXN', label: 'BOXN (Open Wagon)' },
  { value: 'BCN', label: 'BCN (Covered Wagon)' },
  { value: 'BFR', label: 'BFR (Flat Wagon)' },
  { value: 'BOXNHL', label: 'BOXNHL (High Capacity)' },
  { value: 'BRN', label: 'BRN (Tank Wagon)' },
];

export function FreightCalculator() {
  const [trigger, setTrigger] = useState<FreightCalcRequest | null>(null);

  const { handleSubmit, watch, setValue, formState: { errors } } = useForm<FreightCalcRequest>();

  const query = useQuery({
    queryKey: ['fois02', trigger],
    queryFn: async () => {
      if (!trigger) throw new Error('No trigger');
      return calculateFreight(trigger);
    },
    enabled: !!trigger,
    retry: 1,
  });

  const onSubmit = (data: FreightCalcRequest) => {
    setTrigger(data);
    toast.success('Calculating freight...');
  };

  const data = query.data;
  const isLoading = query.isLoading && !!trigger;

  return (
    <AnimatedPanel id="fois02">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Rail Freight Calculator</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Calculate Freight Charges</p>
        </div>

        {/* Input Form */}
        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Station From</label>
                <SearchableSelect
                  options={stationOptions}
                  value={watch('sttnfrom')}
                  onChange={(v) => setValue('sttnfrom', v, { shouldValidate: true })}
                  placeholder="Select origin"
                  icon={<MapPin className="h-4 w-4" />}
                />
                {errors.sttnfrom && <p className="mt-1 text-xs text-error-600">{errors.sttnfrom.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Station To</label>
                <SearchableSelect
                  options={stationOptions}
                  value={watch('sttnto')}
                  onChange={(v) => setValue('sttnto', v, { shouldValidate: true })}
                  placeholder="Select destination"
                  icon={<MapPin className="h-4 w-4" />}
                />
                {errors.sttnto && <p className="mt-1 text-xs text-error-600">{errors.sttnto.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Commodity</label>
                <SearchableSelect
                  options={commodityOptions}
                  value={watch('cmdt')}
                  onChange={(v) => setValue('cmdt', v, { shouldValidate: true })}
                  placeholder="Select commodity"
                />
                {errors.cmdt && <p className="mt-1 text-xs text-error-600">{errors.cmdt.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Wagon Type</label>
                <SearchableSelect
                  options={wagonOptions}
                  value={watch('wgontype')}
                  onChange={(v) => setValue('wgontype', v, { shouldValidate: true })}
                  placeholder="Select wagon"
                />
                {errors.wgontype && <p className="mt-1 text-xs text-error-600">{errors.wgontype.message}</p>}
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                  Calculate Freight
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* API Info */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-2.5 py-1 text-xs font-bold text-white">POST</span>
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">/ulip/fois/02</code>
          <span className="text-xs text-neutral-400">Body: sttnfrom, sttnto, cmdt, wgontype</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => query.refetch()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
              <ActionBar
                data={data}
                pdfTitle="Rail Freight Calculation"
                pdfSections={[
                  [
                    { label: 'Distance', value: data.distance },
                    { label: 'ETA', value: data.eta },
                    { label: 'Route', value: data.route },
                    { label: 'Rake Size', value: data.rakeSize },
                  ],
                  [
                    { label: 'Basic Freight', value: data.basicFreight },
                    { label: 'Loading Freight', value: data.loadingFreight },
                    { label: 'GST', value: data.gst },
                    { label: 'Other Charges', value: data.otherCharges },
                    { label: 'Final Freight', value: data.finalFreight },
                  ],
                ]}
                excelSheets={[
                  { name: 'Summary', rows: [
                    ['Field', 'Value'],
                    ['Distance', data.distance], ['ETA', data.eta], ['Route', data.route], ['Rake Size', data.rakeSize],
                    ['Basic Freight', data.basicFreight], ['Loading Freight', data.loadingFreight], ['GST', data.gst],
                    ['Other Charges', data.otherCharges], ['Final Freight', data.finalFreight],
                  ]},
                  { name: 'Surcharges', rows: [
                    ['Charge', 'Percentage', 'Amount', 'Description'],
                    ...data.surchargeDetails.map(s => [s.charge, s.percentage, s.amount, s.description]),
                  ]},
                ]}
              />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Distance" value={data.distance} icon={Route} accent="primary" delay={0.05} />
              <KpiCard label="ETA" value={data.eta} icon={Clock} accent="accent" delay={0.1} />
              <KpiCard label="Route" value={data.route} icon={MapPin} accent="primary" delay={0.15} />
              <KpiCard label="Rake Size" value={data.rakeSize} icon={Layers} accent="accent" delay={0.2} />
            </div>

            {/* Freight Summary */}
            <Card delay={0.1}>
              <CardHeader title="Freight Summary" subtitle="Charge breakdown" icon={<IndianRupee className="h-5 w-5" />} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5">
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <FreightItem label="Basic Freight" value={data.basicFreight} />
                  <FreightItem label="Loading Freight" value={data.loadingFreight} />
                  <FreightItem label="GST" value={data.gst} />
                  <FreightItem label="Other Charges" value={data.otherCharges} />
                </div>
                <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white">
                  <p className="text-sm text-white/80">Final Freight</p>
                  <p className="mt-1 font-display text-3xl font-bold">{formatINR(data.finalFreight)}</p>
                  <p className="mt-2 text-xs text-white/60">Total payable amount</p>
                </div>
              </div>
            </Card>

            {/* Route Timeline */}
            <Card delay={0.15}>
              <CardHeader title="Route Information" subtitle="Origin to destination route" icon={<Route className="h-5 w-5" />} />
              <div className="p-6">
                <Timeline
                  steps={data.viaDesc.map((v, i) => ({
                    label: v,
                    status: i === 0 ? 'completed' : i === data.viaDesc.length - 1 ? 'pending' : 'current',
                    description: i === 0 ? 'Origin' : i === data.viaDesc.length - 1 ? 'Destination' : 'Intermediate',
                  }))}
                />
              </div>
            </Card>

            {/* Additional Charges Table */}
            <Card delay={0.2}>
              <CardHeader title="Additional Charges" subtitle="Detailed surcharge breakdown" icon={<TrendingUp className="h-5 w-5" />} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Charge</th>
                      <th className="text-right font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Percentage</th>
                      <th className="text-right font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Amount</th>
                      <th className="text-left font-semibold text-neutral-700 dark:text-neutral-300 px-5 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.surchargeDetails.map((s, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-100">{s.charge}</td>
                        <td className="px-5 py-3 text-right text-neutral-600 dark:text-neutral-300">{s.percentage}</td>
                        <td className="px-5 py-3 text-right font-semibold text-primary-600 dark:text-primary-400">{formatINR(s.amount)}</td>
                        <td className="px-5 py-3 text-neutral-500 dark:text-neutral-400">{s.description}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Route Type Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card delay={0.25} className="p-5">
                <p className="text-xs text-neutral-400">Route Type</p>
                <p className="mt-1 font-display text-xl font-bold text-primary-600 dark:text-primary-400">{data.routeType ?? 'Shortest'}</p>
              </Card>
              <Card delay={0.3} className="p-5">
                <p className="text-xs text-neutral-400">Distance</p>
                <p className="mt-1 font-display text-xl font-bold text-neutral-900 dark:text-neutral-100">{data.distance}</p>
              </Card>
              <Card delay={0.35} className="p-5">
                <p className="text-xs text-neutral-400">ETA</p>
                <p className="mt-1 font-display text-xl font-bold text-neutral-900 dark:text-neutral-100">{data.eta}</p>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatedPanel>
  );
}

function FreightItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatINR(value)}</p>
    </div>
  );
}

function formatINR(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
}
