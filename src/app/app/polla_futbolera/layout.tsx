import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Polla Futbolera",
    template: "%s | Polla Futbolera",
  },
  description: "Sistema de pronósticos de fútbol — Mundial 2026.",
  icons: {
    icon: "/favicons/portfolio.svg",
  },
};

export default function PollaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The parent /app/app/layout.tsx already provides the sidebar + main wrapper.
  // This layout only needs to set metadata and pass children through.
  return <>{children}</>;
}
