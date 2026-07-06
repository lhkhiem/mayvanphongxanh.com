import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/app/(admin)/admin/(dashboard)/categories/actions";
import { getBrands } from "@/app/(admin)/admin/(dashboard)/brands/actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [categoriesRes, brandsRes] = await Promise.all([
    getCategories(),
    getBrands()
  ]);
  const categories = categoriesRes.data || [];
  const brands = brandsRes.data || [];
  
  const resolvedParams = await searchParams;
  
  const initialData: any = {};
  if (resolvedParams.categoryId) {
    initialData.categoryId = parseInt(resolvedParams.categoryId as string);
  }
  if (resolvedParams.productType) {
    initialData.productType = resolvedParams.productType as string;
  }

  return (
    <ProductForm 
      categories={categories} 
      brands={brands}
      initialData={Object.keys(initialData).length > 0 ? initialData : undefined}
    />
  );
}
