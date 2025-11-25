// Root layout for the app
// Built by Shamiur Rashid Sunny (shamiur.com)

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SunnyGPT - AI Chat Assistant",
  description: "Advanced AI chat assistant powered by Gemini and OpenRouter. Get intelligent responses, upload images, and enjoy voice conversations.",
  keywords: ["AI", "Chat", "Gemini", "OpenRouter", "AI Assistant", "ChatGPT Alternative"],
  authors: [{ name: "Shamiur Rashid Sunny", url: "https://shamiur.com" }],
  creator: "Shamiur Rashid Sunny",
  publisher: "Shamiur Rashid Sunny",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sunnygpt.vercel.app'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "SunnyGPT - AI Chat Assistant",
    description: "Advanced AI chat assistant powered by Gemini and OpenRouter",
    siteName: "SunnyGPT",
  },
  twitter: {
    card: "summary_large_image",
    title: "SunnyGPT - AI Chat Assistant",
    description: "Advanced AI chat assistant powered by Gemini and OpenRouter",
    creator: "@shamiursunny",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
