import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CONY - 나만의 작은 쿠폰 요정",
  description: "나만의 작은 쿠폰 요정 CONY",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CONY",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full w-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full m-0 p-0 overflow-hidden`}
      >
        <div className="h-screen w-full m-0 p-0 overflow-hidden">
          <main className="flex h-full w-full max-w-md mx-auto flex-col shadow-lg m-0 p-0 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
