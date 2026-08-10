import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, TrainFront, Search, Calculator, Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CollapsibleSidebar, type SidebarItem } from '@/components/layout/CollapsibleSidebar';
import { FreightTracking } from '@/components/rail/FreightTracking';
import { FreightCalculator } from '@/components/rail/FreightCalculator';
import { ParcelTracking } from '@/components/rail/ParcelTracking';
import type { RailModule, FoisScreen } from '@/types';

interface ModuleTab {
  id: RailModule;
  label: string;
  icon: LucideIcon;
  available: boolean;
}

const moduleTabs: ModuleTab[] = [
  { id: 'fois', label: 'FOIS', icon: TrainFront, available: true },
];

const foisItems: SidebarItem[] = [
  { id: '01', label: 'FOIS/01', sublabel: 'Freight Tracking', icon: Search },
  { id: '02', label: 'FOIS/02', sublabel: 'Freight Calculation', icon: Calculator },
  { id: '04', label: 'FOIS/04', sublabel: 'Parcel Tracking', icon: Package },
];

export function RailPage() {
  const [activeModule, setActiveModule] = useState<RailModule>('fois');
  const [foisScreen, setFoisScreen] = useState<FoisScreen>('01');
  const [collapsed, setCollapsed] = useLocalStorage('rail-sidebar-collapsed', false);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Rail</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Indian Railways integration via National APIs
        </p>
      </div>

      {/* Horizontal module tabs */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {moduleTabs.map((tab) => {
          const isActive = activeModule === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => tab.available && setActiveModule(tab.id)}
              disabled={!tab.available}
              className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                  : tab.available
                    ? 'border border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-700'
                    : 'cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600'
              }`}
            >
              {!tab.available && <Lock className="h-3.5 w-3.5" />}
              <Icon className="h-4 w-4" />
              {tab.label}
              {!tab.available && (
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-700">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Module content */}
      <AnimatePresence mode="wait">
        {activeModule === 'fois' && (
          <motion.div
            key="fois"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:flex-row"
          >
            <CollapsibleSidebar
              title="FOIS Modules"
              items={foisItems}
              activeId={foisScreen}
              onSelect={(id) => setFoisScreen(id as FoisScreen)}
              collapsed={collapsed}
              onToggle={() => setCollapsed((c) => !c)}
            />
            <div className="min-w-0 flex-1">
              {foisScreen === '01' && <FreightTracking />}
              {foisScreen === '02' && <FreightCalculator />}
              {foisScreen === '04' && <ParcelTracking />}
            </div>
          </motion.div>
        )}

        {activeModule !== 'fois' && (
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-center py-24"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <Lock className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-100">Coming Soon</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                This module is under development and will be available soon.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
