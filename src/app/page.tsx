import Link from "next/link";
import { auth } from "@/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JotasVApp — Ecosistema de Aplicaciones",
  description: "Bienvenido a JotasVApp. Plataforma de aplicaciones para finanzas, salud y productividad personal.",
};

const APPS = [
  {
    id: "gastos",
    name: "Control de Gastos",
    category: "Finanzas Personales",
    description:
      "Gestión inteligente de finanzas personales, balances de cuentas bancarias, registro masivo de transacciones, presupuestos y control de suscripciones.",
    icon: "💰",
    href: "/app/gastos",
    gradient: "from-emerald-500/15 via-teal-500/5 to-transparent",
    accentBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25",
    tags: ["Finanzas", "Presupuestos", "Cuentas", "Reportes"],
    features: [
      "Balance general y cuentas bancarias",
      "Registro masivo y tabla rápida de gastos",
      "Control de suscripciones y pagos fijos",
      "Analítica y comparativas mensuales",
    ],
  },
  {
    id: "remedios",
    name: "Recordatorio de Remedios",
    category: "Salud & Hábitos",
    description:
      "Control estricto de medicamentos y horarios con alertas interactivas a tu Telegram, opciones de posponer, omitir y registro de historial.",
    icon: "💊",
    href: "/app/remedios",
    gradient: "from-sky-500/15 via-indigo-500/5 to-transparent",
    accentBg: "bg-gradient-to-br from-sky-500 to-indigo-600",
    badgeBg: "bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/20",
    borderHover: "hover:border-sky-500/50 hover:shadow-sky-500/10",
    buttonClass: "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/25",
    tags: ["Telegram Bot", "Recordatorios", "Salud", "Horarios"],
    features: [
      "Alertas interactivas en Telegram con botones",
      "Repetición periódica y snooze configurable",
      "Historial de tomas y motivos de omisión",
      "Sincronización en tiempo real con la web",
    ],
  },
];

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;
  const displayName = user?.name || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative selection:bg-primary selection:text-white">
      {/* ========== NAVBAR ========== */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                JJ
              </div>
              <span className="font-extrabold text-lg tracking-tight gradient-text">
                JotasVApp
              </span>
            </Link>

            <div className="flex items-center gap-3 md:gap-5">
              <Link
                href="/me"
                className="text-xs sm:text-sm text-foreground-muted hover:text-foreground font-medium transition-colors"
              >
                Sobre Mí
              </Link>

              {user ? (
                <Link
                  href="/app"
                  className="text-xs sm:text-sm px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-1.5"
                >
                  <span>🚀</span>
                  <span>Mi Panel ({displayName})</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-xs sm:text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center gap-1.5"
                >
                  <span>🔐</span>
                  <span>Iniciar Sesión</span>
                </Link>
              )}

              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* ========== MAIN HERO SECTION ========== */}
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-background-elevated to-secondary/15 border border-primary/20 p-6 md:p-12 shadow-xl backdrop-blur-xs text-center md:text-left">
            <div className="absolute -top-28 -right-28 w-80 h-80 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-secondary/25 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Ecosistema Digital Privado</span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
                  Bienvenido a <span className="gradient-text">JotasVApp</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-foreground-muted leading-relaxed">
                  Plataforma centralizada de aplicaciones inteligentes para finanzas personales, recordatorios médicos interactivos y herramientas a medida.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {user ? (
                    <Link
                      href="/app"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all active:scale-95"
                    >
                      <span>🚀 Ingresar a Mis Apps</span>
                      <span>→</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all active:scale-95"
                    >
                      <span>🔐 Iniciar Sesión</span>
                      <span>→</span>
                    </Link>
                  )}

                  <Link
                    href="/me"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-background/80 border border-border text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors text-sm font-semibold"
                  >
                    <span>👤 Sobre Mí / Portafolio</span>
                  </Link>
                </div>
              </div>

              {/* Status / User capsule */}
              <div className="bg-background/80 dark:bg-black/40 border border-border/80 p-5 rounded-3xl backdrop-blur-md self-center md:self-auto max-w-xs w-full shadow-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                    {user ? (displayName?.charAt(0).toUpperCase() || "U") : "J"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground-subtle">
                      {user ? "Sesión Activa" : "Estado del Sistema"}
                    </p>
                    <p className="font-bold text-foreground text-sm truncate">
                      {user ? displayName : "JotasVApp Online"}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/50 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-foreground-muted">
                    <span>Módulos activos:</span>
                    <span className="font-bold text-foreground">2 Apps</span>
                  </div>
                  <div className="flex justify-between items-center text-foreground-muted">
                    <span>Disponibilidad:</span>
                    <span className="font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      100% Operativo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== APPS SHOWCASE SECTION ========== */}
          <section id="apps" className="space-y-6">
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center justify-center md:justify-start gap-2.5">
                <span>🚀</span> Aplicaciones del Ecosistema
              </h2>
              <p className="text-sm text-foreground-muted">
                Selecciona un módulo para acceder directamente con tu cuenta.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {APPS.map((app) => {
                const targetHref = user ? app.href : `/login?callbackUrl=${encodeURIComponent(app.href)}`;

                return (
                  <div
                    key={app.id}
                    className={`group relative overflow-hidden rounded-3xl bg-background-card border border-border transition-all duration-300 flex flex-col justify-between hover:shadow-2xl ${app.borderHover}`}
                  >
                    {/* Gradient hover background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${app.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    <div className="relative z-10 p-6 md:p-8 space-y-5">
                      {/* Top Bar: Icon + Category Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`w-14 h-14 rounded-2xl ${app.accentBg} flex items-center justify-center text-3xl shadow-lg text-white group-hover:scale-105 transition-transform duration-300`}
                        >
                          {app.icon}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${app.badgeBg}`}
                        >
                          {app.category}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-foreground-muted mt-2 leading-relaxed">
                          {app.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-1.5 pt-3 border-t border-border/50">
                        <p className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
                          Módulos y funciones:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-foreground-muted">
                          {app.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {app.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-foreground-subtle text-[11px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="relative z-10 p-6 md:p-8 pt-0">
                      <Link
                        href={targetHref}
                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 group-hover:gap-3 ${app.buttonClass}`}
                      >
                        <span>
                          {user ? `Ingresar a ${app.name}` : `Iniciar sesión en ${app.name}`}
                        </span>
                        <span className="text-base font-bold transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 px-4 border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-foreground-subtle">
            © {new Date().getFullYear()} JotasVApp • Desarrollado por{" "}
            <Link href="/me" className="text-foreground hover:text-primary font-semibold transition-colors">
              Julio Jiménez
            </Link>
          </p>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link href="/me" className="text-foreground-muted hover:text-foreground transition-colors font-medium">
              Sobre Mí
            </Link>
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Acceso a Apps
            </Link>
            <a
              href="https://github.com/juliojimenez98"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
