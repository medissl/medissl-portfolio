"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  if (!isAdmin) return <>{children}</>;
  return (
    <>
      <div className="admin-site">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="admin-header">
          <Link href="/admin" className="admin-brand">MEDISSL <span>Studio</span></Link>
          <nav aria-label="Administration">
            {[['/admin','Overview'],['/admin/projects','Manage work'],['/admin/projects/new','New work']].map(([href,label]) =>
              <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
            <Link href="/" target="_blank" rel="noreferrer">View portfolio ↗</Link>
          </nav>
        </header>
        <main id="main-content" tabIndex={-1}>{children}</main>
      </div>
    </>
  );
}
