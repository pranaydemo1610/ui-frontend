import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  sublabel: string;
  icon: LucideIcon;
  badge?: string;
}

interface CollapsibleSidebarProps {
  title: string;
  items: SidebarItem[];
  activeId: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function CollapsibleSidebar({
  title,
  items,
  activeId,
  onSelect,
  collapsed,
  onToggle,
}: CollapsibleSidebarProps) {
  return (
    <aside className="shrink-0">
      <div
        className={`card overflow-hidden transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-[60px]' : 'w-full lg:w-64'
        }`}
      >
        {/* Header / toggle */}
        <div className="flex items-center justify-between border-b border-neutral-100 p-3 dark:border-neutral-800">
          {!collapsed && (
            <p className="px-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
              {title}
            </p>
          )}
          <button
            onClick={onToggle}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              collapsed ? 'mx-auto' : ''
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Items */}
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center rounded-xl transition-all ${
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 text-left'
                } ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                    : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.2 }}
                      className="flex min-w-0 flex-1 items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.label}</p>
                        <p className="truncate text-xs text-neutral-400">{item.sublabel}</p>
                      </div>
                      {item.badge && (
                        <span className="ml-2 shrink-0 rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-semibold text-accent-700 dark:bg-accent-950/50 dark:text-accent-300">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isActive
                            ? 'text-primary-500'
                            : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Active indicator bar for collapsed mode */}
                {collapsed && isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
