"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { resetPassword } from "@/actions/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token de recuperación ausente. Solicita un nuevo enlace.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({ token, password });
      if (res.success) {
        setSuccess("Contraseña restablecida correctamente.");
      } else {
        setError(
          res.error ||
            "El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo."
        );
      }
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-background-card border border-border shadow-lg">
      {!token ? (
        <div className="text-center py-4 space-y-4">
          <div className="text-danger text-4xl font-bold">⚠️</div>
          <h3 className="text-lg font-bold text-foreground">Enlace Inválido</h3>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Falta el token de recuperación en la dirección URL. Por favor, solicita un nuevo enlace de restablecimiento.
          </p>
          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="inline-block text-sm text-primary hover:underline font-semibold"
            >
              Solicitar Nuevo Enlace
            </Link>
          </div>
        </div>
      ) : success ? (
        <div className="space-y-5 text-center py-4">
          <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h3 className="text-lg font-bold text-foreground">¡Éxito!</h3>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva credencial.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block text-sm text-primary hover:underline font-semibold"
            >
              &larr; Volver al Inicio de Sesión
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <Input
            label="Nueva Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={loading}
          >
            Actualizar Contraseña
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm text-foreground-muted hover:text-foreground hover:underline transition-all"
            >
              Volver al login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/8 rounded-full blur-[150px]" />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold gradient-text">
            JJ
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-4">
            Reestablecer Contraseña
          </h1>
          <p className="text-sm text-foreground-muted mt-2">
            Ingresa tu nueva credencial de seguridad
          </p>
        </div>

        {/* Suspense is required here due to useSearchParams */}
        <Suspense
          fallback={
            <div className="p-8 text-center text-foreground-muted">
              Cargando formulario...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
