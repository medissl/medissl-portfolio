"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const publicLinks = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "https://github.com/medissl", label: "GitHub", external: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className={isAdmin ? "site-header site-header--admin" : "site-header"}>
      <Link
        href={isAdmin ? "/admin" : "/"}
        className="brand"
        aria-label={isAdmin ? "Admin home" : "Medi home"}
      >
        <span className="brand__mark" aria-hidden="true">M</span>
        {!isAdmin && <span className="brand__name">MEDISSL</span>}
      </Link>

      <nav className="nav" aria-label="Primary navigation">
        {isAdmin ? (
          <Link href="/" className="nav__back">
            <ArrowLeft size={15} /> Back to portfolio
          </Link>
        ) : (
          publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          ))
        )}
      </nav>
    </header>
  );
}
