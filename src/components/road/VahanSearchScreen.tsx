import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, AlertCircle, Loader2, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { insertRequestLog } from '@/services/logService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { AnimatedPanel } from '@/components/ui/ActionBar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VehicleDetailsDashboard } from '@/components/road/VehicleDetailsDashboard';
import type { VahanVehicleResponse, VahanSearchType } from '@/types';

interface VahanSearchScreenProps {
  title: string;
  subtitle: string;
  fieldName: VahanSearchType;
  fieldLabel: string;
  placeholder: string;
  icon: LucideIcon;
  endpoint: string;
  moduleId: string;
  regex: RegExp;
  minLength: number;
  maxLength: number;
  apiCall: (value: string) => Promise<VahanVehicleResponse>;
  example: string;
  pdfTitle: string;
}

interface FormValues {
  [key: string]: string;
}

export function VahanSearchScreen({
  title,
  subtitle,
  fieldName,
  fieldLabel,
  placeholder,
  icon: Icon,
  endpoint,
  moduleId,
  regex,
  minLength,
  maxLength,
  apiCall,
  example,
  pdfTitle,
}: VahanSearchScreenProps) {
  const queryClient = useQueryClient();
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(`vahan-${moduleId}-recent`, []);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const query = useQuery({
    queryKey: ['vahan', moduleId, trigger],
    queryFn: async () => {
      if (!trigger) throw new Error('No trigger');
      const startTime = Date.now();
      const status: 'success' | 'error' = 'success';
      let summary = '';
      try {
        const data = await apiCall(trigger);
        if (!data || data.message?.toLowerCase().includes('not found')) {
          setNotFound(true);
          summary = data?.message ?? 'Not found';
          return null;
        }
        setNotFound(false);
        summary = `${data.registrationNumber} - ${data.ownerName}`;
        return data;
      } finally {
        const latency = Date.now() - startTime;
        insertRequestLog({
          module: moduleId,
          endpoint,
          method: 'POST',
          params: { [fieldName]: trigger },
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
    const value = data[fieldName];
    setRecentSearches((prev) => [value, ...prev.filter((s) => s !== value)].slice(0, 5));
    setTrigger(value);
    setNotFound(false);
    toast.success('Searching vehicle records...');
  };

  const data = query.data;
  const isLoading = query.isLoading && !!trigger;
  const hasPatternError = errors[fieldName]?.type === 'pattern';

  return (
    <AnimatedPanel id={moduleId}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        </div>

        {/* Search form */}
        <Card>
          <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {fieldLabel}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    {...register(fieldName, {
                      required: `${fieldLabel} is required`,
                      minLength: { value: minLength, message: `Minimum ${minLength} characters` },
                      maxLength: { value: maxLength, message: `Maximum ${maxLength} characters` },
                      pattern: { value: regex, message: `Invalid format` },
                    })}
                    placeholder={placeholder}
                    className="input-field pl-10"
                    maxLength={maxLength}
                  />
                </div>
                {errors[fieldName] && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors[fieldName]?.message}
                  </motion.p>
                )}
                <p className="mt-1.5 text-xs text-neutral-400">Example: {example}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                  Search Vehicle
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
          <code className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">{endpoint}</code>
          <span className="text-xs text-neutral-400">Body: {fieldName}</span>
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
                    Invalid {fieldLabel}
                  </h3>
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                    {fieldLabel} must match the format:
                  </p>
                  <code className="mt-2 block rounded-lg bg-error-100 dark:bg-error-900/50 px-3 py-1.5 text-xs text-error-700 dark:text-error-300 font-mono">
                    {regex.source}
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
                Vehicle Not Found
              </h3>
              <p className="mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                No vehicle details were found for the entered {fieldLabel}.
              </p>
            </div>
          </Card>
        )}

        {/* Result dashboard */}
        {data && !isLoading && !notFound && (
          <VehicleDetailsDashboard data={data} onRetry={() => query.refetch()} pdfTitle={pdfTitle} />
        )}
      </div>
    </AnimatedPanel>
  );
}
