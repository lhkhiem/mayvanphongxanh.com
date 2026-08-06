"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FolderTree,
  Wrench,
  FolderGit2,
  HardDrive,
  MessageSquare,
  Clock,
  CheckCircle,
  ExternalLink,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ContentDashboardData } from "@/app/(admin)/admin/(dashboard)/actions";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 MB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function ContentDashboardView({ data }: { data: ContentDashboardData }) {
  return (
    <div className="space-y-6">
      {/* 1. Summary KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Posts Card */}
        <Card className="border-l-4 border-l-sky-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Bài Viết Blog / Tin Tức
                </p>
                <h3 className="text-2xl font-bold mt-1 text-sky-600">
                  {data.totalPosts} <span className="text-sm font-normal text-muted-foreground">bài</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-600 font-semibold">{data.activePosts} bài</span> đang hiển thị
                </p>
              </div>
              <div className="p-3 bg-sky-100 rounded-full text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services & Projects */}
        <Card className="border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Dịch Vụ & Dự Án
                </p>
                <h3 className="text-2xl font-bold mt-1 text-teal-600">
                  {data.totalServices + data.totalProjects}{" "}
                  <span className="text-sm font-normal text-muted-foreground">mục</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.totalServices} Dịch vụ | {data.totalProjects} Dự án công trình
                </p>
              </div>
              <div className="p-3 bg-teal-100 rounded-full text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Contacts */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Yêu Cầu Báo Giá / Tư Vấn
                </p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600">
                  {data.pendingContactRequests}{" "}
                  <span className="text-sm font-normal text-muted-foreground">chưa xử lý</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Cần phản hồi khách hàng ngay</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Storage */}
        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Thư Viện Media (Assets)
                </p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">
                  {data.totalMediaAssets}{" "}
                  <span className="text-sm font-normal text-muted-foreground">tệp</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Dung lượng: <span className="font-medium text-foreground">{formatBytes(data.mediaSizeBytes)}</span>
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <HardDrive className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Content Widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Customer Contact Requests */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <div>
                <CardTitle className="text-base font-semibold">Yêu Cầu Báo Giá & Tư Vấn Mới</CardTitle>
                <p className="text-xs text-muted-foreground">Khách hàng gửi form từ trang web</p>
              </div>
            </div>
            <Link href="/admin/feedback">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {data.recentContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <p>Không có yêu cầu tư vấn mới nào chờ xử lý.</p>
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {data.recentContacts.map((contact) => (
                  <div key={contact.id} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{contact.name}</span>
                        <span className="font-mono text-muted-foreground text-[11px]">{contact.phone}</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        Nhu cầu: <span className="font-medium text-foreground">{contact.service || "Tư vấn chung"}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(contact.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      {contact.status === "PENDING" ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Chưa xử lý
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Đã liên hệ
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Blog Posts */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-500" />
              <div>
                <CardTitle className="text-base font-semibold">Bài Viết Mới Nhất</CardTitle>
                <p className="text-xs text-muted-foreground">Cập nhật tin tức & kiến thức sản phẩm</p>
              </div>
            </div>
            <Link href="/admin/posts">
              <Button size="sm" className="text-xs gap-1 bg-sky-600 hover:bg-sky-700">
                <Plus className="w-3.5 h-3.5" /> Thêm bài viết
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {data.recentPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Chưa có bài viết nào trong hệ thống.
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {data.recentPosts.map((post) => (
                  <div key={post.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span className="bg-muted px-1.5 py-0.5 rounded">{post.categoryName}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Hiển thị
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Ẩn
                        </span>
                      )}
                      <Link href={`/admin/posts`} className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
