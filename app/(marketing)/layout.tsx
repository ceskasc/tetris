import { AmbientBackground } from "@/components/layout/ambient-background";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 lg:px-6">
      <AmbientBackground />
      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
