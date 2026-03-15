import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lunara",
    short_name: "Lunara",
    description:
      "Premium hisli, zarif ve rekabetçi browser tabanlı blok düşürme oyunu.",
    start_url: "/ana-menu",
    display: "standalone",
    background_color: "#090a14",
    theme_color: "#8d7bff",
    lang: "tr-TR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon",
      },
    ],
  };
}
