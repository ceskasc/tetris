import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { Providers } from "@/components/layout/providers";

import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Lunara",
    template: "%s | Lunara",
  },
  description:
    "Zarif, premium ve rekabetçi his veren browser tabanlı blok düşürme oyunu ve platformu.",
  applicationName: "Lunara",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: appUrl,
    title: "Lunara",
    description:
      "Premium hisli, romantik alt tonlu ve uzun ömürlü browser tabanlı blok düşürme oyunu.",
    siteName: "Lunara",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lunara",
    description:
      "Premium hisli, romantik alt tonlu ve uzun ömürlü browser tabanlı blok düşürme oyunu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
