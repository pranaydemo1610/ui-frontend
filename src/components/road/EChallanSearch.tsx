import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, CircleAlert as AlertCircle, Loader as Loader2, Circle as XCircle, ScrollText } from 'lucide-react';
import { searchVehicleChallan } from '@/services/echallanApi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { AnimatedPanel } from '@/components/ui/ActionBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EchallanDashboard } from '@/components/road/EchallanDashboard';

const VEHICLE_REGEX = /^[A-Za-z0-9]{5,11}$/;

interface FormValues {
  vehicleNumber: string;
}

export function EChallanSearch() {
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('echallan01-recent', []);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const query = useQuery({
    queryKey: ['echallan01', trigger],
    queryFn: async () => {
      if (!trigger) throw new Error('No trigger');
      const data = await searchVehicleChallan({ vehicleNumber: trigger });
      if (!data || (data.code && data.message?.toLowerCase().includes('no records')) || (data.pending_data.length === 0 && data.disposed_data.length === 0 && data.message?.toLowerCase().includes('no records'))) {
        setNotFound(true);
        return null;
      }
      setNotFound(false);
      return data;
    },
    enabled: !!trigger,
    retry: 1,
  });

  const onSubmit = (data: FormValues) => {
    const value = data.vehicleNumber.trim().toUpperCase();
    setRecentSearches((prev) => [value, ...prev.filter((s) => s !== value)].slice(0, 5));
    setTrigger(value);
    setNotFound(false);
    toast.success('Searching challan records...');
  };

  const data = query.data;
  const isLoading = query.isLoading && !!trigger;
  const hasPatternError = errors.vehicleNumber?.type === 'pattern';

  return (
    <AnimatedPanel id="echallan01">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Vehicle E-Challan Search</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Retrieve Pending and Disposed Traffic Challans using Vehicle Registration Number.
          </p>
        </div>

        {/* Search form */}
        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Vehicle Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register('vehicleNumber', {
                      required: 'Vehicle Number is required',
                      minLength: { value: 5, message: 'Minimum 5 characters' },
                      maxLength: { value: 11, message: 'Maximum 11 characters' },
                      pattern: { value: VEHICLE_REGEX, message: 'Invalid format' },
                    })}
                    placeholder="Enter Vehicle Registration Number"
                    className="input-field pl-10"
                    maxLength={11}
                  />
                </div>
                {errors.vehicleNumber && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.vehicleNumber?.message}
                  </motion.p>
                )}
                <p className="mt-1.5 text-xs text-neutral-400">Example: UP93BK9110</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScrollText className="h-4 w-4" />}
                  Search Challans
                </Button>
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-neutral-400">Recent:</span>
                    {recentSearches.slice(0, 3).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
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
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">/ulip/echallan/01</code>
          <span className="text-xs text-neutral-400">Body: vehicleNumber</span>
        </div>

        {/* Validation error card */}
        {hasPatternError && trigger && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-950/30 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-100 dark:bg-error-900/50 shrink-0">
                  <AlertCircle className="h-6 w-6 text-error-600" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-error-700 dark:text-error-300">
                    Invalid Vehicle Number
                  </h3>
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    Vehicle Number must match the required format.
                  </p>
                  <code className="mt-2 block rounded-lg bg-error-100 dark:bg-error-900/50 px-3 py-1.5 text-xs text-error-700 dark:text-error-300 font-mono">
                    ^[A-Za-z0-9]{'{5,11}'}$
                  </code>
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

        {/* Not found empty state */}
        {notFound && !isLoading && (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-50 dark:bg-error-950/40">
                <XCircle className="h-8 w-8 text-error-500" />
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                No Challans Found
              </h3>
              <p className="mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                No traffic challan records were found for this vehicle.
              </p>
              {trigger && (
                <p className="mt-3 text-xs text-neutral-400">
                  Vehicle Number: <span className="font-semibold text-neutral-600 dark:text-neutral-300">{trigger}</span>
                </p>
              )}
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

        {/* Result dashboard */}
        {data && !isLoading && !notFound && (
          <EchallanDashboard data={data} onRetry={() => query.refetch()} />
        )}
      </div>
    </AnimatedPanel>
  );
}
