import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Groupin - Advanced Team Chat",
  description: "団体ごとに独立したアイデンティティを持つマルチチャットプラットフォーム。既読機能、ファイル共有、管理者通知など高度な機能を備えています。",
  keywords: ["chat", "team", "organization", "collaboration", "messaging"],
  authors: [{ name: "Groupin Team" }],
  openGraph: {
    title: "Groupin - Advanced Team Chat",
    description: "マルチ団体対応のチームチャットプラットフォーム",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
