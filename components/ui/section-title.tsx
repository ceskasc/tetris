export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.28em] text-soft">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-none md:text-5xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-7 text-muted md:text-base">
        {description}
      </p>
    </div>
  );
}
