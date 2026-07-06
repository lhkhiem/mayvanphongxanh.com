import { prisma } from "@/lib/db";
import FeedbackClient from "./feedback-client";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const contactRequests = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const newsletters = await prisma.newsletterSubscription.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Liên hệ</h2>
      </div>
      
      <FeedbackClient 
        initialContacts={contactRequests} 
        initialNewsletters={newsletters} 
      />
    </div>
  );
}
