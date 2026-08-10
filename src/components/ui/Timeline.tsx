import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export type TimelineStatus = 'completed' | 'current' | 'pending';

export interface TimelineStep {
  label: string;
  description?: string;
  status: TimelineStatus;
  icon?: ReactNode;
}

interface TimelineProps {
  steps: TimelineStep[];
  vertical?: boolean;
}

export function Timeline({ steps, vertical = false }: TimelineProps) {
  if (vertical) {
    return (
      <div className="relative pl-8">
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pb-6 last:pb-0"
          >
            <div
              className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                step.status === 'completed'
                  ? 'bg-accent-500 border-accent-500 text-white'
                  : step.status === 'current'
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600 text-neutral-400'
              }`}
            >
              {step.icon ?? (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold ${
                step.status === 'pending'
                  ? 'text-neutral-400 dark:text-neutral-500'
                  : 'text-neutral-900 dark:text-neutral-100'
              }`}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{step.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Horizontal timeline
  return (
    <div className="relative flex items-start justify-between">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="relative flex flex-1 flex-col items-center text-center"
        >
          {i < steps.length - 1 && (
            <div
              className={`absolute top-5 left-1/2 h-0.5 w-full ${
                steps[i + 1].status === 'completed' || step.status === 'completed'
                  ? 'bg-accent-500'
                  : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            />
          )}
          <div
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
              step.status === 'completed'
                ? 'bg-accent-500 border-accent-500 text-white shadow-md shadow-accent-500/30'
                : step.status === 'current'
                  ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/30'
                  : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600 text-neutral-400'
            }`}
          >
            {step.icon ?? <span className="h-2.5 w-2.5 rounded-full bg-current" />}
          </div>
          <p
            className={`mt-2 text-xs font-semibold ${
              step.status === 'pending'
                ? 'text-neutral-400 dark:text-neutral-500'
                : 'text-neutral-900 dark:text-neutral-100'
            }`}
          >
            {step.label}
          </p>
          {step.description && (
            <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 max-w-[120px]">
              {step.description}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
