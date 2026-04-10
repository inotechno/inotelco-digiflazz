import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InoTelco - Solusi PPOB Modern",
  description: "Aplikasi PPOB Premium Terintegrasi Digiflazz",
  manifest: "/manifest.json",
  icons: {
    icon: "/brands/logo.png",
    apple: "/brands/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InoTelco",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full bg-slate-50 text-slate-900 antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
