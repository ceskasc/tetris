import { requireSessionUser } from "@/auth/session";
import { toDashboardSnapshot, toSettingsSnapshot } from "@/server/snapshots";

export async function getCurrentDashboard() {
  const user = await requireSessionUser();

  return {
    user,
    dashboard: toDashboardSnapshot(user),
    settings: toSettingsSnapshot(user),
  };
}
