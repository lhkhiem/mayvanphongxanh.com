"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export function CertificateImageZoom({ image }: { image: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setOpen(true)}
        className="relative w-full h-40 mb-6 rounded-lg overflow-hidden border border-slate-100 group bg-slate-50 flex items-center justify-center p-2 cursor-pointer"
        title="Nhấn để phóng to"
      >
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <div className="bg-white p-2 rounded-full shadow-sm text-gray-700">
            <Search className="w-5 h-5" />
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Certificate" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl border-none shadow-none bg-transparent p-0 flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Certificate Zoom" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CertificateAction({ link, image }: { link?: string | null, image?: string | null }) {
  const [open, setOpen] = useState(false);

  if (link) {
    return (
      <Link href={link} className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors">
        Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  if (image) {
    return (
      <>
        <button onClick={() => setOpen(true)} className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors">
          Xem hình ảnh <Search className="h-3.5 w-3.5" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl border-none shadow-none bg-transparent p-0 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Certificate Zoom" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <span className="text-sm text-slate-400">Không có dữ liệu</span>
  );
}
