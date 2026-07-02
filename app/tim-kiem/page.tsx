import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/lib/mockData';

export default function SearchPage() {
  // In a real app, you would get the query from searchParams
  // and fetch the filtered products from the backend.
  // Here we just use a mock display.
  const searchResults = products.slice(0, 4);
  const keyword = "máy in";

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
