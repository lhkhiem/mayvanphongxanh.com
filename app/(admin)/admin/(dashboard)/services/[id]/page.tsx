import { ServiceForm } from "@/components/admin/service-form";
import { getService } from "../actions";
import { notFound } from "next/navigation";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
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
