import { buildCollectionEntries, getCollectionCompletion } from "@/collections/helpers";
import { getCurrentDashboard } from "@/server/current-user";
import { cosmeticsCatalog } from "@/data/cosmetics";
import { CollectionGallery } from "@/features/collections/collection-gallery";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionTitle } from "@/components/ui/section-title";

export default async function CollectionPage() {
  const { dashboard } = await getCurrentDashboard();
  const entries = buildCollectionEntries(dashboard.cosmetics);
  const completion = getCollectionCompletion(dashboard.cosmetics);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Koleksiyon"
        title="Kendi vitrinini kur"
        description="Tahta temaları, blok derileri, avatarlar ve çerçeveler; her biri oyuncu kartında ve oyun yüzeyinde gerçek bir karakter izi bırakır."
      />

      <Panel className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted">
            Açılan parça: {dashboard.cosmetics.length}/{cosmeticsCatalog.length}
          </span>
          <span className="text-sm text-muted">%{completion}</span>
        </div>
        <ProgressBar value={completion} />
      </Panel>

      <CollectionGallery initialEntries={entries} />
    </div>
  );
}
