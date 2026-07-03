import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-2">Trang không tồn tại</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc tạm thời không thể truy cập.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/danh-muc">Xem sản phẩm</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
