import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, required, optional, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
        {optional && (
          <span className="ml-1 text-slate-400 dark:text-slate-500">(valfritt)</span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
