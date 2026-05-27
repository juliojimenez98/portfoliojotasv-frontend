'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { checkBackendHealth } from '@/actions/health';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/app/gastos';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setHealthStatus(res);
      setIsHealthLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-background-card border border-border shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Backend Health Status Box */}
        <div className="p-3.5 rounded-xl bg-background-elevated border border-border text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-foreground-muted">Estado del Backend:</span>
            {isHealthLoading ? (
              <span className="text-primary animate-pulse">Verificando conexión...</span>
            ) : healthStatus?.success ? (
              <span className="text-success flex items-center gap-1">🟢 Conectado (HTTP {healthStatus.status})</span>
            ) : (
              <span className="text-danger flex items-center gap-1">🔴 Desconectado / Error</span>
            )}
          </div>
          {!isHealthLoading && (
            <div className="text-[11px] font-mono text-foreground-subtle truncate bg-black/20 dark:bg-white/5 p-1 rounded">
              URL: {healthStatus?.apiUrl || 'No configurada'}
            </div>
          )}
          {!isHealthLoading && !healthStatus?.success && (
            <div className="text-[11px] text-danger bg-danger/10 p-1.5 rounded border border-danger/20">
              Error: {healthStatus?.error || 'No se pudo conectar con el servidor API'}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        <div className="flex justify-end text-xs">
          <Link href="/forgot-password" className="text-primary hover:underline font-semibold transition-all">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-center text-sm text-foreground-muted">
          Si no tienes cuenta, solicita acceso al administrador.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
          <h1 className="text-2xl font-bold text-foreground mt-4">Iniciar Sesión</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Accede a tu ecosistema personal
          </p>
        </div>

        {/* Form within Suspense */}
        <Suspense fallback={<div className="p-8 text-center text-foreground-muted">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
