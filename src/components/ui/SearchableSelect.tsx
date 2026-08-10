import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  icon,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field flex items-center justify-between text-left"
      >
        <span className={`flex items-center gap-2 ${selected ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}>
          {icon}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-elevated animate-slide-up">
          <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-sm outline-none flex-1 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-neutral-400 text-center">No results found</div>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setQuery('');
                }}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                  opt.value === value
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {opt.label}
                {opt.value === value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
