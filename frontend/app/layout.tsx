import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imagerights.uz"),
  title: {
    default: "ImageRights.uz — Tasviringiz. Huquqingiz. Himoyangiz.",
    template: "%s · ImageRights.uz",
  },
  description:
    "Markaziy Osiyodagi birinchi professional tasvir huquqlari himoyasi platformasi. Sun'iy intellekt yordamida suratingizni himoya qiling, deepfake holatlarini aniqlang va tasvir huquqlaringizni nazorat qiling.",
  keywords: [
    "tasvir huquqi",
    "deepfake aniqlash",
    "image rights",
    "LegalTech",
    "sun'iy intellekt huquq",
    "shaxsiy ma'lumotlar himoyasi",
    "Uzbekistan",
  ],
  authors: [{ name: "ImageRights.uz" }],
  openGraph: {
    title: "ImageRights.uz — Tasvir huquqlari himoyasi platformasi",
    description:
      "Sun'iy intellekt yordamida suratingizni himoya qiling, deepfake holatlarini aniqlang va tasvir huquqlaringizni nazorat qiling.",
    locale: "uz_UZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
