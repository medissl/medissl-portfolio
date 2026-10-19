import { redirect } from "next/navigation";
export default async function MineAlias({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of typeof value === "string" ? [value] : value ?? []) params.append(key, item);
  }
  redirect(params.size ? `/?${params}` : "/");
}
