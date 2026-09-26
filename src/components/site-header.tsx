"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const publicLinks = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "https://github.com/medissl", label: "GitHub", external: true },
];

function BrandMark() {
  return (
    <svg
      className="brand__mark"
      viewBox="0 0 64 64"
      role="img"
      aria-label="Medi logo"
    >
      <rect width="64" height="64" rx="14" fill="#03060d" />
      <path
        d="M14 47V17h7l11 17 11-17h7v30h-7V28L32 44 21 28v19z"
        fill="#71f2ff"
      />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className={isAdmin ? "site-header site-header--admin" : "site-header"}>
      <div className="site-header__inner">
        <Link
          href={isAdmin ? "/admin" : "/"}
          className="brand"
          aria-label={isAdmin ? "Admin home" : "Medi home"}
        >
          <BrandMark />
          {!isAdmin && <span className="brand__name">MEDISSL</span>}
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          {isAdmin ? (
            <Link href="/" className="nav__back">
              <ArrowLeft size={15} /> Back to portfolio
            </Link>
          ) : (
            publicLinks.map((link) => {
              const active =
                !link.external &&
                (pathname === link.href || pathname.startsWith(`${link.href}/`));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "nav__link is-active" : "nav__link"}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                >
                  {link.label}
                  {link.external && <ArrowUpRight size={13} aria-hidden="true" />}
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </header>
  );
}
