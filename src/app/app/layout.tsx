import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aplicaciones',
  description: 'Ecosistema de aplicaciones personales.',
  icons: {
    icon: '/favicons/gastos.svg',
  },
};

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo & Breadcrumb */}
            <div className="flex items-center gap-4">
              <Link href="/" className="text-lg font-bold gradient-text">
                JJ
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-sm text-foreground-subtle">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-foreground-muted">Apps</span>
              </div>
            </div>

            {/* Right: Links */}
            <div className="flex items-center gap-3">
              <Link
                href="/app/gastos"
                className="text-sm text-foreground-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                💰 Gastos
              </Link>
              <Link
                href="/"
                className="text-sm text-foreground-subtle hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                ← Portafolio
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
