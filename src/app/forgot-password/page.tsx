"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccess(
          res.message ||
            "Si el correo está registrado, te enviaremos un enlace de recuperación."
        );
      } else {
        setError(res.error || "Ocurrió un error. Intenta de nuevo.");
      }
    } catch {
      setError("Ocurrió un error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-foreground-muted mt-2">
            Ingresa tu email para restablecer tu cuenta
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-2xl bg-background-card border border-border shadow-lg">
          {success ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Solicitud Enviada
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {success}
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
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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
                Enviar Enlace de Recuperación
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-sm text-foreground-muted hover:text-foreground hover:underline transition-all"
                >
                  Cancelar y volver
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
