import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

const paddings: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

// rounded-2xl (large-radius token) for every card/modal, per design system.
export function Card({ padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={
        `rounded-2xl border border-primary-100 bg-surface dark:bg-surface-darker dark:border-primary-900/40 ` +
        `shadow-sm ${paddings[padding]} ${className}`
      }
      {...props}
    >
      {children}
    </div>
  );
}
