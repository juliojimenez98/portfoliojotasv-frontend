"use client";

import { useState } from "react";
import { addGroupMember } from "@/actions/polla";
import { useRouter } from "next/navigation";

interface Props {
  groupId: string;
}

export default function AddMemberModal({ groupId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addGroupMember(groupId, username.trim());
      setSuccess(`✓ ${username.trim()} fue agregado al grupo`);
      setUsername("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al agregar miembro");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setUsername("");
    setError(null);
    setSuccess(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/25"
      >
        ➕ Agregar miembro
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative w-full max-w-sm bg-background-elevated rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Agregar miembro
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                El usuario debe estar registrado en la plataforma.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                autoFocus
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                placeholder="Nombre de usuario"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary transition-colors"
              />

              {error && (
                <p className="text-xs text-danger bg-danger/10 rounded-lg p-3">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-xs text-success bg-success/10 rounded-lg p-3">
                  {success}
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
                  disabled={loading || !username.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {loading ? "Buscando..." : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
