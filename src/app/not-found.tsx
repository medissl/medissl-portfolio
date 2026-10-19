import Link from "next/link";
import "./mine/mine.css";

export default function NotFound() {
  return (
    <main className="mine mine-error">
      <div>
        <p className="mine-kicker">404 · A passage not on this map</p>
        <h1>This work isn’t available.</h1>
        <p>The link may have changed, or the work may no longer be published.</p>
        <Link href="/" className="mine-primary">Return to the mine</Link>
        <Link href="/?view=projects" className="mine-text-link">Browse published work</Link>
      </div>
    </main>
  );
}
