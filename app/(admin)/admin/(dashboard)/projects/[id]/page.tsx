import { ProjectForm } from "@/components/admin/project-form";
import { getProject } from "../actions";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    notFound();
  }


  const { data: project, error } = await getProject(id);

  if (error || !project) {
    notFound();
  }

  return (
    <ProjectForm initialData={project} />
  );
}
