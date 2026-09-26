import type { Metadata } from "next";
import { AmbientBackground } from "@/components/ambient-bg";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Medianto Susilo — Creative Portfolio",
    template: "%s — Medianto Susilo",
  },
  description:
    "Art, UI/UX, interactive media, games, and creative coding by Medianto Susilo.",
  metadataBase: new URL("https://medissl.vercel.app"),
  openGraph: {
    title: "Medianto Susilo — Creative Portfolio",
    description:
      "Art, UI/UX, interactive media, games, and creative coding by Medianto Susilo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AmbientBackground />
        <div className="site-frame">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
