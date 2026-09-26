import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page shell">
      <div className="empty-state">
        <p className="eyebrow">404 / SIGNAL LOST</p>
        <h1>This page wandered off.</h1>
        <p className="muted">The link may be old, unpublished, or just imaginary.</p>
        <Link href="/" className="button button--primary">Return home</Link>
      </div>
    </section>
  );
}
