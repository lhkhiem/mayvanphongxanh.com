"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ContactStatus } from "@prisma/client";
import { logAuditAction } from "@/lib/audit-logger";

export async function updateContactStatus(id: string, status: ContactStatus) {
  try {
    const contact = await prisma.contactRequest.update({
      where: { id },
      data: { status },
    });

    await logAuditAction({
      action: "STATUS_CHANGE",
      entity: "CUSTOMER",
      entityId: id,
      details: `Cập nhật trạng thái xử lý yêu cầu liên hệ từ KH ${contact.name} sang ${status === 'PROCESSED' ? 'Đã xử lý' : 'Chờ xử lý'}`
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

    await logAuditAction({
      action: "DELETE",
      entity: "CUSTOMER",
      entityId: id,
      details: `Xóa yêu cầu liên hệ ID #${id}`
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

    await logAuditAction({
      action: "DELETE",
      entity: "CUSTOMER",
      entityId: id,
      details: `Xóa đăng ký nhận tin tức ID #${id}`
    });

    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (error) {
    console.error("Delete Newsletter Error:", error);
    return { error: "Không thể xóa email này." };
  }
}
