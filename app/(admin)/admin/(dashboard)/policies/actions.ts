"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit-logger";

export type PolicyInput = {
  title: string;
  description: string;
  icon: string;
};

export async function getPolicies() {
  return await prisma.productPolicy.findMany({
    orderBy: { id: "desc" },
  });
}

export async function createPolicy(data: PolicyInput) {
  try {
    const policy = await prisma.productPolicy.create({ data });

    await logAuditAction({
      action: "CREATE",
      entity: "SETTING",
      entityId: policy.id,
      details: `Tạo chính sách sản phẩm mới: ${data.title}`
    });

    revalidatePath("/admin/policies");
    return { success: true, policy };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePolicy(id: number, data: PolicyInput) {
  try {
    const policy = await prisma.productPolicy.update({
      where: { id },
      data,
    });

    await logAuditAction({
      action: "UPDATE",
      entity: "SETTING",
      entityId: id,
      details: `Cập nhật chính sách sản phẩm ID #${id}: ${data.title}`
    });

    revalidatePath("/admin/policies");
    return { success: true, policy };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deletePolicy(id: number) {
  try {
    await prisma.productPolicy.delete({ where: { id } });

    await logAuditAction({
      action: "DELETE",
      entity: "SETTING",
      entityId: id,
      details: `Xóa chính sách sản phẩm ID #${id}`
    });

    revalidatePath("/admin/policies");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
