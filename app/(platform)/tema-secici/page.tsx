import { ThemePicker } from "@/features/settings/theme-picker";
import { SectionTitle } from "@/components/ui/section-title";

export default function ThemePage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Tema Seçici"
        title="Aynı oyuna başka bir ışık ver"
        description="Karanlık merkez, ferah aydınlık ton ya da sıcak amber kırılması. Tüm yüzeyler aynı tasarım token sistemiyle birlikte değişir."
      />
      <ThemePicker />
    </div>
  );
}
