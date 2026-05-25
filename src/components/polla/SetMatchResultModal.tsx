"use client";

import { useState } from "react";
import { setMatchResult } from "@/actions/polla";
import { useRouter } from "next/navigation";
import type { IPollaMatch } from "@/types/polla";

interface Props {
  match: IPollaMatch;
  groupId: string;
}

export default function SetMatchResultModal({ match, groupId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [homeScore, setHomeScore] = useState(
    match.homeScore != null ? String(match.homeScore) : "",
  );
  const [awayScore, setAwayScore] = useState(
    match.awayScore != null ? String(match.awayScore) : "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await setMatchResult(
        groupId,
        match._id,
        Number(homeScore),
        Number(awayScore),
      );
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al guardar resultado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-semibold"
      >
        {match.status === "finished" ? "✏️ Editar" : "⚽ Resultado"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-background-elevated rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              Cargar resultado
            </h2>

            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {match.homeTeam}{" "}
                <span className="text-foreground-muted font-normal">vs</span>{" "}
                {match.awayTeam}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <div className="text-center">
                  <label className="text-xs font-semibold text-foreground-muted block mb-1">
                    {match.homeTeam}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-background border border-border text-2xl font-black text-foreground text-center focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <span className="text-foreground-muted font-bold text-lg mt-5">
                  —
                </span>
                <div className="text-center">
                  <label className="text-xs font-semibold text-foreground-muted block mb-1">
                    {match.awayTeam}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-background border border-border text-2xl font-black text-foreground text-center focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-danger bg-danger/10 rounded-lg p-3">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || homeScore === "" || awayScore === ""}
                  className="flex-1 px-4 py-2 rounded-xl bg-success text-white text-sm font-bold hover:bg-success/90 disabled:opacity-50 transition-all"
                >
                  {loading ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
