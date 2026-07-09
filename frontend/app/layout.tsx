import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imagerights.uz"),
  title: {
    default: "ImageRights.uz — Raqamli dunyoda tasvir huquqlaringiz kafolati",
    template: "%s · ImageRights.uz",
  },
  description:
    "Tasvir huquqlarini himoya qilish platformasi: ruxsatsiz suratdan foydalanishni hujjatlashtiring, dalillarni xavfsiz saqlang, huquqiy talabnoma tayyorlang va ish holatini kuzating.",
  keywords: [
    "tasvirga bo‘lgan huquq",
    "tasvir huquqlarini himoya qilish",
    "ruxsatsiz suratdan foydalanish",
    "internetda suratni himoya qilish",
    "image rights Uzbekistan",
    "shaxsiy tasvir huquqi",
  ],
  authors: [{ name: "ImageRights.uz" }],
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: "ImageRights.uz",
    title: "ImageRights.uz — Raqamli dunyoda tasvir huquqlaringiz kafolati",
    description:
      "Tasvir huquqlarini hujjatlashtirish, dalillar ombori va huquqiy javob choralari — yagona platformada.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={inter.variable}>
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
