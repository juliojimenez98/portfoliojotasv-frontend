'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-background/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
            <span className="text-3xl">🛑</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Registro Cerrado</h1>
          <p className="text-sm text-foreground-muted mt-2">
            El registro público está temporalmente deshabilitado.
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-foreground-subtle mb-6">
            Si necesitas una cuenta o requieres acceso a alguna de las aplicaciones del ecosistema, por favor contacta al administrador del sistema.
          </p>
          <Link
            href="/login"
            className="w-full inline-block py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
          >
            Volver al Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
