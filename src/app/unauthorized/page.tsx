import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-danger/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative text-center max-w-md animate-fade-in">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Acceso No Autorizado
        </h1>
        <p className="text-foreground-muted mb-8 leading-relaxed">
          No tienes permisos para acceder a esta aplicación.
          Contacta al administrador si necesitas acceso.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
          >
            Ir al Portafolio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground-muted hover:text-foreground hover:border-border-hover transition-all"
          >
            Cambiar de Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
