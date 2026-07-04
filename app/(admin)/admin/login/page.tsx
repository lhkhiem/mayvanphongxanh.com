"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.");
      } else {
        toast.success("Đăng nhập thành công!");
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f7] px-4 py-8">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white shadow-sm overflow-hidden rounded-md">
        
        {/* Left Panel - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-medium text-gray-800 mb-2">Đăng nhập</h1>
          <p className="text-gray-500 mb-6">Đăng nhập vào tài khoản quản trị</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input Group: Username/Email */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <div className="bg-gray-50 px-3 flex items-center justify-center border-r border-gray-300 text-gray-500">
                <User className="h-5 w-5" />
              </div>
              <input 
                id="email"
                name="email"
                type="email" 
                placeholder="Địa chỉ Email" 
                required
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 outline-none text-gray-700 bg-white"
              />
            </div>

            {/* Input Group: Password */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <div className="bg-gray-50 px-3 flex items-center justify-center border-r border-gray-300 text-gray-500">
                <Lock className="h-5 w-5" />
              </div>
              <input 
                id="password"
                name="password"
                type="password" 
                placeholder="Mật khẩu" 
                required
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 outline-none text-gray-700 bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#5856d6] hover:bg-[#4f4dbf] text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
              
              <Link href="#" className="text-[#5856d6] hover:text-[#4f4dbf] text-sm hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </form>
        </div>

        {/* Right Panel - Sign Up */}
        <div className="hidden md:flex w-full md:w-1/2 bg-[#5856d6] text-white p-8 md:p-12 flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-medium mb-4">Đăng ký</h2>
          <p className="mb-8 leading-relaxed opacity-90">
            Tạo tài khoản mới để trải nghiệm toàn bộ các tính năng quản lý ưu việt. Hệ thống thiết kế chuyên nghiệp, bảo mật cao và dễ dàng sử dụng.
          </p>
          <button className="bg-white/10 hover:bg-white/20 border border-white/50 text-white px-6 py-2.5 rounded-md transition-colors font-medium">
            Đăng ký ngay!
          </button>
        </div>

      </div>
    </div>
  );
}
