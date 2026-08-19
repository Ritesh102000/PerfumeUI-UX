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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://editoverse.catapultaiwork.com"),
  title: "EditoVerse — Video Editing, On Demand",
  description: "Affordable, tiered short-form video editing for creators, agencies and brands.",
  openGraph: {
    title: "EditoVerse — Video Editing, On Demand",
    description: "Stop managing edits. Start shipping content.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "EditoVerse video editing services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EditoVerse — Video Editing, On Demand",
    description: "Stop managing edits. Start shipping content.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
