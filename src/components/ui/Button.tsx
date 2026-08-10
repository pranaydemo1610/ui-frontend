import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, onClick, ...props }, ref) => {
    const base =
      'relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary-500/30';

    const variants: Record<string, string> = {
      primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md',
      ghost: 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
      outline:
        'border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const rect = button.getBoundingClientRect();
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - diameter / 2}px`;
      circle.style.top = `${e.clientY - rect.top - diameter / 2}px`;
      circle.className = 'ripple-effect';
      const existing = button.querySelector('.ripple-effect');
      if (existing) existing.remove();
      button.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={`${base} ${variants[variant]} ${className}`}
        onClick={handleClick}
        {...(props as object)}
      >
        {children}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';
