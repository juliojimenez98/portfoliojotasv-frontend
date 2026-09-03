import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Aplicaciones | Julio Jiménez",
  description: "Ecosistema de aplicaciones personales y herramientas.",
};

interface AppCardConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
  gradient: string;
  accentBg: string;
  badgeBg: string;
  borderHover: string;
  buttonClass: string;
  features: string[];
  tags: string[];
}

const APPS: AppCardConfig[] = [
  {
    id: "gastos",
    name: "Control de Gastos",
    description:
      "Gestión inteligente de finanzas personales, balances por cuenta, registro masivo de transacciones, presupuestos y suscripciones recurrentes.",
    icon: "💰",
    category: "Finanzas",
    href: "/app/gastos",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    accentBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
    tags: ["Finanzas", "Presupuesto", "Cuentas", "Reportes"],
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
    description:
      "Control estricto de medicamentos y horarios con alertas interactivas a tu Telegram, opciones de posponer, omitir y registro de historial.",
    icon: "💊",
    category: "Salud & Hábitos",
    href: "/app/remedios",
    gradient: "from-sky-500/10 via-indigo-500/5 to-transparent",
    accentBg: "bg-gradient-to-br from-sky-500 to-indigo-600",
    badgeBg: "bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/20",
    borderHover: "hover:border-sky-500/50 hover:shadow-sky-500/10",
    buttonClass: "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20",
    tags: ["Telegram Bot", "Recordatorios", "Salud", "Horarios"],
    features: [
      "Alertas interactivas en Telegram con botones",
      "Repetición periódica y snooze configurable",
      "Historial de tomas y motivos de omisión",
      "Sincronización en tiempo real con la web",
    ],
  },
];

export default async function AppHubPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { name, email, isAdmin, allowedApps = [] } = session.user;

  // Filter apps by user permissions (admin has access to everything)
  const accessibleApps = APPS.filter(
    (app) => isAdmin || allowedApps.includes(app.id),
  );

  const displayName = name || email?.split("@")[0] || "Usuario";

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto py-2">
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background-elevated to-secondary/10 border border-border/80 p-6 md:p-10 shadow-lg backdrop-blur-xs">
        {/* Background ambient blurs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👋</span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Ecosistema Personal
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              ¡Hola, <span className="gradient-text">{displayName}</span>!
            </h1>
            <p className="text-sm md:text-base text-foreground-muted max-w-xl">
              Bienvenido a tu panel de aplicaciones. Selecciona la herramienta a la que deseas acceder para comenzar.
            </p>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-3.5 bg-background/80 dark:bg-black/30 border border-border/60 p-3 rounded-2xl backdrop-blur-md self-start md:self-auto">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center text-base shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>{displayName}</span>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-foreground-subtle text-[11px] truncate max-w-[160px]">
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── APPS GRID SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>🚀</span> Tus Aplicaciones Disponibles
            </h2>
            <p className="text-xs text-foreground-muted">
              Tienes acceso a {accessibleApps.length}{" "}
              {accessibleApps.length === 1 ? "aplicación" : "aplicaciones"}.
            </p>
          </div>
        </div>

        {accessibleApps.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-background-elevated border border-dashed border-border space-y-4">
            <div className="text-5xl opacity-40">🔒</div>
            <h3 className="text-base font-bold text-foreground">
              Sin aplicaciones asignadas
            </h3>
            <p className="text-xs text-foreground-muted max-w-md mx-auto">
              Tu cuenta aún no tiene aplicaciones activas. Por favor solicita acceso al administrador del sistema.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleApps.map((app) => (
              <div
                key={app.id}
                className={`group relative overflow-hidden rounded-3xl bg-background-card border border-border transition-all duration-300 flex flex-col justify-between hover:shadow-xl ${app.borderHover}`}
              >
                {/* Gradient background hover effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${app.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10 p-6 space-y-5">
                  {/* Top card bar: Icon + Category Badge */}
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

                  {/* App Info */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-xs text-foreground-muted mt-2 leading-relaxed line-clamp-3">
                      {app.description}
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <p className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
                      Incluye:
                    </p>
                    <ul className="space-y-1 text-xs text-foreground-muted">
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
                        className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-foreground-subtle text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Button Footer */}
                <div className="relative z-10 p-6 pt-0">
                  <Link
                    href={app.href}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 group-hover:gap-3 ${app.buttonClass}`}
                  >
                    <span>Ingresar a {app.name}</span>
                    <span className="text-base font-bold transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            ))}

            {/* ── ADMIN CARD (Only if isAdmin) ── */}
            {isAdmin && (
              <div className="group relative overflow-hidden rounded-3xl bg-background-card border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-fuchsia-500/5 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-3xl shadow-lg text-white group-hover:scale-105 transition-transform duration-300">
                      🛡️
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-purple-500/10 text-purple-400 border-purple-500/20">
                      Sistema
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-purple-400 transition-colors">
                      Panel de Administración
                    </h3>
                    <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
                      Gestión global de usuarios, asignación de permisos a aplicaciones, roles de seguridad y configuración del ecosistema.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <p className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
                      Herramientas de Admin:
                    </p>
                    <ul className="space-y-1 text-xs text-foreground-muted">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span>Crear y administrar cuentas de usuarios</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span>Habilitar y revocar acceso a apps</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span>Control de contraseñas y roles</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {["Usuarios", "Seguridad", "Permisos"].map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 p-6 pt-0">
                  <Link
                    href="/admin/users"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition-all duration-200 group-hover:gap-3"
                  >
                    <span>Panel de Control</span>
                    <span className="text-base font-bold transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
