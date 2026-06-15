import type { Metadata, Viewport } from "next";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "LID Prep — Leben in Deutschland Exam",
  description: "Prepare for the German naturalization test with practice questions, mock exams, and flashcards.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-plex antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
