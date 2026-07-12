import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "LocalLens",
  description: "AI trip planning that helps you travel like a local.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gradient-to-b from-slate-100 via-zinc-50 to-white text-slate-900">
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
