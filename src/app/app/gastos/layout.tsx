'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navItems = [
  { href: '/app/gastos', label: 'Resumen', icon: '📊' },
  { href: '/app/gastos/cuentas', label: 'Mis Cuentas', icon: '🏦' },
  { href: '/app/gastos/suscripciones', label: 'Suscripciones', icon: '🔄' },
  { href: '/app/gastos/reportes', label: 'Analítica', icon: '📈' },
];

export default function GastosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div data-app="gastos" className="flex flex-col md:flex-row gap-6 animate-fade-in items-start">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 bg-background-elevated border border-border rounded-2xl p-5 flex flex-col gap-2 md:sticky md:top-20 shadow-sm">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md">
              💰
            </div>
            <h2 className="text-lg font-bold text-foreground">Finanzas</h2>
          </div>
          <ThemeToggle />
        </div>
        
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:scale-[1.01]'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-6 pt-6 border-t border-border/60 px-1">
           <p className="text-[11px] font-medium text-foreground-subtle leading-relaxed">
             Gestión inteligente de finanzas, cuentas y presupuestos personales.
           </p>
        </div>
      </aside>

      {/* Main Page Content */}
      <div className="flex-1 min-w-0 w-full bg-background rounded-2xl">
        {children}
      </div>
    </div>
  );
}
