"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IPollaPrediction } from "@/types/polla";
import { setSpecialPredictions } from "@/actions/polla";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Props {
  groupId: string;
  myPredictions: IPollaPrediction | null;
  actualChampion?: string;
  actualTopScorer?: string;
}

export default function SpecialPredictionsCard({
  groupId,
  myPredictions,
  actualChampion,
  actualTopScorer,
}: Props) {
  const router = useRouter();
  const [champion, setChampion] = useState(
    myPredictions?.predictedChampion ?? "",
  );
  const [topScorer, setTopScorer] = useState(
    myPredictions?.predictedTopScorer ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await setSpecialPredictions(groupId, {
        predictedChampion: champion || undefined,
        predictedTopScorer: topScorer || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">
          🌟 Predicciones Especiales
        </h3>
        {(myPredictions?.championBonusEarned ||
          myPredictions?.topScorerBonusEarned) && (
          <Badge variant="success" dot>
            Bonos ganados
          </Badge>
        )}
      </CardHeader>

      <p className="text-sm text-foreground-muted mb-4">
        Elige el campeón y el goleador del torneo antes de que comience. Si
        aciertas obtendrás puntos extra.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Champion */}
        <div className="p-4 rounded-xl bg-background border border-border">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              🏆 Campeón del Torneo
            </label>
            {actualChampion && (
              <span className="text-xs text-foreground-muted">
                Real:{" "}
                <span className="font-bold text-foreground">
                  {actualChampion}
                </span>
              </span>
            )}
          </div>
          <input
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            placeholder="Ej: Argentina"
            className="w-full px-3 py-2 rounded-lg bg-background-elevated border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
          />
          {myPredictions?.championBonusEarned && (
            <p className="text-xs text-success mt-1 font-bold">
              ✓ ¡Acertaste el campeón! Bono ganado.
            </p>
          )}
        </div>

        {/* Top Scorer */}
        <div className="p-4 rounded-xl bg-background border border-border">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              ⚽ Goleador del Torneo
            </label>
            {actualTopScorer && (
              <span className="text-xs text-foreground-muted">
                Real:{" "}
                <span className="font-bold text-foreground">
                  {actualTopScorer}
                </span>
              </span>
            )}
          </div>
          <input
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            placeholder="Ej: Kylian Mbappé"
            className="w-full px-3 py-2 rounded-lg bg-background-elevated border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
          />
          {myPredictions?.topScorerBonusEarned && (
            <p className="text-xs text-success mt-1 font-bold">
              ✓ ¡Acertaste el goleador! Bono ganado.
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger bg-danger/10 rounded-lg p-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
            saved
              ? "bg-success text-white"
              : "bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          }`}
        >
          {saving
            ? "Guardando..."
            : saved
              ? "✓ Guardado"
              : "Guardar Predicciones"}
        </button>
      </form>
    </Card>
  );
}
