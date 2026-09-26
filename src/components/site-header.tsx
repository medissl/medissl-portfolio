import Link from "next/link";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "https://github.com/medissl", label: "GitHub", external: true },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Medi home">
        <span className="brand__mark">M</span>
        <span>MEDISSL</span>
      </Link>

      <nav className="nav" aria-label="Primary navigation">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
