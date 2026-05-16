'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { createUser } from '@/actions/users';

export default function NewUserPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      isAdmin: formData.get('isAdmin') === 'on',
      allowedApps: formData.getAll('allowedApps') as string[],
    };

    try {
      await createUser(data);
      router.push('/admin/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario');
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Crear Nuevo Usuario</h2>
        <Link href="/admin/users" className="text-sm text-foreground-muted hover:text-white transition-colors">
          &larr; Volver
        </Link>
      </div>

      <Card variant="glow" padding="lg">
        <div className="p-4 md:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground-muted">Usuario</label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full bg-background-light border border-white/5 rounded-xl py-2.5 px-4 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Ej. juanperez"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground-muted">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-background-light border border-white/5 rounded-xl py-2.5 px-4 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground-muted">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-background-light border border-white/5 rounded-xl py-2.5 px-4 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <h3 className="text-sm font-medium text-foreground">Permisos y Roles</h3>
              
              <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-background-light/50 cursor-pointer hover:bg-white/5 transition-colors">
                <input type="checkbox" name="isAdmin" className="w-5 h-5 rounded border-white/10 bg-background text-red-500 focus:ring-red-500/50" />
                <div>
                  <p className="font-medium text-foreground">Administrador</p>
                  <p className="text-xs text-foreground-muted">Otorga acceso total al Panel de Control.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-background-light/50 cursor-pointer hover:bg-white/5 transition-colors">
                <input type="checkbox" name="allowedApps" value="gastos" className="w-5 h-5 rounded border-white/10 bg-background text-emerald-500 focus:ring-emerald-500/50" />
                <div>
                  <p className="font-medium text-foreground">App: Control de Gastos</p>
                  <p className="text-xs text-foreground-muted">Permite registrar y visualizar finanzas personales.</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
