import { getMineProjects } from "@/lib/mine-projects";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(await getMineProjects(), { headers: { "Cache-Control": "no-store" } });
}
