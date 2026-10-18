"use client";

import { usePathname } from "next/navigation";
import { AmbientBackground } from "@/components/ambient-bg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  if (pathname === "/mine") return <>{children}</>;
  return (
    <>
      {isAdmin && <AmbientBackground />}
      <div className={isAdmin ? "site-frame" : "site-frame public-site"}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
