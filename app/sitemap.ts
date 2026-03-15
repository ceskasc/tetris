import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const routes = [
  "",
  "/giris-yap",
  "/kayit-ol",
  "/modlar",
  "/online",
  "/turnuvalar",
  "/gorevler",
  "/basarimlar",
  "/koleksiyon",
  "/profil",
  "/istatistikler",
  "/ayarlar",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
