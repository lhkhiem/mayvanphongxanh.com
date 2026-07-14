"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- CERTIFICATES ---

export async function getCertificates() {
  try {
    const certs = await prisma.partnerCertificate.findMany({
      include: { brand: true },
      orderBy: { order: 'asc' }
    });
    return { data: certs };
  } catch (error: any) {
    console.error("Error fetching certificates:", error);
    return { error: "Không thể lấy danh sách chứng nhận" };
  }
}

export async function createCertificate(data: {
  brandId: number;
  badge: string;
  scope: string;
  region: string;
  validDate: string;
  link?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}) {
  try {
    const cert = await prisma.partnerCertificate.create({
      data: {
        brand: { connect: { id: data.brandId } },
        badge: data.badge,
        scope: data.scope,
        region: data.region,
        validDate: data.validDate,
        link: data.link,
        image: data.image,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    });
    
    // Automatically set isPartner = true for the brand
    await prisma.brand.update({
      where: { id: data.brandId },
      data: { isPartner: true }
    });

    revalidatePath('/admin/partners');
    revalidatePath('/doi-tac');
    return { data: cert };
  } catch (error: any) {
    console.error("Error creating certificate:", error);
    return { error: error.message || "Không thể tạo chứng nhận" };
  }
}

export async function updateCertificate(id: number, data: {
  brandId: number;
  badge: string;
  scope: string;
  region: string;
  validDate: string;
  link?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}) {
  try {
    const cert = await prisma.partnerCertificate.update({
      where: { id },
      data: {
        brand: { connect: { id: data.brandId } },
        badge: data.badge,
        scope: data.scope,
        region: data.region,
        validDate: data.validDate,
        link: data.link,
        image: data.image,
        order: data.order,
        isActive: data.isActive,
      }
    });
    
    // Automatically set isPartner = true for the brand
    await prisma.brand.update({
      where: { id: data.brandId },
      data: { isPartner: true }
    });

    revalidatePath('/admin/partners');
    revalidatePath('/doi-tac');
    return { data: cert };
  } catch (error: any) {
    console.error("Error updating certificate:", error);
    return { error: error.message || "Không thể cập nhật chứng nhận" };
  }
}

export async function deleteCertificate(id: number) {
  try {
    await prisma.partnerCertificate.delete({ where: { id } });
    revalidatePath('/admin/partners');
    revalidatePath('/doi-tac');
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting certificate:", error);
    return { error: "Không thể xóa chứng nhận" };
  }
}

// --- BENEFITS ---

export async function getBenefits() {
  try {
    const benefits = await prisma.partnerBenefit.findMany({
      orderBy: { order: 'asc' }
    });
    return { data: benefits };
  } catch (error: any) {
    console.error("Error fetching benefits:", error);
    return { error: "Không thể lấy danh sách quyền lợi" };
  }
}

export async function createBenefit(data: {
  icon: string;
  title: string;
  description: string;
  order?: number;
  isActive?: boolean;
}) {
  try {
    const benefit = await prisma.partnerBenefit.create({
      data: {
        icon: data.icon,
        title: data.title,
        description: data.description,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    });
    revalidatePath('/admin/partners');
    revalidatePath('/doi-tac');
    return { data: benefit };
  } catch (error: any) {
    console.error("Error creating benefit:", error);
    return { error: error.message || "Không thể tạo quyền lợi" };
  }
}

export async function updateBenefit(id: number, data: {
  icon: string;
  title: string;
  description: string;
  order?: number;
  isActive?: boolean;
}) {
  try {
    const benefit = await prisma.partnerBenefit.update({
      where: { id },
      data: {
        icon: data.icon,
        title: data.title,
        description: data.description,
        order: data.order,
        isActive: data.isActive,
      }
    });
    revalidatePath('/admin/partners');
    revalidatePath('/doi-tac');
    return { data: benefit };
  } catch (error: any) {
    console.error("Error updating benefit:", error);
    return { error: error.message || "Không thể cập nhật quyền lợi" };
  }
}

export async function deleteBenefit(id: number) {
  try {
    await prisma.partnerBenefit.delete({ where: { id } });
    revalidatePath('/admin/partners');
    revalidatePath('/doi-tac');
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting benefit:", error);
    return { error: "Không thể xóa quyền lợi" };
  }
}

// --- BRAND IS_PARTNER TOGGLE ---

export async function toggleBrandPartner(brandId: number, isPartner: boolean) {
  try {
    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: { isPartner }
    });
    revalidatePath('/admin/partners');
    revalidatePath('/admin/brands');
    revalidatePath('/doi-tac');
    return { data: brand };
  } catch (error: any) {
    console.error("Error toggling brand partner status:", error);
    return { error: "Không thể cập nhật trạng thái đối tác của thương hiệu" };
  }
}
