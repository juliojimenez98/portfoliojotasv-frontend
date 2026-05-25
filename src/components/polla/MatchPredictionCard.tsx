"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IPollaMatch, MatchPrediction } from "@/types/polla";
import { upsertMatchPrediction } from "@/actions/polla";
import SetMatchResultModal from "./SetMatchResultModal";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-foreground-subtle/20 text-foreground-muted",
  live: "bg-danger/15 text-danger animate-pulse",
  finished: "bg-success/15 text-success",
};
const STATUS_LABELS: Record<string, string> = {
  scheduled: "Por jugar",
  live: "En vivo",
  finished: "Finalizado",
};

interface Props {
  match: IPollaMatch;
  groupId: string;
  existingPrediction: MatchPrediction | null;
  isAdmin?: boolean;
}

export default function MatchPredictionCard({
  match,
  groupId,
  existingPrediction,
  isAdmin = false,
}: Props) {
  const router = useRouter();
  const [home, setHome] = useState<string>(
    existingPrediction?.homeScore?.toString() ?? "",
  );
  const [away, setAway] = useState<string>(
    existingPrediction?.awayScore?.toString() ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canBet = match.isBettingOpen && match.status === "scheduled";

  const handleSave = async () => {
    if (home === "" || away === "") return;
    setSaving(true);
    setError(null);
    try {
      await upsertMatchPrediction(
        groupId,
        match._id,
        Number(home),
        Number(away),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const hasPrediction = existingPrediction != null;
  const predPointsEarned = existingPrediction?.pointsEarned;

  return (
    <div className="p-4 rounded-xl border border-border bg-background-elevated hover:border-border-hover transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[match.status]}`}
        >
          {STATUS_LABELS[match.status]}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          {match.matchDate && (
            <span className="text-xs text-foreground-muted">
              {new Date(match.matchDate).toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
          {match.status === "finished" && hasPrediction && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                predPointsEarned! > 0
                  ? "bg-success/15 text-success"
                  : "bg-background text-foreground-muted"
              }`}
            >
              {predPointsEarned! > 0 ? `+${predPointsEarned} pts ⭐` : "0 pts"}
            </span>
          )}
          {/* Admin: load real result */}
          {isAdmin && <SetMatchResultModal match={match} groupId={groupId} />}
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex-1 text-right">
          <p className="text-sm font-bold text-foreground">{match.homeTeam}</p>
        </div>

        {/* Real score or prediction inputs */}
        {match.status === "finished" ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border">
              <span className="text-lg font-black text-foreground">
                {match.homeScore}
              </span>
              <span className="text-foreground-muted font-bold">—</span>
              <span className="text-lg font-black text-foreground">
                {match.awayScore}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="number"
              min="0"
              max="99"
              value={home}
              onChange={(e) => setHome(e.target.value)}
              disabled={!canBet}
              className="w-10 h-10 text-center text-sm font-bold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
            <span className="text-foreground-muted font-bold text-sm">—</span>
            <input
              type="number"
              min="0"
              max="99"
              value={away}
              onChange={(e) => setAway(e.target.value)}
              disabled={!canBet}
              className="w-10 h-10 text-center text-sm font-bold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
          </div>
        )}

        {/* Away */}
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-foreground">{match.awayTeam}</p>
        </div>
      </div>

      {/* My prediction label (when match is finished) */}
      {match.status === "finished" && hasPrediction && (
        <p className="text-center text-xs text-foreground-muted mt-2">
          Tu predicción:{" "}
          <span className="font-bold">
            {existingPrediction.homeScore} — {existingPrediction.awayScore}
          </span>
        </p>
      )}

      {/* Save button */}
      {canBet && (
        <div className="mt-3 flex flex-col items-center gap-1">
          <button
            onClick={handleSave}
            disabled={saving || home === "" || away === ""}
            className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${
              saved
                ? "bg-success text-white"
                : "bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            }`}
          >
            {saving
              ? "Guardando..."
              : saved
                ? "✓ Guardado"
                : hasPrediction
                  ? "Actualizar"
                  : "Guardar"}
          </button>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
