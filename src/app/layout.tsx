import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/data/profile";
import { SITE_URL } from "@/lib/site";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const title = `${profile.shortName}@portfolio — ${profile.role}`;
const description = `${profile.bio} An IDE-in-the-browser portfolio with a working terminal: type \`help\` to begin.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s · ${profile.shortName}@portfolio`,
  },
  description,
  applicationName: `${profile.shortName} portfolio`,
  authors: [{ name: profile.name }],
  generator: "Next.js",
  keywords: [
    profile.name,
    profile.shortName,
    profile.role,
    "frontend engineer",
    "golang engineer",
    "portfolio",
    "react",
    "next.js",
    "typescript",
    "ide portfolio",
    "terminal portfolio",
    "hacker theme",
  ],
  creator: profile.name,
  publisher: profile.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title,
    description,
    siteName: `${profile.shortName}@portfolio`,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistMono.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
