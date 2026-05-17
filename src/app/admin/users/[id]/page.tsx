import { Metadata } from 'next';
import Link from 'next/link';
import { getUser } from '@/actions/users';
import EditUserForm from './EditUserForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editar Usuario',
};

export default async function EditUserPage({ params }: { params: { id: string } }) {
  let user = null;
  let error = '';

  try {
    user = await getUser(params.id);
  } catch (err: any) {
    error = err.message || 'No se pudo cargar el usuario';
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Editar Permisos</h2>
        <Link href="/admin/users" className="text-sm text-foreground-muted hover:text-white transition-colors">
          &larr; Volver
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-center">
          {error}
        </div>
      ) : (
        <EditUserForm user={user} />
      )}
    </div>
  );
}
