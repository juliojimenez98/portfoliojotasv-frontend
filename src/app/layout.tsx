import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider, { ThemeScript } from "@/components/providers/ThemeProvider";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Julio Jiménez — Desarrollador Full-Stack",
    template: "%s | Julio Jiménez",
  },
  description:
    "Portafolio personal y ecosistema de aplicaciones. Desarrollador Full-Stack especializado en TypeScript, Next.js y Node.js.",
  keywords: ["desarrollador", "full-stack", "typescript", "next.js", "portafolio"],
  authors: [{ name: "Julio Jiménez" }],
  icons: {
    icon: "/favicons/portfolio.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
