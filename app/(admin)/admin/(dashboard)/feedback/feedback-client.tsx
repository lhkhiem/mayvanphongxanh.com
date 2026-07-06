"use client";

import { useState } from "react";
import { ContactRequest, NewsletterSubscription, ContactStatus } from "@prisma/client";
import { updateContactStatus, deleteContactRequest, deleteNewsletter } from "./actions";
import { Loader2, Trash2, CheckCircle, Clock } from "lucide-react";

interface FeedbackClientProps {
  initialContacts: ContactRequest[];
  initialNewsletters: NewsletterSubscription[];
}

export default function FeedbackClient({ initialContacts, initialNewsletters }: FeedbackClientProps) {
  const [activeTab, setActiveTab] = useState<"contact" | "newsletter">("contact");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: ContactStatus) => {
    setLoadingId(id);
    await updateContactStatus(id, status);
    setLoadingId(null);
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa yêu cầu này?")) {
      setLoadingId(id);
      await deleteContactRequest(id);
      setLoadingId(null);
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa email này?")) {
      setLoadingId(id);
      await deleteNewsletter(id);
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "contact"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Yêu cầu tư vấn ({initialContacts.length})
        </button>
        <button
          onClick={() => setActiveTab("newsletter")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "newsletter"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Đăng ký nhận tin ({initialNewsletters.length})
        </button>
      </div>

      <div className="bg-white rounded-md shadow border border-gray-200">
        {activeTab === "contact" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Nhu cầu</th>
                  <th className="px-4 py-3 max-w-xs">Nội dung</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {initialContacts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Chưa có yêu cầu tư vấn nào.
                    </td>
                  </tr>
                )}
                {initialContacts.map((contact) => (
                  <tr key={contact.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{contact.name}</td>
                    <td className="px-4 py-3">{contact.phone}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {contact.service}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={contact.message}>
                      {contact.message}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(contact.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric", 
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {contact.status === "PENDING" ? (
                        <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium w-max">
                          <Clock className="w-3 h-3 mr-1" /> Chờ xử lý
                        </span>
                      ) : (
                        <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium w-max">
                          <CheckCircle className="w-3 h-3 mr-1" /> Đã xử lý
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {contact.status === "PENDING" ? (
                          <button
                            disabled={loadingId === contact.id}
                            onClick={() => handleUpdateStatus(contact.id, "PROCESSED")}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loadingId === contact.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Xử lý xong"}
                          </button>
                        ) : (
                          <button
                            disabled={loadingId === contact.id}
                            onClick={() => handleUpdateStatus(contact.id, "PENDING")}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                          >
                            {loadingId === contact.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Đánh dấu chờ"}
                          </button>
                        )}
                        <button
                          disabled={loadingId === contact.id}
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày đăng ký</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {initialNewsletters.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Chưa có người đăng ký nhận tin.
                    </td>
                  </tr>
                )}
                {initialNewsletters.map((sub) => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{sub.email}</td>
                    <td className="px-4 py-3">
                      {sub.isActive ? (
                        <span className="text-green-600 text-xs font-medium">Đang hoạt động</span>
                      ) : (
                        <span className="text-gray-500 text-xs font-medium">Đã hủy</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(sub.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric", 
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={loadingId === sub.id}
                        onClick={() => handleDeleteNewsletter(sub.id)}
                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                        title="Xóa"
                      >
                        {loadingId === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
