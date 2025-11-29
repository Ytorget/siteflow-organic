import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, indeterminate, className = '', id, disabled, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate || false;
      }
    }, [indeterminate]);

    const checkbox = (
      <div className="relative inline-flex items-center">
        <input
          ref={inputRef}
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${
            error
              ? 'border-red-500 dark:border-red-400'
              : 'border-slate-300 dark:border-slate-600'
          } peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-indeterminate:border-blue-600 peer-indeterminate:bg-blue-600 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500 dark:peer-indeterminate:border-blue-500 dark:peer-indeterminate:bg-blue-500`}
        >
          <Check className="hidden h-3.5 w-3.5 text-white peer-checked:block" />
          {indeterminate && <Minus className="h-3.5 w-3.5 text-white" />}
        </div>
      </div>
    );

    if (!label && !description) {
      return checkbox;
    }

    return (
      <div className={className}>
        <div className="flex items-start gap-3">
          {checkbox}
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`text-sm font-medium leading-none text-slate-900 dark:text-slate-100 ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Checkbox group
interface CheckboxGroupProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

const CheckboxGroup = ({ label, error, children, className = '' }: CheckboxGroupProps) => {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </legend>
      )}
      <div className="space-y-3">{children}</div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </fieldset>
  );
};

export { Checkbox, CheckboxGroup };
