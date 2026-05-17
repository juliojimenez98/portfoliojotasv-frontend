'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

const gastosNavItems = [
  { href: '/app/gastos', label: 'Resumen', icon: '📊' },
  { href: '/app/gastos/transacciones', label: 'Transacciones', icon: '💸' },
  { href: '/app/gastos/cuentas', label: 'Mis Cuentas', icon: '🏦' },
  { href: '/app/gastos/suscripciones', label: 'Suscripciones', icon: '🔄' },
  { href: '/app/gastos/reportes', label: 'Analítica', icon: '📈' },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  // We only have Gastos right now, but this could switch based on pathname
  const navItems = gastosNavItems;

  return (
    <aside 
      className={cn(
        "sticky top-0 h-screen shrink-0 bg-background-elevated border-r border-border flex flex-col shadow-sm transition-all duration-300 z-40",
        isCollapsed ? "w-[80px]" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-background-elevated border border-border rounded-full flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 shadow-sm transition-colors z-50"
        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {isCollapsed ? "›" : "‹"}
      </button>

      {/* Header / Logo */}
      <div className={cn("flex items-center h-20 shrink-0", isCollapsed ? "justify-center" : "px-6 justify-between")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md text-lg">
            JJ
          </div>
          {!isCollapsed && <h2 className="text-xl font-bold text-foreground overflow-hidden whitespace-nowrap">Apps</h2>}
        </div>
      </div>
      
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6 py-4">
        {/* Module specific links (Gastos) */}
        <div className="flex flex-col gap-1 px-3">
          {!isCollapsed && <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 px-3">Finanzas</p>}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-xl font-semibold transition-all duration-200 relative group',
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  )}
                >
                  <span className={cn("shrink-0", isCollapsed ? "text-2xl" : "text-xl")}>{item.icon}</span>
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  
                  {isCollapsed && (
                    <span className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Footer Area */}
      <div className="shrink-0 border-t border-border/60 p-3 flex flex-col gap-2">
        <Link
          href="/"
          title={isCollapsed ? "Volver al Home" : undefined}
          className={cn(
            'flex items-center rounded-xl font-medium transition-all duration-200 group',
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2',
            'text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
          )}
        >
          <span className={cn("shrink-0", isCollapsed ? "text-xl" : "text-lg")}>🏠</span>
          {!isCollapsed && <span className="whitespace-nowrap">Volver al Home</span>}
          {isCollapsed && (
            <span className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              Volver al Home
            </span>
          )}
        </Link>
        
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={cn(
            'flex items-center rounded-xl font-medium transition-all duration-200 group w-full',
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2',
            'text-danger hover:bg-danger/10'
          )}
        >
          <span className={cn("shrink-0", isCollapsed ? "text-xl" : "text-lg")}>🚪</span>
          {!isCollapsed && <span className="whitespace-nowrap">Cerrar Sesión</span>}
          {isCollapsed && (
            <span className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              Cerrar Sesión
            </span>
          )}
        </button>

        <div className={cn("mt-2", isCollapsed ? "flex justify-center" : "flex justify-center px-2")}>
          <div className="scale-90">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
