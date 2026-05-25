"use client";

import { useState } from "react";
import { createPollaGroup } from "@/actions/polla";
import { useRouter } from "next/navigation";

export default function CreateGroupModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    entryFee: "",
    currency: "CLP",
    tournamentName: "Mundial 2026",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const group = await createPollaGroup({
        name: form.name,
        description: form.description || undefined,
        entryFee: form.entryFee ? Number(form.entryFee) : 0,
        currency: form.currency,
        tournamentName: form.tournamentName,
      });
      setOpen(false);
      router.push(`/app/polla_futbolera/${group._id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al crear el grupo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
      >
        ➕ Crear Grupo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md bg-background-elevated rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground">Crear Grupo</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                  Nombre del grupo *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Polla del Trabajo"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                  Descripción
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Opcional"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                  Torneo
                </label>
                <input
                  value={form.tournamentName}
                  onChange={(e) =>
                    setForm({ ...form, tournamentName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                    Cuota de entrada
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.entryFee}
                    onChange={(e) =>
                      setForm({ ...form, entryFee: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-muted mb-1 block">
                    Moneda
                  </label>
                  <input
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                    placeholder="CLP"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-danger bg-danger/10 rounded-lg p-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {loading ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
