"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit-logger";

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
    
    await prisma.brand.update({
      where: { id: data.brandId },
      data: { isPartner: true }
    });

    await logAuditAction({
      action: "CREATE",
      entity: "PARTNER",
      entityId: cert.id,
      details: `Tạo chứng nhận đối tác mới (Badge: ${data.badge})`,
      metadata: { badge: data.badge, brandId: data.brandId }
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
    
    await prisma.brand.update({
      where: { id: data.brandId },
      data: { isPartner: true }
    });

    await logAuditAction({
      action: "UPDATE",
      entity: "PARTNER",
      entityId: id,
      details: `Cập nhật chứng nhận đối tác ID #${id}`,
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

    await logAuditAction({
      action: "DELETE",
      entity: "PARTNER",
      entityId: id,
      details: `Xóa chứng nhận đối tác ID #${id}`
    });

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

    await logAuditAction({
      action: "CREATE",
      entity: "PARTNER",
      entityId: benefit.id,
      details: `Tạo quyền lợi đối tác mới: ${data.title}`
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

    await logAuditAction({
      action: "UPDATE",
      entity: "PARTNER",
      entityId: id,
      details: `Cập nhật quyền lợi đối tác ID #${id}: ${data.title}`
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

    await logAuditAction({
      action: "DELETE",
      entity: "PARTNER",
      entityId: id,
      details: `Xóa quyền lợi đối tác ID #${id}`
    });

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

    await logAuditAction({
      action: "STATUS_CHANGE",
      entity: "BRAND",
      entityId: brandId,
      details: `Cập nhật trạng thái đối tác của thương hiệu ID #${brandId} sang ${isPartner ? 'Đại lý/Đối tác' : 'Bình thường'}`
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
