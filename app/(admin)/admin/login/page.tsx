"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative bg-[#f3f4f7]">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-[#f3f4f7]/80"></div>

      {/* Logo Outside Form */}
      <div className="z-10 flex justify-center mb-8 w-full">
        <div className="flex items-center gap-4">
            
            {/* CMS Icon Block */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              {/* Green accent dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>

            {/* CMS Text */}
            <div className="flex flex-col">
              <div className="text-3xl font-black text-gray-800 tracking-tight leading-none mb-1">
                MVPX <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">CMS</span>
              </div>
              <div className="text-[0.65rem] font-bold text-gray-500 tracking-[0.2em] uppercase">
                Hệ Thống Quản Trị
              </div>
            </div>
            
          </div>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white shadow-2xl overflow-hidden rounded-2xl z-10 border border-gray-100">
        
        {/* Left Panel - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-medium text-gray-800 mb-2">Đăng nhập</h1>
          <p className="text-gray-500 mb-6">Đăng nhập vào hệ thống quản trị nội dung</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
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
                type={showPassword ? "text" : "password"} 
                placeholder="Mật khẩu" 
                required
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 outline-none text-gray-700 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="bg-white px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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
