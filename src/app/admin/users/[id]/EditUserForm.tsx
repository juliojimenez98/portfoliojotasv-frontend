'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { updateUser, deleteUser } from '@/actions/users';

export default function EditUserForm({ user }: { user: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      isAdmin: formData.get('isAdmin') === 'on',
      allowedApps: formData.getAll('allowedApps') as string[],
    };

    try {
      await updateUser(user._id, data);
      router.push('/admin/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el usuario');
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este usuario permanentemente?')) return;
    
    setIsPending(true);
    try {
      await deleteUser(user._id);
      router.push('/admin/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
      setIsPending(false);
    }
  };

  return (
    <Card variant="glow" padding="lg">
      <div className="p-4 md:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground-muted">Usuario</p>
              <p className="text-lg font-bold text-foreground">{user.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground-muted">Email</p>
              <p className="text-lg font-bold text-foreground">{user.email}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Modificar Roles y Permisos</h3>
            
            <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-background-light/50 cursor-pointer hover:bg-white/5 transition-colors">
              <input 
                type="checkbox" 
                name="isAdmin" 
                defaultChecked={user.isAdmin}
                className="w-5 h-5 rounded border-white/10 bg-background text-red-500 focus:ring-red-500/50" 
              />
              <div>
                <p className="font-medium text-foreground">Administrador</p>
                <p className="text-xs text-foreground-muted">Otorga acceso total al Panel de Control.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-background-light/50 cursor-pointer hover:bg-white/5 transition-colors">
              <input 
                type="checkbox" 
                name="allowedApps" 
                value="gastos" 
                defaultChecked={user.allowedApps?.includes('gastos')}
                className="w-5 h-5 rounded border-white/10 bg-background text-emerald-500 focus:ring-emerald-500/50" 
              />
              <div>
                <p className="font-medium text-foreground">App: Control de Gastos</p>
                <p className="text-xs text-foreground-muted">Permite registrar y visualizar finanzas personales.</p>
              </div>
            </label>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Eliminar Usuario
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}
