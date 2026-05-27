import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Kelime Ezberleme Sistemi",
  description: "6 Sefer ile Kelime Öğreten Spaced Repetition Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-slate-50 antialiased">
        <Navbar />
        <div className="bg-glow" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
