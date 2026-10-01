"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "@/components/ui/AppSidebar";

function getAppKey(pathname: string): string {
  if (pathname.startsWith("/app/remedios")) return "remedios";
  if (pathname.startsWith("/app/actividades")) return "actividades";
  return "gastos";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div data-app={getAppKey(pathname)} className="min-h-screen bg-background flex">
      <AppSidebar />

      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
