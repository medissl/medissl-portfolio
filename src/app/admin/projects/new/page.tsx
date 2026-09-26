import { AdminGuard } from "@/components/admin-guard";
import { ProjectEditor } from "@/components/project-editor";

export default function NewProjectPage() {
  return <AdminGuard><ProjectEditor /></AdminGuard>;
}
