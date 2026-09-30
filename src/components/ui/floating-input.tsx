import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  labelBgClassName?: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      id,
      label,
      error,
      success,
      rightElement,
      className,
      containerClassName,
      labelBgClassName = 'bg-white dark:bg-zinc-900',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={cn('relative w-full pt-2 group', containerClassName)}>
        <div className="relative flex items-center">
          {/* Floating notched label cut into top border */}
          <label
            htmlFor={inputId}
            className={cn(
              'absolute -top-2 left-3 px-1.5 text-[11px] font-semibold tracking-wide transition-colors select-none z-10 leading-none pointer-events-none',
              labelBgClassName,
              error
                ? 'text-destructive font-bold'
                : success
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 group-focus-within:text-zinc-950 dark:group-focus-within:text-white',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
          >
            {label}
          </label>

          {/* Input box with rounded-lg */}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-11 px-3.5 text-xs text-zinc-950 dark:text-white bg-transparent rounded-lg border transition-all outline-none',
              error
                ? 'border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30'
                : success
                ? 'border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                : 'border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 focus:border-zinc-950 dark:focus:border-zinc-200 focus:ring-1 focus:ring-zinc-950/20 dark:focus:ring-zinc-200/20',
              disabled && 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-zinc-900/50',
              (error || success || rightElement) && 'pr-10',
              className
            )}
            {...props}
          />

          {/* Right status icon or custom element */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {error ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              rightElement
            )}
          </div>
        </div>

        {/* Error message below */}
        {error && (
          <p className="text-[11px] text-destructive font-medium mt-1 animate-fade-in pl-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = 'FloatingInput';
