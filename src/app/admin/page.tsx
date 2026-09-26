import Link from "next/link";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="admin-card">
        <p className="eyebrow">DASHBOARD</p>
        <h1>Keep the portfolio alive.</h1>
        <p className="muted">
          Add new work, keep unfinished pieces as drafts, choose what appears on
          the home page, and publish whenever it feels ready.
        </p>
        <div className="admin-dashboard-links">
          <Link className="admin-link-card" href="/admin/projects">
            <FolderKanban size={22} />
            <div><strong>Manage projects</strong><span>View drafts and published work</span></div>
            <ArrowUpRight size={18} />
          </Link>
          <Link className="admin-link-card" href="/admin/projects/new">
            <span className="admin-plus">+</span>
            <div><strong>Add something new</strong><span>Art, UI/UX, interactive work, experiments</span></div>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </AdminGuard>
  );
}
