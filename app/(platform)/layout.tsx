import { AppShell } from "@/components/layout/app-shell";
import { requireSessionUser } from "@/auth/session";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSessionUser();

  return <AppShell>{children}</AppShell>;
}
