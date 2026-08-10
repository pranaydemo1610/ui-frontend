import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Car, Hash, Cog, Wrench, ScrollText, Tag, History, Receipt, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CollapsibleSidebar, type SidebarItem } from '@/components/layout/CollapsibleSidebar';
import { VehicleNumberSearch } from '@/components/road/VehicleNumberSearch';
import { ChassisNumberSearch } from '@/components/road/ChassisNumberSearch';
import { EngineNumberSearch } from '@/components/road/EngineNumberSearch';
import { EChallanSearch } from '@/components/road/EChallanSearch';
import { FastagTransactionHistory } from '@/components/road/FastagTransactionHistory';
import { FastagVehicleDetails } from '@/components/road/FastagVehicleDetails';
import { EwaybillSearch } from '@/components/road/EwaybillSearch';
import type { RoadModule, VahanScreen, EchallanScreen, FastagScreen, EwaybillScreen } from '@/types';

interface ModuleTab {
  id: RoadModule;
  label: string;
  icon: LucideIcon;
  available: boolean;
}

const moduleTabs: ModuleTab[] = [
  { id: 'vahan', label: 'VAHAN', icon: Car, available: true },
  { id: 'echallan', label: 'E-Challan', icon: ScrollText, available: true },
  { id: 'fastag', label: 'FASTag', icon: Tag, available: true },
  { id: 'ewaybill', label: 'E-Way Bill', icon: FileText, available: true },
];

const vahanItems: SidebarItem[] = [
  { id: '04', label: 'VAHAN/04', sublabel: 'Vehicle Number Search', icon: Hash },
  { id: '05', label: 'VAHAN/05', sublabel: 'Chassis Number Search', icon: Cog },
  { id: '06', label: 'VAHAN/06', sublabel: 'Engine Number Search', icon: Wrench },
];

const echallanItems: SidebarItem[] = [
  { id: '01', label: 'ECHALLAN/01', sublabel: 'Vehicle Challan Search', icon: ScrollText },
];

const fastagItems: SidebarItem[] = [
  { id: '01', label: 'FASTAG/01', sublabel: 'Transaction History', icon: History },
  { id: '02', label: 'FASTAG/02', sublabel: 'Vehicle & Tag Details', icon: Receipt },
];

const ewaybillItems: SidebarItem[] = [
  { id: '01', label: 'EWAYBILL/01', sublabel: 'E-Way Bill Details', icon: FileText },
];

export function RoadPage() {
  const [activeModule, setActiveModule] = useState<RoadModule>('vahan');
  const [vahanScreen, setVahanScreen] = useState<VahanScreen>('04');
  const [echallanScreen, setEchallanScreen] = useState<EchallanScreen>('01');
  const [fastagScreen, setFastagScreen] = useState<FastagScreen>('01');
  const [ewaybillScreen, setEwaybillScreen] = useState<EwaybillScreen>('01');
  const [collapsed, setCollapsed] = useLocalStorage('road-sidebar-collapsed', false);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">Road</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Road Transport integration via National APIs
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
        {activeModule === 'vahan' && (
          <motion.div
            key="vahan"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:flex-row"
          >
            <CollapsibleSidebar
              title="VAHAN APIs"
              items={vahanItems}
              activeId={vahanScreen}
              onSelect={(id) => setVahanScreen(id as VahanScreen)}
              collapsed={collapsed}
              onToggle={() => setCollapsed((c) => !c)}
            />
            <div className="min-w-0 flex-1">
              {vahanScreen === '04' && <VehicleNumberSearch />}
              {vahanScreen === '05' && <ChassisNumberSearch />}
              {vahanScreen === '06' && <EngineNumberSearch />}
            </div>
          </motion.div>
        )}

        {activeModule === 'echallan' && (
          <motion.div
            key="echallan"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:flex-row"
          >
            <CollapsibleSidebar
              title="E-CHALLAN APIs"
              items={echallanItems}
              activeId={echallanScreen}
              onSelect={(id) => setEchallanScreen(id as EchallanScreen)}
              collapsed={collapsed}
              onToggle={() => setCollapsed((c) => !c)}
            />
            <div className="min-w-0 flex-1">
              {echallanScreen === '01' && <EChallanSearch />}
            </div>
          </motion.div>
        )}

        {activeModule === 'fastag' && (
          <motion.div
            key="fastag"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:flex-row"
          >
            <CollapsibleSidebar
              title="FASTAG APIs"
              items={fastagItems}
              activeId={fastagScreen}
              onSelect={(id) => setFastagScreen(id as FastagScreen)}
              collapsed={collapsed}
              onToggle={() => setCollapsed((c) => !c)}
            />
            <div className="min-w-0 flex-1">
              {fastagScreen === '01' && <FastagTransactionHistory />}
              {fastagScreen === '02' && <FastagVehicleDetails />}
            </div>
          </motion.div>
        )}

        {activeModule === 'ewaybill' && (
          <motion.div
            key="ewaybill"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 lg:flex-row"
          >
            <CollapsibleSidebar
              title="EWAYBILL APIs"
              items={ewaybillItems}
              activeId={ewaybillScreen}
              onSelect={(id) => setEwaybillScreen(id as EwaybillScreen)}
              collapsed={collapsed}
              onToggle={() => setCollapsed((c) => !c)}
            />
            <div className="min-w-0 flex-1">
              {ewaybillScreen === '01' && <EwaybillSearch />}
            </div>
          </motion.div>
        )}

        {activeModule !== 'vahan' && activeModule !== 'echallan' && activeModule !== 'fastag' && activeModule !== 'ewaybill' && (
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
