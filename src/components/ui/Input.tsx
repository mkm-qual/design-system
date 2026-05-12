import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none',
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
            'border-gray-300 dark:border-gray-600',
            'focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helpText && !error && <p className="text-xs text-gray-400">{helpText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
          'border-gray-300 dark:border-gray-600',
          'focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
          error && 'border-red-400',
          className
        )}
        {...props as React.SelectHTMLAttributes<HTMLSelectElement>}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

