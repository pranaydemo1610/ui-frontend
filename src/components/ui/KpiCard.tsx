import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'primary' | 'accent' | 'warning' | 'error';
  delay?: number;
  sublabel?: string;
}

const accentMap: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400',
  accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-400',
  error: 'bg-error-50 text-error-600 dark:bg-error-950/40 dark:text-error-400',
};

export function KpiCard({ label, value, icon: Icon, accent = 'primary', delay = 0, sublabel }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="card p-5 card-hover"
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-neutral-400">{sublabel}</p>}
    </motion.div>
  );
}

interface StatusBadgeProps {
  status: string;
  children?: ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const s = status.toLowerCase();
  let cls = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
  if (s.includes('transit') || s.includes('loaded') || s.includes('unloaded')) {
    cls = 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800';
  } else if (s.includes('delivered') || s.includes('reached') || s.includes('completed') || s.includes('success')) {
    cls = 'bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800';
  } else if (s.includes('pending') || s.includes('booked') || s.includes('waiting')) {
    cls = 'bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border border-warning-200 dark:border-warning-800';
  } else if (s.includes('error') || s.includes('invalid') || s.includes('fail')) {
    cls = 'bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-300 border border-error-200 dark:border-error-800';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {children ?? status}
    </span>
  );
}
