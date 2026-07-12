import { notFound } from "next/navigation";
import { prisma as db } from "@/lib/db";
import { PageForm } from "@/components/admin/page-form";

export default async function EditPagePage({
  params,
}: {
  params: { id: string };
}) {
  const page = await db.page.findUnique({
    where: { id: params.id },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageForm initialData={page} />
    </div>
  );
}
