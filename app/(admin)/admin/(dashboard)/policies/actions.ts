"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    revalidatePath("/admin/policies");
    return { success: true, policy };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deletePolicy(id: number) {
  try {
    await prisma.productPolicy.delete({ where: { id } });
    revalidatePath("/admin/policies");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
