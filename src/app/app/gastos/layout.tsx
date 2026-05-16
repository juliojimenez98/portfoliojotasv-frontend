'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navItems = [
  { href: '/app/gastos', label: 'Dashboard', icon: '📊' },
  { href: '/app/gastos/cuentas', label: 'Cuentas', icon: '🏦' },
  { href: '/app/gastos/suscripciones', label: 'Suscripciones', icon: '🔄' },
  { href: '/app/gastos/reportes', label: 'Reportes', icon: '📈' },
];

export default function GastosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div data-app="gastos" className="animate-fade-in">
      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-background-card border border-border overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-foreground border border-primary/20'
                    : 'text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
        <ThemeToggle />
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
