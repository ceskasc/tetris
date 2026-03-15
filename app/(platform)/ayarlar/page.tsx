import { getCurrentDashboard } from "@/server/current-user";
import { SettingsForm } from "@/features/settings/settings-form";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";

export default async function SettingsPage() {
  const { settings } = await getCurrentDashboard();

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Ayarlar"
        title="Kontrol, ses ve erişilebilirlik tek yerde"
        description="Klavye eşlemeleri, ses dengesi, hareket yoğunluğu ve tema tercihleri; her cihaz için kontrollü biçimde uyarlanır."
      />
      <Panel className="p-6">
        <SettingsForm initialSettings={settings} />
      </Panel>
    </div>
  );
}
