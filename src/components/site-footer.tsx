import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">MEDIANTO SUSILO</p>
        <p className="muted">Making interfaces, images, games, and small experiments.</p>
      </div>
      <div className="footer-links">
        <Link href="/work">Work</Link>
        <Link href="/about">About</Link>
        <Link href="https://github.com/medissl" target="_blank" rel="noreferrer">
          GitHub
        </Link>
      </div>
      <p className="muted">© {new Date().getFullYear()} Medianto Susilo</p>
    </footer>
  );
}
