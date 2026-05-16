'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navItems = [
  { href: '/admin', label: 'Dashboard Admin', icon: '🛡️' },
  { href: '/admin/users', label: 'Usuarios', icon: '👥' },
  { href: '/', label: 'Volver al Inicio', icon: '🏠' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen animate-fade-in">
      <div className="flex flex-col mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
            <p className="text-xs text-foreground-muted">Acceso exclusivo para administradores</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background-card border border-border overflow-x-auto">
            {navItems.map((item) => {
              // We want exact match for '/admin' to not highlight when in '/admin/users'
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                    isActive && item.href !== '/'
                      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-foreground border border-red-500/20'
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
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
