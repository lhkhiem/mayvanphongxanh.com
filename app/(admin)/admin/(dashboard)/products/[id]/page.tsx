import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProduct } from "@/app/(admin)/admin/(dashboard)/products/actions";
import { getCategories } from "@/app/(admin)/admin/(dashboard)/categories/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  if (isNaN(id)) notFound();

  const [productRes, categoriesRes] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (productRes.error || !productRes.data) notFound();

  return (
    <ProductForm
      initialData={productRes.data}
      categories={categoriesRes.data || []}
    />
  );
}
