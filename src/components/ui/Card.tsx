import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const variantStyles = {
  default: 'bg-background-card border border-border',
  glass: 'glass',
  gradient: 'bg-gradient-to-br from-background-card to-background-elevated border border-border',
  glow: 'bg-background-card border border-primary/20 animate-pulse-glow',
};

const paddingStyles = {
  none: '',
  sm: 'p-3 md:p-4',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
};

export default function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300',
        variantStyles[variant],
        paddingStyles[padding],
        hover && 'hover:border-border-hover hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ========================================
   Card Sub-components
   ======================================== */

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-sm font-medium text-foreground-muted uppercase tracking-wider', className)}>
      {children}
    </h3>
  );
}

export function CardValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-2xl md:text-3xl font-bold text-foreground mt-1', className)}>
      {children}
    </p>
  );
}
