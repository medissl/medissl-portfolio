import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";
import "./admin.css";
import "./public.css";

export const metadata: Metadata = {
  title: {
    default: "Medianto Susilo — Creative Portfolio",
    template: "%s — Medianto Susilo",
  },
  description:
    "Art, UI/UX, interactive media, games, and creative coding by Medianto Susilo.",
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
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
