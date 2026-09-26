import { AdminGuard } from "@/components/admin-guard";
import { ProjectEditor } from "@/components/project-editor";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminGuard><ProjectEditor projectId={id} /></AdminGuard>;
}
