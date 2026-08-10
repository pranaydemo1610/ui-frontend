import { motion } from 'framer-motion';
import { Activity, Plane, Box, CircleCheck as CheckCircle2, CircleDot, LockKeyhole, MapPin, Package, Route, Ship, Brain as Train, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InfoItem {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
}

const infoItems: InfoItem[] = [
  { value: '20+', label: 'APIs Available', icon: Box, tone: 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300' },
  { value: '99.9%', label: 'Uptime', icon: CheckCircle2, tone: 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-300' },
  { value: '120ms', label: 'Avg. Response Time', icon: Activity, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300' },
  { value: 'Secure', label: '& Reliable', icon: LockKeyhole, tone: 'bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-300' },
];

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-full max-w-[1400px] flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-9">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex-1 isolate overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-white via-primary-50/35 to-sky-50/70 shadow-sm dark:border-primary-900/60 dark:from-neutral-900 dark:via-primary-950/20 dark:to-sky-950/20"
      >
        <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary-100/40 blur-3xl dark:bg-primary-900/20" />
        <div className="grid h-full items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-14 lg:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-[11px] font-bold text-primary-600 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-300">
              <CircleDot className="h-3.5 w-3.5" />
              Seamless. Reliable. Connected.
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Hey, Admin! <span aria-hidden="true">👋</span>
            </h1>
            <h2 className="mt-3 max-w-xl font-display text-2xl font-bold leading-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              Welcome to the{' '}
              <span className="text-primary-600 dark:text-primary-400">Unified Logistics Interface – Portal</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
              Select a transport mode from the top to explore and integrate with our trusted logistics APIs.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-y-5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-4">
              {infoItems.map(({ label, value, icon: Icon, tone }, index) => (
                <div key={label} className={`flex items-center gap-3 ${index > 0 ? 'sm:border-l sm:border-slate-200 sm:pl-7 dark:sm:border-neutral-700' : ''}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{value}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <LogisticsIllustration />
        </div>
      </motion.section>

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400 dark:text-slate-500">
        <LockKeyhole className="h-3.5 w-3.5 text-primary-500" />
        Built for performance. Designed for scale. Secured for you.
      </p>
    </div>
  );
}

function LogisticsIllustration() {
  return (
    <div className="relative hidden h-64 lg:block" aria-hidden="true">
      <div className="absolute inset-4 rounded-[40%] border border-dashed border-primary-100/80 dark:border-primary-800/50" />
      <div className="absolute right-10 top-4 h-32 w-56 rounded-full border border-primary-100/70 dark:border-primary-800/40" />
      <div className="absolute left-4 top-12 h-44 w-72 rounded-[50%] border-t border-primary-100/70 dark:border-primary-800/40" style={{ transform: 'rotate(-18deg)' }} />
      <div className="absolute right-3 top-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100/70 text-primary-500 dark:bg-primary-900/50 dark:text-primary-300">
        <Plane className="h-5 w-5" />
      </div>
      <div className="absolute left-8 top-20 flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-primary-500 shadow-sm dark:bg-neutral-900/80 dark:text-primary-300">
        <Train className="h-5 w-5" />
      </div>
      <div className="absolute right-20 top-24 flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-primary-500 shadow-sm dark:bg-neutral-900/80 dark:text-primary-300">
        <Ship className="h-5 w-5" />
      </div>
      <div className="absolute bottom-8 left-20 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-500/20">
        <Truck className="h-6 w-6" />
      </div>
      <div className="absolute bottom-5 right-7 flex items-center gap-2 rounded-xl border border-primary-100 bg-white/85 px-3 py-2 text-primary-500 shadow-sm dark:border-primary-800 dark:bg-neutral-900/85 dark:text-primary-300">
        <MapPin className="h-4 w-4" />
        <Route className="h-4 w-4" />
        <Package className="h-4 w-4" />
      </div>
      <div className="absolute bottom-20 left-1/2 h-2 w-2 rounded-full bg-primary-400" />
      <div className="absolute right-1/3 top-20 h-2 w-2 rounded-full bg-sky-400" />
    </div>
  );
}
