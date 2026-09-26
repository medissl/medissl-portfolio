"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="footer-identity">
        <p className="eyebrow">MEDIANTO SUSILO</p>
        <div className="footer-contact">
          <Link href="tel:+6281276358926">0812 7635 8926</Link>
          <Link href="mailto:mediantozeng@gmail.com">mediantozeng@gmail.com</Link>
          <Link href="https://github.com/medissl" target="_blank" rel="noreferrer">GitHub</Link>
          <Link href="https://wa.me/6281276358926" target="_blank" rel="noreferrer">WhatsApp</Link>
        </div>
      </div>

      <div className="footer-right">
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link href="/work">Work</Link>
          <Link href="/about">About</Link>
          <Link href="https://github.com/medissl" target="_blank" rel="noreferrer">GitHub</Link>
        </nav>
        <p className="muted">© {new Date().getFullYear()} Medianto Susilo</p>
      </div>
    </footer>
  );
}
