import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, delay = 0, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`card ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
          {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
