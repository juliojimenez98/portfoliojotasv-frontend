import type { Metadata } from "next";
import Link from "next/link";
import { getMyPollaGroups } from "@/actions/polla";
import type { IPollaGroup } from "@/types/polla";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import CreateGroupModal from "@/components/polla/CreateGroupModal";
import JoinGroupModal from "@/components/polla/JoinGroupModal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Polla Futbolera",
  description: "Tus grupos de pronósticos de fútbol.",
};

export default async function PollaHomePage() {
  let groups: IPollaGroup[] = [];

  try {
    groups = await getMyPollaGroups();
  } catch {
    groups = [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            ⚽ Polla Futbolera
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Pronósticos de fútbol — Mundial 2026
          </p>
        </div>
        <div className="flex gap-2">
          <JoinGroupModal />
          <CreateGroupModal />
        </div>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card variant="glass">
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <span className="text-6xl">🏆</span>
            <h2 className="text-xl font-bold text-foreground">
              Aún no tienes grupos
            </h2>
            <p className="text-sm text-foreground-muted max-w-sm">
              Crea un grupo para tu polla o únete a uno existente con un código
              de invitación.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const paid = group.members.filter((m) => m.hasPaid).length;
            const total = group.members.length;
            const pot = paid * group.entryFee;

            return (
              <Link key={group._id} href={`/app/polla_futbolera/${group._id}`}>
                <Card
                  variant="gradient"
                  hover
                  className="h-full transition-all duration-200"
                >
                  <CardHeader>
                    <div>
                      <p className="text-base font-bold text-foreground leading-tight">
                        {group.name}
                      </p>
                      <p className="text-xs text-foreground-muted mt-0.5">
                        {group.tournamentName}
                      </p>
                    </div>
                    <Badge variant="primary" dot>
                      {group.inviteCode}
                    </Badge>
                  </CardHeader>

                  {group.description && (
                    <p className="text-xs text-foreground-subtle mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-background-elevated">
                      <span className="text-lg font-bold text-foreground">
                        {total}
                      </span>
                      <span className="text-[10px] text-foreground-muted mt-0.5">
                        Jugadores
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-success/10">
                      <span className="text-lg font-bold text-success">
                        {paid}
                      </span>
                      <span className="text-[10px] text-success/80 mt-0.5">
                        Pagaron
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-primary/10">
                      <span className="text-sm font-bold text-primary">
                        {group.currency} {pot.toLocaleString("es-CL")}
                      </span>
                      <span className="text-[10px] text-primary/80 mt-0.5">
                        El Pozo
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
