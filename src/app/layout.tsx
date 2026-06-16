import type { Metadata, Viewport } from "next";
import AppShell from "@/components/layout/AppShell";
import ServiceWorker from "@/components/layout/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: "LID Prep — Leben in Deutschland Exam",
  description: "Prepare for the German naturalization test with practice questions, mock exams, and flashcards.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LID Prep",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C0392B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-plex antialiased" suppressHydrationWarning>
        <ServiceWorker />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
