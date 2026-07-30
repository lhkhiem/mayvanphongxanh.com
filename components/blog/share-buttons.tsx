"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  excerpt?: string;
  slug: string;
}

export function ShareButtons({ title, excerpt, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/tin-tuc/${slug}`);
      setHasNativeShare(!!navigator.share);
    }
  }, [slug]);

  const handleCopyLink = async () => {
    try {
      const urlToCopy = shareUrl || window.location.href;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success("Đã sao chép liên kết bài viết!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép liên kết");
    }
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl || window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=500");
  };

  const handleZaloShare = () => {
    const url = encodeURIComponent(shareUrl || window.location.href);
    window.open(`https://zalo.me/share?url=${url}`, "_blank", "width=600,height=500");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url: shareUrl || window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1 shrink-0">
        <Share2 className="w-3.5 h-3.5 text-primary" /> Chia sẻ:
      </span>

      {/* Facebook Share Button */}
      <button
        type="button"
        onClick={handleFacebookShare}
        className="w-8 h-8 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer shrink-0"
        title="Chia sẻ lên Facebook"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>

      {/* Zalo Share Button */}
      <button
        type="button"
        onClick={handleZaloShare}
        className="w-8 h-8 rounded-full bg-[#0068ff] hover:bg-[#005bd9] text-white font-extrabold text-xs flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer shrink-0"
        title="Chia sẻ qua Zalo"
      >
        <span className="leading-none text-[11px] tracking-tight">Zalo</span>
      </button>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={`w-8 h-8 rounded-full border text-xs flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0 ${
          copied
            ? "bg-emerald-50 border-emerald-300 text-emerald-600"
            : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600"
        }`}
        title={copied ? "Đã sao chép liên kết!" : "Sao chép liên kết bài viết"}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Device Native Share (Mobile) */}
      {hasNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 text-xs flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0"
          title="Tùy chọn chia sẻ khác"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      )}
    </div>
  );
}
