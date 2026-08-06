"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit-logger";

export async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: { deletedAt: null }
            }
          }
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

    await logAuditAction({
      action: "CREATE",
      entity: "BRAND",
      entityId: brand.id,
      details: `Tạo thương hiệu mới: ${data.name}`,
      metadata: { name: data.name, slug: finalSlug }
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

    await logAuditAction({
      action: "UPDATE",
      entity: "BRAND",
      entityId: id,
      details: `Cập nhật thương hiệu: ${data.name}`,
      metadata: { name: data.name, slug: data.slug }
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
      include: {
        _count: {
          select: {
            products: {
              where: { deletedAt: null }
            }
          }
        }
      }
    });

    if (!brand) return { error: "Không tìm thấy thương hiệu" };

    if (brand._count.products > 0) {
      return { error: `Không thể xóa vì thương hiệu này đang có ${brand._count.products} sản phẩm` };
    }

    await prisma.brand.delete({ where: { id } });

    await logAuditAction({
      action: "DELETE",
      entity: "BRAND",
      entityId: id,
      details: `Xóa thương hiệu: ${brand.name} (ID #${id})`
    });
    
    revalidatePath('/admin/brands');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting brand:", error);
    return { error: "Không thể xóa thương hiệu" };
  }
}
