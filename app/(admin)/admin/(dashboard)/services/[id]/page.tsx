import { ServiceForm } from "@/components/admin/service-form";
import { getService } from "../actions";
import { notFound } from "next/navigation";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    notFound();
  }


  const { data: service, error } = await getService(id);

  if (error || !service) {
    notFound();
  }

  return (
    <ServiceForm initialData={service} />
  );
}
