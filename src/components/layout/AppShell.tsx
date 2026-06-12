"use client";
import { useStore } from "@/lib/store";
import StatePicker from "@/components/onboarding/StatePicker";
import Navbar from "@/components/layout/Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = useStore((s) => s.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) return <StatePicker />;

  return (
    <>
      <div className="bg-dots fixed inset-0 pointer-events-none z-0 opacity-60" />
      <Navbar />
      <main className="relative z-10 pt-16 pb-16 min-h-screen">{children}</main>
    </>
  );
}
