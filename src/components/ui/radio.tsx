import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = '', id, disabled, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;

    const radio = (
      <div className="relative inline-flex items-center">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:border-blue-600 dark:border-slate-600 dark:peer-checked:border-blue-500`}
        >
          <div className="h-2.5 w-2.5 scale-0 rounded-full bg-blue-600 transition-transform peer-checked:scale-100 dark:bg-blue-500" />
        </div>
      </div>
    );

    if (!label && !description) {
      return radio;
    }

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        {radio}
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={radioId}
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
    );
  }
);

Radio.displayName = 'Radio';

// Radio group
interface RadioGroupProps {
  name: string;
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroup = ({
  name,
  label,
  error,
  value,
  onChange,
  options,
  className = '',
  orientation = 'vertical',
}: RadioGroupProps) => {
  return (
    <fieldset className={className}>
      {label && (
        <legend className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </legend>
      )}
      <div
        className={
          orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'
        }
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            label={option.label}
            description={option.description}
            disabled={option.disabled}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </fieldset>
  );
};

export { Radio, RadioGroup };
