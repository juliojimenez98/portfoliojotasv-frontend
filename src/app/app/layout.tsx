import type { Metadata } from "next";
import AppShell from "@/components/ui/AppShell";

export const metadata: Metadata = {
  title: "Aplicaciones",
  description: "Ecosistema de aplicaciones personales.",
  icons: {
    icon: "/favicons/gastos.svg",
  },
};

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
