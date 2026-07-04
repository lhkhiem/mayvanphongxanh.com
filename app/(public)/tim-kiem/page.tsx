import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { prisma } from '@/lib/db';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const keyword = resolvedParams.q || "";

  const dbProducts = keyword ? await prisma.product.findMany({
    where: { 
      isActive: true,
      name: { contains: keyword } // simple search
    },
    include: { variants: true, category: true }
  }) : [];

  const searchResults = dbProducts.map(p => {
    const defaultVariant = p.variants[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || 'Khác',
      brand: p.brand || 'Khác',
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.originalPrice,
      rating: 5,
      reviews: 120,
      image: (defaultVariant?.images as string[])?.[0] || '/placeholder.jpg',
      stock: defaultVariant?.stockQuantity || 0,
    };
  });

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-foreground">
            Kết quả tìm kiếm cho: <span className="text-primary">&quot;{keyword}&quot;</span>
          </h1>
          <p className="text-muted-foreground mt-2">Tìm thấy {searchResults.length} kết quả phù hợp</p>
        </div>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                rating={product.rating}
                reviews={product.reviews}
                image={product.image}
                stock={product.stock}
                slug={product.slug}
                category={product.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary rounded-lg border border-border">
            <h2 className="text-xl font-medium text-foreground mb-2">Không tìm thấy sản phẩm nào!</h2>
            <p className="text-muted-foreground">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
