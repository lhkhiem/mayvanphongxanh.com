"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ContactStatus } from "@prisma/client";

export async function updateContactStatus(id: string, status: ContactStatus) {
  try {
    await prisma.contactRequest.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error) {
    console.error("Update Contact Status Error:", error);
    return { error: "Không thể cập nhật trạng thái." };
  }
}

export async function deleteContactRequest(id: string) {
  try {
    await prisma.contactRequest.delete({
      where: { id },
    });
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error) {
    console.error("Delete Contact Error:", error);
    return { error: "Không thể xóa yêu cầu liên hệ." };
  }
}

export async function deleteNewsletter(id: string) {
  try {
    await prisma.newsletterSubscription.delete({
      where: { id },
    });
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error) {
    console.error("Delete Newsletter Error:", error);
    return { error: "Không thể xóa email này." };
  }
}
