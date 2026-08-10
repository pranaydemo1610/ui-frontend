import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Fingerprint, CreditCard, FileCheck, Car, ShieldCheck, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CollapsibleSidebar, type SidebarItem } from '@/components/layout/CollapsibleSidebar';
import { DrivingLicenseVerification } from '@/components/human-identity/DrivingLicenseVerification';
import { DrivingLicenseDetails } from '@/components/human-identity/DrivingLicenseDetails';
import type { HumanIdentityModule, SarathiScreen } from '@/types';

interface ModuleTab {
  id: HumanIdentityModule;
  label: string;
  icon: LucideIcon;
  available: boolean;
}

const moduleTabs: ModuleTab[] = [
  { id: 'aadhaar', label: 'Aadhaar', icon: Fingerprint, available: false },
  { id: 'pan', label: 'PAN', icon: CreditCard, available: false },
  { id: 'digilocker', label: 'DigiLocker Validation', icon: FileCheck, available: false },
  { id: 'sarathi', label: 'Sarathi', icon: Car, available: true },
];

const sarathiItems: SidebarItem[] = [
  { id: '01', label: 'SARATHI/01', sublabel: 'Driving License Verification', icon: ShieldCheck },
  { id: '02', label: 'SARATHI/02', sublabel: 'Driving License Details', icon: FileText },
];

export function HumanIdentityPage() {
  const [activeModule, setActiveModule] = useState<HumanIdentityModule>('sarathi');
  const [sarathiScreen, setSarathiScreen] = useState<SarathiScreen>('01');
  const [collapsed, setCollapsed] = useLocalStorage('hi-sidebar-collapsed', false);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Human Identity</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Identity verification via National Government APIs
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
        {activeModule === 'sarathi' && (
          <motion.div
            key="sarathi"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:flex-row"
          >
            <CollapsibleSidebar
              title="SARATHI Modules"
              items={sarathiItems}
              activeId={sarathiScreen}
              onSelect={(id) => setSarathiScreen(id as SarathiScreen)}
              collapsed={collapsed}
              onToggle={() => setCollapsed((c) => !c)}
            />
            <div className="min-w-0 flex-1">
              {sarathiScreen === '01' && <DrivingLicenseVerification />}
              {sarathiScreen === '02' && <DrivingLicenseDetails />}
            </div>
          </motion.div>
        )}

        {activeModule !== 'sarathi' && (
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
