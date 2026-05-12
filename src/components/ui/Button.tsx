import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-2.5 text-sm',
        variant === 'primary' && 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500',
        variant === 'secondary' && 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 focus:ring-gray-400',
        variant === 'ghost' && 'hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-300 focus:ring-gray-400',
        variant === 'danger' && 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
        variant === 'success' && 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400',
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
