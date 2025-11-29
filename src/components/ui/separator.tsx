import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  decorative?: boolean;
}

const Separator = ({
  orientation = 'horizontal',
  className = '',
  decorative = true,
}: SeparatorProps) => {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={`shrink-0 bg-slate-200 dark:bg-slate-700 ${
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px'
      } ${className}`}
    />
  );
};

// Separator with text
interface SeparatorWithTextProps {
  children: React.ReactNode;
  className?: string;
}

const SeparatorWithText = ({ children, className = '' }: SeparatorWithTextProps) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Separator className="flex-1" />
      <span className="text-sm text-slate-500 dark:text-slate-400">{children}</span>
      <Separator className="flex-1" />
    </div>
  );
};

export { Separator, SeparatorWithText };
