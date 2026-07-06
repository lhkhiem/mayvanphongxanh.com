"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils"; // Giả sử có hàm slugify hoặc mình có thể dùng generateSlug nếu cần

export async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return { data: brands };
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    return { error: "Không thể lấy danh sách thương hiệu" };
  }
}

export async function createBrand(data: { name: string; slug?: string; logo?: string; description?: string }) {
  try {
    const finalSlug = data.slug || data.name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]/g, '');

    // Check if slug exists
    const existing = await prisma.brand.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return { error: "Slug này đã tồn tại, vui lòng chọn slug khác" };
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug: finalSlug,
        logo: data.logo,
        description: data.description,
      }
    });
    
    revalidatePath('/admin/brands');
    revalidatePath('/admin/products');
    return { data: brand };
  } catch (error: any) {
    console.error("Error creating brand:", error);
    return { error: error.message || "Không thể tạo thương hiệu" };
  }
}

export async function updateBrand(id: number, data: { name: string; slug: string; logo?: string; description?: string; isActive?: boolean }) {
  try {
    // Check if slug exists and belongs to another brand
    const existing = await prisma.brand.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== id) {
      return { error: "Slug này đã tồn tại, vui lòng chọn slug khác" };
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        description: data.description,
        isActive: data.isActive,
      }
    });
    
    revalidatePath('/admin/brands');
    revalidatePath('/admin/products');
    return { data: brand };
  } catch (error: any) {
    console.error("Error updating brand:", error);
    return { error: error.message || "Không thể cập nhật thương hiệu" };
  }
}

export async function deleteBrand(id: number) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (!brand) return { error: "Không tìm thấy thương hiệu" };

    if (brand._count.products > 0) {
      return { error: `Không thể xóa vì thương hiệu này đang có ${brand._count.products} sản phẩm` };
    }

    await prisma.brand.delete({ where: { id } });
    
    revalidatePath('/admin/brands');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting brand:", error);
    return { error: "Không thể xóa thương hiệu" };
  }
}
