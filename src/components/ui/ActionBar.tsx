import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileSpreadsheet, Printer, Copy, Check } from 'lucide-react';
import { exportPDF, exportExcel, copyJSON, printResult } from '@/utils/exportUtils';

interface ActionBarProps {
  data: unknown;
  pdfTitle: string;
  pdfSections?: { label: string; value: string }[][];
  excelSheets?: { name: string; rows: (string | number)[][] }[];
}

export function ActionBar({ data, pdfTitle, pdfSections, excelSheets }: ActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyJSON(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pdfSections && (
        <ActionButton icon={<Download className="h-4 w-4" />} label="PDF" onClick={() => exportPDF(pdfTitle, pdfSections)} />
      )}
      {excelSheets && (
        <ActionButton icon={<FileSpreadsheet className="h-4 w-4" />} label="Excel" onClick={() => exportExcel(pdfTitle, excelSheets)} />
      )}
      <ActionButton icon={<Printer className="h-4 w-4" />} label="Print" onClick={printResult} />
      <ActionButton
        icon={copied ? <Check className="h-4 w-4 text-accent-500" /> : <Copy className="h-4 w-4" />}
        label={copied ? 'Copied' : 'Copy JSON'}
        onClick={handleCopy}
      />
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
    >
      {icon}
      {label}
    </motion.button>
  );
}

// Wrapper for animated mount/unmount of content panels
export function AnimatedPanel({ children, id }: { children: ReactNode; id: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
