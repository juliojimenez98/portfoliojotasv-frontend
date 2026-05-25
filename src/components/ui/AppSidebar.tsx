"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useState } from "react";
import { signOut } from "next-auth/react";

const gastosNavItems = [
  { href: "/app/gastos", label: "Resumen", icon: "📊" },
  { href: "/app/gastos/transacciones", label: "Transacciones", icon: "💸" },
  { href: "/app/gastos/cuentas", label: "Cuentas", icon: "🏦" },
  { href: "/app/gastos/suscripciones", label: "Suscripciones", icon: "🔄" },
  { href: "/app/gastos/reportes", label: "Analítica", icon: "📈" },
  { href: "/app/gastos/configuracion", label: "Configuración", icon: "⚙️" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = gastosNavItems;
  const mobileNavItems = gastosNavItems.filter(
    (item) => item.href !== "/app/gastos/configuracion",
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside
        className={cn(
          "hidden md:flex sticky top-0 h-screen shrink-0 bg-background-elevated border-r border-border flex-col shadow-sm transition-all duration-300 z-40",
          isCollapsed ? "w-20" : "w-64",
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
        <div
          className={cn(
            "flex items-center h-20 shrink-0",
            isCollapsed ? "justify-center" : "px-6 justify-between",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md text-lg">
              JJ
            </div>
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-foreground overflow-hidden whitespace-nowrap">
                Apps
              </h2>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-1 px-3">
            {!isCollapsed && (
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 px-3">
                Finanzas
              </p>
            )}
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center rounded-xl font-semibold transition-all duration-200 relative group",
                      isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 border border-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0",
                        isCollapsed ? "text-2xl" : "text-xl",
                      )}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
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
          {/* Cross-app navigation removed — polla is not in sidebar yet */}
          <Link
            href="/"
            title={isCollapsed ? "Volver al Home" : undefined}
            className={cn(
              "flex items-center rounded-xl font-medium transition-all duration-200 group",
              isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2",
              "text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
            )}
          >
            <span
              className={cn("shrink-0", isCollapsed ? "text-xl" : "text-lg")}
            >
              🏠
            </span>
            {!isCollapsed && (
              <span className="whitespace-nowrap">Volver al Home</span>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                Volver al Home
              </span>
            )}
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
            className={cn(
              "flex items-center rounded-xl font-medium transition-all duration-200 group w-full",
              isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2",
              "text-danger hover:bg-danger/10",
            )}
          >
            <span
              className={cn("shrink-0", isCollapsed ? "text-xl" : "text-lg")}
            >
              🚪
            </span>
            {!isCollapsed && (
              <span className="whitespace-nowrap">Cerrar Sesión</span>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                Cerrar Sesión
              </span>
            )}
          </button>

          <div
            className={cn(
              "mt-2",
              isCollapsed ? "flex justify-center" : "flex justify-center px-2",
            )}
          >
            <div className="scale-90">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV (visible only on mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-elevated border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-stretch">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-200 relative",
                  isActive
                    ? "text-primary"
                    : "text-foreground-muted active:bg-black/5 dark:active:bg-white/5",
                )}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
                )}
                <span className="text-xl leading-none">{item.icon}</span>
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-none",
                    isActive ? "text-primary" : "text-foreground-muted",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More / Menu button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-foreground-muted active:bg-black/5 dark:active:bg-white/5 transition-all"
          >
            <span className="text-xl leading-none">⋯</span>
            <span className="text-[10px] font-semibold leading-none">Más</span>
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU OVERLAY (More options) ── */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-60 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Sheet */}
          <div className="relative bg-background-elevated rounded-t-3xl border-t border-border shadow-2xl p-6 pb-10 space-y-4 animate-slide-up">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

            <h3 className="text-base font-bold text-foreground">
              Más opciones
            </h3>

            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border active:bg-background-elevated transition-colors"
              >
                <span className="text-2xl">🏠</span>
                <span className="text-sm font-semibold text-foreground">
                  Volver al Home
                </span>
              </Link>

              <Link
                href="/app/gastos/configuracion"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border active:bg-background-elevated transition-colors"
              >
                <span className="text-2xl">⚙️</span>
                <span className="text-sm font-semibold text-foreground">
                  Configuración
                </span>
              </Link>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border">
                <span className="text-2xl">🌙</span>
                <span className="text-sm font-semibold text-foreground flex-1">
                  Tema
                </span>
                <ThemeToggle />
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-4 p-4 rounded-2xl bg-danger/10 border border-danger/20 active:bg-danger/20 transition-colors w-full text-left"
              >
                <span className="text-2xl">🚪</span>
                <span className="text-sm font-semibold text-danger">
                  Cerrar Sesión
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
