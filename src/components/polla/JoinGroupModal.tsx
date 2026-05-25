"use client";

import { useState } from "react";
import { joinPollaGroup } from "@/actions/polla";
import { useRouter } from "next/navigation";

export default function JoinGroupModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const group = await joinPollaGroup(inviteCode.trim().toUpperCase());
      setOpen(false);
      router.push(`/app/polla_futbolera/${group._id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al unirse al grupo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background-elevated border border-border text-sm font-bold text-foreground hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
      >
        🔗 Unirse
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-background-elevated rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground">
              Unirse a un grupo
            </h2>
            <p className="text-sm text-foreground-muted">
              Ingresa el código de invitación que te compartieron.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Ej: A3F7"
                maxLength={8}
                className="w-full px-3 py-3 rounded-lg bg-background border border-border text-center text-xl font-mono font-bold text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary tracking-widest uppercase transition-colors"
              />

              {error && (
                <p className="text-xs text-danger bg-danger/10 rounded-lg p-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || inviteCode.length < 4}
                  className="flex-1 px-4 py-2 rounded-xl bg-success text-white text-sm font-bold hover:bg-success/90 disabled:opacity-50 transition-all"
                >
                  {loading ? "Uniéndose..." : "Unirse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
