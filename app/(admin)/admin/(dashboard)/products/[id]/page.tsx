import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getProduct } from "@/app/(admin)/admin/(dashboard)/products/actions";
import { getCategories } from "@/app/(admin)/admin/(dashboard)/categories/actions";
import { getBrands } from "@/app/(admin)/admin/(dashboard)/brands/actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  if (isNaN(id)) notFound();

  const [productRes, categoriesRes, brandsRes] = await Promise.all([
    getProduct(id),
    getCategories(),
    getBrands(),
  ]);

  if (productRes.error || !productRes.data) notFound();

  return (
    <ProductForm
      initialData={productRes.data}
      categories={categoriesRes.data || []}
      brands={brandsRes.data || []}
    />
  );
}
