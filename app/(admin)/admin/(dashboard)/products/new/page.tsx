import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/app/(admin)/admin/(dashboard)/categories/actions";
import { getBrands } from "@/app/(admin)/admin/(dashboard)/brands/actions";
import { getProduct, getPolicies } from "@/app/(admin)/admin/(dashboard)/products/actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [categoriesRes, brandsRes, policiesRes] = await Promise.all([
    getCategories(),
    getBrands(),
    getPolicies(),
  ]);
  const categories = categoriesRes.data || [];
  const brands = brandsRes.data || [];
  const availablePolicies = policiesRes.data || [];
  
  const resolvedParams = await searchParams;
  
  let initialData: any = {};

  if (resolvedParams.duplicateFrom) {
    const sourceId = parseInt(resolvedParams.duplicateFrom as string);
    if (!isNaN(sourceId)) {
      const sourceRes = await getProduct(sourceId);
      if (sourceRes.data) {
        const source = sourceRes.data;
        const timestamp = Date.now().toString().slice(-4);
        initialData = {
          ...source,
          id: undefined, // ensure it creates a new record
          name: `${source.name} (Bản sao)`,
          slug: `${source.slug}-copy-${timestamp}`,
          metaTitle: source.metaTitle ? `${source.metaTitle} (Bản sao)` : undefined,
          variants: source.variants?.map((v: any, idx: number) => ({
            ...v,
            id: undefined,
            sku: `${v.sku}-COPY-${timestamp}${idx > 0 ? `-${idx}` : ''}`,
          })),
        };
      }
    }
  }

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
      availablePolicies={availablePolicies}
      initialData={Object.keys(initialData).length > 0 ? initialData : undefined}
    />
  );
}

