import { Metadata } from "next";
import { TestimonialsClient } from "./testimonials-client";

export const metadata: Metadata = {
  title: "Quản lý Đánh giá khách hàng | Admin Dashboard",
  description: "Trang quản lý ý kiến và đánh giá của khách hàng",
};

export default function TestimonialsPage() {
  return <TestimonialsClient />;
}
