import { Metadata } from 'next';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { getUsers } from '@/actions/users';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboardPage() {
  let users = [];
  try {
    users = await getUsers();
  } catch (error) {
    console.error('Failed to fetch users', error);
  }

  const adminsCount = users.filter((u: any) => u.isAdmin).length;
  const regularUsersCount = users.length - adminsCount;
  const gastosUsersCount = users.filter((u: any) => u.allowedApps?.includes('gastos')).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glow" padding="lg">
          <CardTitle className="text-center text-foreground-muted text-sm uppercase tracking-widest mb-2">Total Usuarios</CardTitle>
          <p className="text-5xl font-bold text-center text-foreground">{users.length}</p>
        </Card>
        
        <Card variant="gradient" padding="lg">
          <CardTitle className="text-center text-foreground-muted text-sm uppercase tracking-widest mb-2">Administradores</CardTitle>
          <p className="text-5xl font-bold text-center text-red-500">{adminsCount}</p>
        </Card>

        <Card variant="default" padding="lg">
          <CardTitle className="text-center text-foreground-muted text-sm uppercase tracking-widest mb-2">Acceso a Gastos</CardTitle>
          <p className="text-5xl font-bold text-center text-emerald-500">{gastosUsersCount}</p>
        </Card>
      </div>

      <Card variant="default" padding="md">
        <CardHeader>
          <CardTitle>Bienvenido al Panel de Administración</CardTitle>
        </CardHeader>
        <div className="p-4 md:p-6 pt-0">
          <p className="text-foreground-muted text-sm leading-relaxed">
            Desde aquí tienes control total sobre el Ecosistema Personal. En la sección de <strong>Usuarios</strong> podrás registrar manualmente a nuevas personas, darles permisos de administrador o restringirles el acceso a ciertas aplicaciones como la de Gastos.
          </p>
        </div>
      </Card>
    </div>
  );
}
