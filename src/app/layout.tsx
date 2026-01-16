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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full w-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full m-0 p-0`}
      >
        <div className="min-h-screen w-full h-full bg-gray-200 m-0 p-0">
          <main className="flex min-h-screen h-full w-full max-w-md mx-auto flex-col bg-gray-100 shadow-lg m-0 p-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
