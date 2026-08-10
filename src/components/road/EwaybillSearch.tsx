import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, CircleAlert as AlertCircle, Loader as Loader2, Circle as XCircle, FileCheck, RefreshCw, Eraser } from 'lucide-react';
import { fetchEwaybillDetails } from '@/services/ewaybillApi';
import { insertRequestLog } from '@/services/logService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { AnimatedPanel } from '@/components/ui/ActionBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EwaybillDashboard } from '@/components/road/EwaybillDashboard';
import type { EwaybillResponse } from '@/types';

const EWB_NO_REGEX = /^[0-9]{12}$/;

interface FormValues {
  ewbNo: string;
}

function isNotFound(data: EwaybillResponse | null | undefined): boolean {
  if (!data) return true;
  if (/404/i.test(data.errorCodes ?? '')) return true;
  if (/not found|no record/i.test(`${data.errorCodes ?? ''} ${data.message ?? ''}`)) return true;
  if (!data.status && !data.ewayBillDate && data.vehicles.length === 0) return true;
  return false;
}

export function EwaybillSearch() {
  const queryClient = useQueryClient();
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('ewaybill01-recent', []);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'onChange',
  });

  const query = useQuery({
    queryKey: ['ewaybill01', trigger],
    queryFn: async () => {
      if (!trigger) throw new Error('No trigger');
      const startTime = Date.now();
      const status: 'success' | 'error' = 'success';
      let summary = '';
      try {
        const data = await fetchEwaybillDetails({ ewbNo: trigger });
        if (isNotFound(data)) {
          setNotFound(true);
          summary = data?.message ?? `Not found (${data?.errorCodes ?? ''})`;
          return null;
        }
        setNotFound(false);
        summary = `${data.ewbNo} - ${data.status} - ${data.vehicles.length} vehicle(s)`;
        return data;
      } finally {
        const latency = Date.now() - startTime;
        insertRequestLog({
          module: 'EWAYBILL/01',
          endpoint: '/ulip/ewaybill/01',
          method: 'POST',
          params: { ewbNo: trigger },
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
    const value = data.ewbNo.trim();
    setRecentSearches((prev) => [value, ...prev.filter((s) => s !== value)].slice(0, 5));
    setTrigger(value);
    setNotFound(false);
    toast.success('Searching E-Way Bill...');
  };

  const data = query.data;
  const isLoading = query.isLoading && !!trigger;
  const invalidFormat = errors.ewbNo && errors.ewbNo.type !== 'required';

  const handleClearForm = () => {
    reset({ ewbNo: '' });
    setTrigger(null);
    setNotFound(false);
  };

  return (
    <AnimatedPanel id="ewaybill01">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            E-Way Bill Details
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Retrieve E-Way Bill information using a 12-digit E-Way Bill Number.
          </p>
        </div>

        {/* Search form */}
        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  E-Way Bill Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register('ewbNo', {
                      required: 'E-Way Bill Number is required',
                      minLength: { value: 12, message: 'E-Way Bill Number must be exactly 12 digits' },
                      maxLength: { value: 12, message: 'E-Way Bill Number must be exactly 12 digits' },
                      pattern: { value: EWB_NO_REGEX, message: 'E-Way Bill Number must contain only 12 digits' },
                    })}
                    placeholder="Enter 12-digit E-Way Bill Number"
                    className="input-field pl-10"
                    inputMode="numeric"
                    maxLength={12}
                  />
                </div>
                {errors.ewbNo && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.ewbNo?.message}
                  </motion.p>
                )}
                <p className="mt-1.5 text-xs text-neutral-400">Example: 101000609218</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary-500 to-primary-700"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
                  Search E-Way Bill
                </Button>
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-400">Recent:</span>
                    {recentSearches.slice(0, 3).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setValue('ewbNo', s);
                          setTrigger(s);
                          setNotFound(false);
                        }}
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
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">/ulip/ewaybill/01</code>
          <span className="text-xs text-neutral-400">Body: ewbNo</span>
        </div>

        {/* Case 1: invalid E-Way Bill number */}
        {invalidFormat && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/30 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-100 dark:bg-error-900/50 shrink-0">
                  <AlertCircle className="h-6 w-6 text-error-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold text-error-700 dark:text-error-300">
                    Invalid E-Way Bill Number
                  </h3>
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    Please enter a valid 12-digit E-Way Bill Number.
                  </p>
                  <code className="mt-2 block rounded-lg bg-error-100 dark:bg-error-900/50 px-3 py-1.5 text-xs text-error-700 dark:text-error-300 font-mono">
                    ^[0-9]{'{12}'}$
                  </code>
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-error-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-error-700 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Case 2: not found empty state */}
        {notFound && !isLoading && (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-50 dark:bg-error-950/40">
                <XCircle className="h-8 w-8 text-error-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                E-Way Bill Not Found
              </h3>
              <p className="mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                No E-Way Bill record was found for the entered E-Way Bill Number.
              </p>
              {trigger && (
                <p className="mt-3 text-xs text-neutral-400">
                  E-Way Bill Number: <span className="font-semibold text-neutral-600 dark:text-neutral-300">{trigger}</span>
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setTrigger(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search Again
                </button>
                <button
                  onClick={handleClearForm}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Clear Form
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Case 3: result dashboard */}
        {data && !isLoading && !notFound && (
          <EwaybillDashboard data={data as EwaybillResponse} onRetry={() => query.refetch()} />
        )}
      </div>
    </AnimatedPanel>
  );
}
