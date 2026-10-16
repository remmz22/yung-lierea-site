import type { Metadata, Viewport } from "next";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  weight: ["400", "600", "800", "900"],
});

const body = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yung Lierea — Trap × Alternative R&B | Bursa",
    template: "%s | Yung Lierea",
  },
  description:
    "Yung Lierea — 17 yaşında, Bursa merkezli Türk trap / alternative R&B sanatçısı. Atmosferik ses manzaraları, ağır bas hatları, melankolik melodiler. Diskografi, istatistikler ve daha fazlası.",
  keywords: [
    "Yung Lierea",
    "Türk trap",
    "alternative R&B",
    "Bursa rap",
    "Turkish underground",
    "oluk oluk",
    "ZIGZAG",
    "DÖNDÜR",
  ],
  authors: [{ name: "Yung Lierea" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: siteUrl,
    siteName: "Yung Lierea",
    title: "Yung Lierea — Trap × Alternative R&B",
    description:
      "Bursa merkezli 17 yaşında Türk sanatçı. Atmosferik ses manzaraları, ağır baslar, melankolik melodiler.",
    images: [{ url: "/covers/zigzag.jpg", width: 640, height: 640, alt: "Yung Lierea — ZIGZAG" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yung Lierea — Trap × Alternative R&B",
    description:
      "Bursa merkezli 17 yaşında Türk sanatçı. Diskografi, istatistikler, iletişim.",
    images: ["/covers/zigzag.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05060f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
