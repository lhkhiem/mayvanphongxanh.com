import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/app/(admin)/admin/(dashboard)/categories/actions";

export default async function NewProductPage() {
  const { data: categories } = await getCategories();
  return <ProductForm categories={categories || []} />;
}
