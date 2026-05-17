'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';

import { useState } from 'react';

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
  // Sidebar starts collapsed by default
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div data-app="gastos" className="flex flex-col md:flex-row gap-6 animate-fade-in items-start relative">
      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "shrink-0 bg-background-elevated border border-border rounded-2xl flex flex-col md:sticky md:top-20 shadow-sm transition-all duration-300 relative",
          isCollapsed ? "w-full md:w-[88px] p-3" : "w-full md:w-64 p-5"
        )}
      >
        {/* Toggle Button (Only visible on Desktop) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-background-elevated border border-border rounded-full items-center justify-center text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 shadow-sm transition-colors z-10"
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? "›" : "‹"}
        </button>

        <div className={cn("flex items-center mb-6", isCollapsed ? "justify-center mt-2" : "justify-center px-1")}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md">
              💰
            </div>
            {!isCollapsed && <h2 className="text-lg font-bold text-foreground overflow-hidden whitespace-nowrap">Finanzas</h2>}
          </div>
        </div>
        
        <nav className={cn("flex gap-2", isCollapsed ? "md:flex-col flex-row justify-center" : "flex-col")}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-xl font-semibold transition-all duration-300 relative group',
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:scale-[1.01]'
                )}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                
                {/* Tooltip for mobile row or collapsed desktop */}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 hidden md:block transition-opacity">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className={cn("mt-auto pt-4 border-t border-border/60", isCollapsed ? "flex justify-center" : "px-1")}>
           {isCollapsed ? (
             <div className="scale-90 opacity-70 hover:opacity-100 transition-opacity">
               <ThemeToggle />
             </div>
           ) : (
             <div className="flex items-center justify-between gap-2">
               <p className="text-[11px] font-medium text-foreground-subtle leading-relaxed pr-2">
                 Gestión de finanzas.
               </p>
               <div className="shrink-0 scale-90">
                 <ThemeToggle />
               </div>
             </div>
           )}
        </div>
      </aside>

      {/* Main Page Content */}
      <div className="flex-1 min-w-0 w-full bg-background rounded-2xl">
        {children}
      </div>
    </div>
  );
}
