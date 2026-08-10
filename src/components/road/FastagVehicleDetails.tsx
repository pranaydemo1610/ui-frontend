import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, CircleAlert as AlertCircle, Loader as Loader2, Circle as XCircle, Tag, RefreshCw, TriangleAlert as AlertTriangle, Car } from 'lucide-react';
import { fetchFastagDetails, isFailure } from '@/services/fastagApi';
import { insertRequestLog } from '@/services/logService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { AnimatedPanel } from '@/components/ui/ActionBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FastagDetailsDashboard } from '@/components/road/FastagDetailsDashboard';
import type { FastagDetailsResponse } from '@/types';

const VEHICLE_REGEX = /^[A-Z0-9]{5,11}$|^[A-Z0-9]{17,20}$/;
const TAG_ID_REGEX = /^[A-Z0-9]{0,25}$/;

interface FormValues {
  vehiclenumber: string;
  tagid: string;
}

interface SearchTrigger {
  vn: string;
  tid: string;
}

export function FastagVehicleDetails() {
  const queryClient = useQueryClient();
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('fastag02-recent', []);
  const [trigger, setTrigger] = useState<SearchTrigger | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [inputRequired, setInputRequired] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>();

  const watchVn = watch('vehiclenumber');
  const watchTid = watch('tagid');

  useEffect(() => {
    if (inputRequired && (watchVn || watchTid)) setInputRequired(false);
  }, [watchVn, watchTid, inputRequired]);

  const query = useQuery({
    queryKey: ['fastag02', trigger],
    queryFn: async () => {
      if (!trigger) throw new Error('No trigger');
      const startTime = Date.now();
      const status: 'success' | 'error' = 'success';
      let summary = '';
      try {
        const data = await fetchFastagDetails({ vehiclenumber: trigger.vn, tagid: trigger.tid });
        if (!data || isFailure(data) || data.tags.length === 0) {
          setNotFound(true);
          summary = data?.message ?? 'Not found';
          return null;
        }
        setNotFound(false);
        summary = `${data.regNumber || trigger.vn} - ${data.tags.length} tags`;
        return data;
      } finally {
        const latency = Date.now() - startTime;
        insertRequestLog({
          module: 'FASTAG/02',
          endpoint: '/ulip/fastag/02',
          method: 'POST',
          params: { vehiclenumber: trigger.vn, tagid: trigger.tid },
          status,
          latency_ms: latency,
          response_summary: summary,
        }).then(() => queryClient.invalidateQueries({ queryKey: ['request-stats'] }));
      }
    },
    enabled: !!trigger,
    retry: 1,
  });

  const onSubmit = (formValues: FormValues) => {
    const vn = (formValues.vehiclenumber || '').trim().toUpperCase();
    const tid = (formValues.tagid || '').trim().toUpperCase();
    if (!vn && !tid) {
      setInputRequired(true);
      toast.error('Please enter either a Vehicle Number or a FASTag ID.');
      return;
    }
    setInputRequired(false);
    const label = vn || tid;
    setRecentSearches((prev) => [label, ...prev.filter((s) => s !== label)].slice(0, 5));
    setTrigger({ vn, tid });
    setNotFound(false);
    toast.success('Fetching FASTag details...');
  };

  const data = query.data;
  const isLoading = query.isLoading && !!trigger;
  const invalidVehicle = errors.vehiclenumber?.type === 'pattern';
  const invalidTagId = errors.tagid?.type === 'pattern';

  return (
    <AnimatedPanel id="fastag02">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
            FASTag Vehicle &amp; Tag Details
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Retrieve FASTag information using Vehicle Registration Number or FASTag ID.
          </p>
        </div>

        {/* Search form */}
        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Vehicle Number <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      {...register('vehiclenumber', {
                        pattern: { value: VEHICLE_REGEX, message: 'Invalid format' },
                        maxLength: { value: 20, message: 'Maximum 20 characters' },
                      })}
                      placeholder="Enter Vehicle Registration Number"
                      className="input-field pl-10 uppercase"
                      maxLength={20}
                    />
                  </div>
                  {errors.vehiclenumber && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.vehiclenumber?.message}
                    </motion.p>
                  )}
                  <p className="mt-1.5 text-xs text-neutral-400">Example: MP09HF4987</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    FASTag ID <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      {...register('tagid', {
                        pattern: { value: TAG_ID_REGEX, message: 'Invalid format' },
                        maxLength: { value: 25, message: 'Maximum 25 characters' },
                      })}
                      placeholder="Enter FASTag ID"
                      className="input-field pl-10 uppercase"
                      maxLength={25}
                    />
                  </div>
                  {errors.tagid && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.tagid?.message}
                    </motion.p>
                  )}
                  <p className="mt-1.5 text-xs text-neutral-400">Example: 34161FA8203286140F4064E0</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary-500 to-primary-700"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                  Get FASTag Details
                </Button>
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-400">Recent:</span>
                    {recentSearches.slice(0, 3).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const isTag = /^[A-Z0-9]{17,25}$/.test(s);
                          setTrigger(isTag ? { vn: '', tid: s } : { vn: s, tid: '' });
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
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">/ulip/fastag/02</code>
          <span className="text-xs text-neutral-400">Body: vehiclenumber, tagid</span>
        </div>

        {/* Case 3: both inputs empty */}
        {inputRequired && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-950/30 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100 dark:bg-warning-900/50 shrink-0">
                  <AlertTriangle className="h-6 w-6 text-warning-600" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-warning-700 dark:text-warning-300">
                    Input Required
                  </h3>
                  <p className="mt-1 text-sm text-warning-600 dark:text-warning-400">
                    Please enter either a Vehicle Number or a FASTag ID.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Case 1: invalid vehicle number */}
        {invalidVehicle && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/30 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-100 dark:bg-error-900/50 shrink-0">
                  <AlertCircle className="h-6 w-6 text-error-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold text-error-700 dark:text-error-300">
                    Invalid Vehicle Number
                  </h3>
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    Vehicle Number must follow the required format.
                  </p>
                  <code className="mt-2 block rounded-lg bg-error-100 dark:bg-error-900/50 px-3 py-1.5 text-xs text-error-700 dark:text-error-300 font-mono">
                    ^[A-Z0-9]{'{5,11}'}$ or ^[A-Z0-9]{'{17,20}'}$
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      reset({ vehiclenumber: '', tagid: '' });
                      setTrigger(null);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-error-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-error-700 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Case 2: invalid FASTag ID */}
        {invalidTagId && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/30 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-100 dark:bg-error-900/50 shrink-0">
                  <AlertCircle className="h-6 w-6 text-error-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold text-error-700 dark:text-error-300">
                    Invalid FASTag ID
                  </h3>
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    FASTag ID must follow the required format.
                  </p>
                  <code className="mt-2 block rounded-lg bg-error-100 dark:bg-error-900/50 px-3 py-1.5 text-xs text-error-700 dark:text-error-300 font-mono">
                    ^[A-Z0-9]{'{0,25}'}$
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      reset({ vehiclenumber: '', tagid: '' });
                      setTrigger(null);
                    }}
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

        {/* Case 4: not found */}
        {notFound && !isLoading && (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-50 dark:bg-error-950/40">
                <XCircle className="h-8 w-8 text-error-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                FASTag Details Not Found
              </h3>
              <p className="mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                No FASTag records were found.
              </p>
              <button
                onClick={() => setTrigger(null)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                Search Again
              </button>
            </div>
          </Card>
        )}

        {/* Cases 5 & 6: dashboard */}
        {data && !isLoading && !notFound && (
          <FastagDetailsDashboard
            data={data as FastagDetailsResponse}
            onRetry={() => query.refetch()}
          />
        )}
      </div>
    </AnimatedPanel>
  );
}
