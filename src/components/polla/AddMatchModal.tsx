"use client";

import { useState } from "react";
import { createPollaMatch } from "@/actions/polla";
import { useRouter } from "next/navigation";
import type { MatchStage } from "@/types/polla";

interface Props {
  groupId: string;
}

const STAGES: { value: MatchStage; label: string }[] = [
  { value: "group", label: "Fase de Grupos" },
  { value: "round_of_16", label: "Octavos de Final" },
  { value: "quarterfinal", label: "Cuartos de Final" },
  { value: "semifinal", label: "Semifinal" },
  { value: "final", label: "Final" },
];

export default function AddMatchModal({ groupId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    stage: "group" as MatchStage,
    matchday: "",
    homeTeam: "",
    awayTeam: "",
    matchDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createPollaMatch(groupId, {
        stage: form.stage,
        matchday: form.matchday ? Number(form.matchday) : undefined,
        homeTeam: form.homeTeam.trim(),
        awayTeam: form.awayTeam.trim(),
        matchDate: form.matchDate || undefined,
      });
      setForm({
        stage: "group",
        matchday: "",
        homeTeam: "",
        awayTeam: "",
        matchDate: "",
      });
      setError(null);
      router.refresh();
      // Keep modal open so admin can add more matches in sequence
    } catch (err: any) {
      setError(err.message || "Error al crear el partido");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/25"
      >
        ➕ Agregar partido
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative w-full max-w-md bg-background-elevated rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Agregar partido
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Puedes agregar varios partidos sin cerrar este formulario.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Stage */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                  Fase *
                </label>
                <select
                  value={form.stage}
                  onChange={(e) =>
                    setForm({ ...form, stage: e.target.value as MatchStage })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jornada (only for group stage) */}
              {form.stage === "group" && (
                <div>
                  <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                    Jornada
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.matchday}
                    onChange={(e) =>
                      setForm({ ...form, matchday: e.target.value })
                    }
                    placeholder="Ej: 1"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              {/* Teams */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <div>
                  <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                    Local *
                  </label>
                  <input
                    required
                    value={form.homeTeam}
                    onChange={(e) =>
                      setForm({ ...form, homeTeam: e.target.value })
                    }
                    placeholder="Ej: Argentina"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <span className="text-foreground-muted font-bold text-sm mt-5">
                  vs
                </span>
                <div>
                  <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                    Visitante *
                  </label>
                  <input
                    required
                    value={form.awayTeam}
                    onChange={(e) =>
                      setForm({ ...form, awayTeam: e.target.value })
                    }
                    placeholder="Ej: Francia"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                  Fecha y hora (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={form.matchDate}
                  onChange={(e) =>
                    setForm({ ...form, matchDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-danger bg-danger/10 rounded-lg p-3">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {loading ? "Guardando..." : "Agregar partido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
