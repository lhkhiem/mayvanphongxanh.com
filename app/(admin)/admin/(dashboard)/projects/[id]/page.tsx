import { ProjectForm } from "@/components/admin/project-form";
import { getProject } from "../actions";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
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
