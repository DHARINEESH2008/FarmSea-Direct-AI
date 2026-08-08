import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FarmSea Direct AI — India's First AI-Powered Farmer & Fisher Marketplace",
  description: "Fresh produce directly from farmers and fishers to your doorstep. AI-powered matching, dynamic pricing, and circular economy marketplace for sustainable agriculture and fishing.",
  keywords: [
    "FarmSea",
    "farm to table",
    "fish to fork",
    "AI marketplace",
    "circular economy",
    "farmer direct",
    "fisher direct",
    "fresh produce India",
    "sustainable agriculture",
  ],
  authors: [{ name: "FarmSea Direct AI Team" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
