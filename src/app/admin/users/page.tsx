import { Metadata } from "next";
import Link from "next/link";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getUsers } from "@/actions/users";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestión de Usuarios",
};

export default async function AdminUsersPage() {
  let users = [];
  try {
    users = await getUsers();
  } catch (error) {
    console.error("Failed to fetch users", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Gestión de Usuarios
        </h2>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98]"
        >
          + Nuevo Usuario
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user: any) => (
          <Card key={user._id} variant="glow" hover>
            <CardHeader>
              <div className="flex justify-between items-start w-full">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {user.username}
                  </h3>
                  <p className="text-sm text-foreground-muted">{user.email}</p>
                </div>
                {user.isAdmin && (
                  <Badge variant="danger" dot>
                    Admin
                  </Badge>
                )}
              </div>
            </CardHeader>
            <div className="p-4 md:p-6 pt-0">
              <div className="mt-4">
                <p className="text-xs text-foreground-subtle uppercase mb-2">
                  Acceso a Apps
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.allowedApps?.length > 0 ? (
                    user.allowedApps.map((app: string) => (
                      <Badge key={app} variant="primary">
                        {app}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-foreground-muted">
                      Sin accesos
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/admin/users/${user._id}`}
                  title="Editar permisos"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground-muted hover:text-white text-sm font-medium transition-colors"
                >
                  ✏️ Editar
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
