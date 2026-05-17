import type { Metadata } from 'next';
import AppSidebar from '@/components/ui/AppSidebar';

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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - sticky on the left */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
