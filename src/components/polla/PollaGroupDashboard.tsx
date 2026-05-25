"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  GroupDashboard,
  IPollaMatch,
  IPollaPrediction,
  LeaderboardEntry,
} from "@/types/polla";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { toggleMemberPayment, removeGroupMember } from "@/actions/polla";
import MatchPredictionCard from "./MatchPredictionCard";
import SpecialPredictionsCard from "./SpecialPredictionsCard";
import AddMemberModal from "./AddMemberModal";
import AddMatchModal from "./AddMatchModal";
import BulkImportMatchesModal from "./BulkImportMatchesModal";

const STAGE_LABELS: Record<string, string> = {
  group: "Fase de Grupos",
  round_of_16: "Octavos de Final",
  quarterfinal: "Cuartos de Final",
  semifinal: "Semifinal",
  final: "Final",
};

const STAGE_ORDER = [
  "group",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "final",
];

interface Props {
  dashboard: GroupDashboard;
  matches: IPollaMatch[];
  myPredictions: IPollaPrediction | null;
  currentUserId: string;
}

export default function PollaGroupDashboard({
  dashboard,
  matches,
  myPredictions,
  currentUserId,
}: Props) {
  const router = useRouter();
  const { group, finance, leaderboard } = dashboard;
  const isAdmin = group.adminId === currentUserId;
  const [activeTab, setActiveTab] = useState<
    "leaderboard" | "matches" | "payments" | "special"
  >("leaderboard");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const handleTogglePayment = async (userId: string) => {
    setTogglingId(userId);
    try {
      await toggleMemberPayment(group._id, userId);
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("¿Seguro que quieres eliminar a este miembro del grupo?"))
      return;
    setRemovingId(userId);
    try {
      await removeGroupMember(group._id, userId);
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  };

  // Group matches by stage
  const matchesByStage = STAGE_ORDER.reduce(
    (acc, stage) => {
      const stageMates = matches.filter((m) => m.stage === stage);
      if (stageMates.length > 0) acc[stage] = stageMates;
      return acc;
    },
    {} as Record<string, IPollaMatch[]>,
  );

  const predMap = new Map(
    (myPredictions?.matchPredictions || []).map((mp) => [mp.matchId, mp]),
  );

  const tabs = [
    { key: "leaderboard", label: "🏅 Tabla", mobileLabel: "Tabla" },
    { key: "matches", label: "⚽ Partidos", mobileLabel: "Partidos" },
    { key: "payments", label: "💰 El Pozo", mobileLabel: "Pozo" },
    { key: "special", label: "🌟 Especiales", mobileLabel: "Extras" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {group.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-sm text-foreground-muted">
                {group.tournamentName}
              </p>
              {isAdmin && (
                <Badge variant="warning" dot>
                  👑 Admin
                </Badge>
              )}
            </div>
          </div>
          <Badge
            variant="primary"
            className="text-sm px-3 py-1 font-mono font-bold tracking-widest shrink-0"
          >
            {group.inviteCode}
          </Badge>
        </div>
        {group.description && (
          <p className="text-sm text-foreground-subtle mt-2">
            {group.description}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="gradient" padding="sm">
          <p className="text-xs text-foreground-muted font-semibold uppercase tracking-wider">
            El Pozo 💰
          </p>
          <p className="text-xl font-bold text-primary mt-1">
            {group.currency} {finance.pot.toLocaleString("es-CL")}
          </p>
          <p className="text-[11px] text-foreground-subtle mt-0.5">
            {finance.paidCount} pagaron × {group.currency}{" "}
            {group.entryFee.toLocaleString("es-CL")}
          </p>
        </Card>

        <Card variant="gradient" padding="sm">
          <p className="text-xs text-foreground-muted font-semibold uppercase tracking-wider">
            Jugadores 👥
          </p>
          <p className="text-xl font-bold text-foreground mt-1">
            {group.members.length}
          </p>
          <p className="text-[11px] text-foreground-subtle mt-0.5">
            en el grupo
          </p>
        </Card>

        <Card variant="gradient" padding="sm">
          <p className="text-xs text-success font-semibold uppercase tracking-wider">
            Pagaron ✅
          </p>
          <p className="text-xl font-bold text-success mt-1">
            {finance.paidCount}
          </p>
          <p className="text-[11px] text-success/70 mt-0.5">confirmados</p>
        </Card>

        <Card variant="gradient" padding="sm">
          <p className="text-xs text-warning font-semibold uppercase tracking-wider">
            Pendientes ⏳
          </p>
          <p className="text-xl font-bold text-warning mt-1">
            {finance.pendingCount}
          </p>
          <p className="text-[11px] text-warning/70 mt-0.5">por pagar</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-background-elevated rounded-xl border border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-md"
                : "text-foreground-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.mobileLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab: Leaderboard */}
      {activeTab === "leaderboard" && (
        <Card variant="glass">
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              Tabla de Posiciones
            </h3>
            <Badge variant="primary">{leaderboard.length} jugadores</Badge>
          </CardHeader>

          {leaderboard.length === 0 ? (
            <p className="text-sm text-foreground-subtle text-center py-8">
              Aún no hay puntos registrados.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry: LeaderboardEntry) => (
                <div
                  key={entry.userId.toString()}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    entry.rank === 1
                      ? "border-yellow-400/30 bg-yellow-400/5"
                      : entry.rank === 2
                        ? "border-slate-400/30 bg-slate-400/5"
                        : entry.rank === 3
                          ? "border-orange-400/30 bg-orange-400/5"
                          : "border-border hover:border-border-hover"
                  }`}
                >
                  <span
                    className={`text-lg font-black w-8 text-center shrink-0 ${
                      entry.rank === 1
                        ? "text-yellow-400"
                        : entry.rank === 2
                          ? "text-slate-400"
                          : entry.rank === 3
                            ? "text-orange-400"
                            : "text-foreground-muted"
                    }`}
                  >
                    {entry.rank === 1
                      ? "🥇"
                      : entry.rank === 2
                        ? "🥈"
                        : entry.rank === 3
                          ? "🥉"
                          : `#${entry.rank}`}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {entry.username}
                    </p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      {entry.predictedChampion && (
                        <span className="text-[10px] text-foreground-subtle">
                          🏆 {entry.predictedChampion}
                        </span>
                      )}
                      {entry.championBonusEarned && (
                        <Badge variant="success" className="text-[10px] py-0">
                          +Campeón
                        </Badge>
                      )}
                      {entry.topScorerBonusEarned && (
                        <Badge variant="warning" className="text-[10px] py-0">
                          +Goleador
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-black text-foreground">
                      {entry.totalPoints}
                    </p>
                    <p className="text-[10px] text-foreground-muted">pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border/60">
            <p className="text-xs text-foreground-muted">
              <span className="font-bold">Reglas:</span> Resultado exacto:{" "}
              <span className="text-primary font-bold">
                {group.scoringConfig.exactScore} pts
              </span>{" "}
              · Tendencia correcta:{" "}
              <span className="text-primary font-bold">
                {group.scoringConfig.correctTrend} pts
              </span>{" "}
              · Bono campeón:{" "}
              <span className="text-success font-bold">
                +{group.scoringConfig.championBonus} pts
              </span>{" "}
              · Bono goleador:{" "}
              <span className="text-warning font-bold">
                +{group.scoringConfig.topScorerBonus} pts
              </span>
            </p>
          </div>
        </Card>
      )}

      {/* Tab: Matches & Predictions */}
      {activeTab === "matches" && (
        <div className="space-y-6">
          {/* Admin banner */}
          {isAdmin && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div>
                <p className="text-sm font-bold text-foreground">
                  👑 Gestión de partidos
                </p>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Agrega partidos y carga los resultados reales para calcular
                  los puntos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-primary/40 text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
                >
                  📋 Importar lote
                </button>
                <AddMatchModal groupId={group._id} />
              </div>
            </div>
          )}
          {showBulkImport && (
            <BulkImportMatchesModal
              groupId={group._id}
              onClose={() => setShowBulkImport(false)}
              onSuccess={() => setShowBulkImport(false)}
            />
          )}

          {Object.keys(matchesByStage).length === 0 ? (
            <Card variant="glass">
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="text-4xl">📋</span>
                <p className="text-sm text-foreground-subtle">
                  {isAdmin
                    ? 'Usa el botón "Agregar partido" para cargar el fixture.'
                    : "No hay partidos cargados aún. El administrador debe añadirlos."}
                </p>
              </div>
            </Card>
          ) : (
            Object.entries(matchesByStage).map(([stage, stageMatches]) => (
              <div key={stage} className="space-y-3">
                <h3 className="text-sm font-bold text-foreground-muted uppercase tracking-wider">
                  {STAGE_LABELS[stage] || stage}
                </h3>
                {stageMatches.map((match) => (
                  <MatchPredictionCard
                    key={match._id}
                    match={match}
                    groupId={group._id}
                    existingPrediction={predMap.get(match._id) ?? null}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Payments */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          {/* Admin: Add member */}
          {isAdmin && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <div>
                <p className="text-sm font-bold text-foreground">
                  👑 Gestión de miembros
                </p>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Agrega participantes por su nombre de usuario o comparte el
                  código{" "}
                  <span className="font-mono font-bold text-primary">
                    {group.inviteCode}
                  </span>
                </p>
              </div>
              <AddMemberModal groupId={group._id} />
            </div>
          )}

          {/* Paid */}
          <Card variant="glass">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">
                ✅ Pagaron
              </h3>
              <Badge variant="success">{finance.paidCount}</Badge>
            </CardHeader>
            {finance.paid.length === 0 ? (
              <p className="text-sm text-foreground-subtle text-center py-6">
                Nadie ha pagado todavía.
              </p>
            ) : (
              <div className="space-y-2">
                {finance.paid.map((member) => {
                  const isMemberAdmin =
                    member.userId.toString() === group.adminId;
                  return (
                    <div
                      key={member.userId.toString()}
                      className="flex items-center justify-between p-3 rounded-lg border border-success/20 bg-success/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-success text-sm">✓</span>
                        <span className="text-sm font-semibold text-foreground">
                          {member.username}
                        </span>
                        {isMemberAdmin && (
                          <span className="text-xs text-warning">👑</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {member.paidAt && (
                          <span className="text-xs text-foreground-muted">
                            {new Date(member.paidAt).toLocaleDateString(
                              "es-CL",
                            )}
                          </span>
                        )}
                        {isAdmin && !isMemberAdmin && (
                          <>
                            <button
                              onClick={() =>
                                handleTogglePayment(member.userId.toString())
                              }
                              disabled={togglingId === member.userId.toString()}
                              className="text-xs px-2 py-1 rounded-lg border border-warning/30 text-warning hover:bg-warning/10 transition-colors disabled:opacity-50"
                            >
                              {togglingId === member.userId.toString()
                                ? "..."
                                : "Revertir"}
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveMember(member.userId.toString())
                              }
                              disabled={removingId === member.userId.toString()}
                              className="text-xs px-2 py-1 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                            >
                              {removingId === member.userId.toString()
                                ? "..."
                                : "Quitar"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Pending */}
          <Card variant="glass">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">
                ⏳ Pendientes de Pago
              </h3>
              <Badge variant="warning">{finance.pendingCount}</Badge>
            </CardHeader>
            {finance.pending.length === 0 ? (
              <p className="text-sm text-foreground-subtle text-center py-6">
                ¡Todos han pagado! 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {finance.pending.map((member) => {
                  const isMemberAdmin =
                    member.userId.toString() === group.adminId;
                  return (
                    <div
                      key={member.userId.toString()}
                      className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-warning text-sm">○</span>
                        <span className="text-sm font-semibold text-foreground">
                          {member.username}
                        </span>
                        {isMemberAdmin && (
                          <span className="text-xs text-warning">👑</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleTogglePayment(member.userId.toString())
                            }
                            disabled={togglingId === member.userId.toString()}
                            className="text-xs px-3 py-1 rounded-lg bg-success text-white font-bold hover:bg-success/90 transition-colors disabled:opacity-50"
                          >
                            {togglingId === member.userId.toString()
                              ? "..."
                              : "Marcar Pagado"}
                          </button>
                          {!isMemberAdmin && (
                            <button
                              onClick={() =>
                                handleRemoveMember(member.userId.toString())
                              }
                              disabled={removingId === member.userId.toString()}
                              className="text-xs px-2 py-1 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                            >
                              {removingId === member.userId.toString()
                                ? "..."
                                : "Quitar"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Pot Summary */}
          <Card variant="glow" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground-muted uppercase tracking-wider">
                  Pozo Total Acumulado 💰
                </p>
                <p className="text-3xl font-black text-primary mt-1">
                  {group.currency} {finance.pot.toLocaleString("es-CL")}
                </p>
                <p className="text-xs text-foreground-muted mt-1">
                  {finance.paidCount} de {group.members.length} miembros pagaron
                </p>
              </div>
              <span className="text-5xl">🏆</span>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Special Predictions */}
      {activeTab === "special" && (
        <SpecialPredictionsCard
          groupId={group._id}
          myPredictions={myPredictions}
          actualChampion={group.actualChampion}
          actualTopScorer={group.actualTopScorer}
        />
      )}
    </div>
  );
}
