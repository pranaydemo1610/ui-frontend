import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, Sun, Moon, Train, Ship, Plane, Truck, IdCard, ChevronDown, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { TransportMode } from '@/types';

interface ModeItem {
  label: string;
  subtitle: string;
  path: string;
  icon: LucideIcon;
  mode: TransportMode;
  available: boolean;
}

const modes: ModeItem[] = [
  { label: 'Rail', subtitle: 'Indian Railways APIs', path: '/rail', icon: Train, mode: 'rail', available: true },
  { label: 'Water', subtitle: 'Shipping & Waterways APIs', path: '/water', icon: Ship, mode: 'water', available: false },
  { label: 'Air', subtitle: 'Aviation APIs', path: '/air', icon: Plane, mode: 'air', available: false },
  { label: 'Road', subtitle: 'Road Transport APIs', path: '/road', icon: Truck, mode: 'road', available: true },
  { label: 'Human Identity', subtitle: 'Identity Verification APIs', path: '/human-identity', icon: IdCard, mode: 'human-identity', available: true },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeMode = modes.find((mode) => location.pathname.startsWith(mode.path));

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-neutral-950">
      <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="flex h-[72px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25">
              <Train className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display text-[17px] font-bold leading-tight text-primary-600 dark:text-primary-400">Unified Logistics</p>
              <p className="text-xs font-medium leading-tight text-primary-600 dark:text-primary-400">Interface – Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-neutral-800" aria-label="Toggle theme">
              <AnimatePresence mode="wait">
                <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-neutral-800" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-error-500" />
            </button>
            <div className="relative hidden sm:block">
              <button onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100 dark:hover:bg-neutral-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white"><User className="h-4 w-4" /></div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Admin</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-slate-100 p-3 dark:border-neutral-800"><p className="text-sm font-semibold text-slate-900 dark:text-white">Admin User</p><p className="text-xs text-slate-400">admin@ulip.gov.in</p></div>
                    <button onClick={() => setProfileOpen(false)} className="w-full px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-neutral-800">Account settings</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setMobileOpen((open) => !open)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-neutral-800 sm:hidden" aria-label="Open navigation">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-5 py-5 dark:border-neutral-800 dark:bg-neutral-950 sm:px-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Transport Modes</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode?.mode === mode.mode;
              return (
                <button
                  key={mode.mode}
                  onClick={() => mode.available && navigate(mode.path)}
                  disabled={!mode.available}
                  className={`group flex min-h-[68px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                    isActive
                      ? 'border-primary-400 bg-primary-50 shadow-sm shadow-primary-500/10 dark:border-primary-600 dark:bg-primary-950/30'
                      : mode.available
                        ? 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900'
                        : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70 dark:border-neutral-800 dark:bg-neutral-900'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate text-sm font-bold ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-100'}`}>{mode.label}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-400">{mode.subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="border-b border-slate-200 bg-white px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950 sm:hidden">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300"><Train className="h-4 w-4" /> Home</Link>
        </div>
      )}

      <main>{children}</main>
    </div>
  );
}
