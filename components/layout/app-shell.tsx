"use client";

import { usePathname } from "next/navigation";

import { SideNav } from "@/components/layout/side-nav";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const currentPath = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
      <SideNav currentPath={currentPath} />
      <main className="min-w-0 flex-1">
        <TopBar />
        {children}
      </main>
    </div>
  );
}
