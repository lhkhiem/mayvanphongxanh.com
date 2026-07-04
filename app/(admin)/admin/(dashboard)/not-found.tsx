import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-8xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Trang không tồn tại</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Xin lỗi, chức năng hoặc trang quản trị bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.
      </p>
      <Link href="/admin">
        <Button size="lg">Về Dashboard</Button>
      </Link>
    </div>
  );
}
