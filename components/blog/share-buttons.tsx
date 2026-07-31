"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title?: string;
  excerpt?: string;
  slug?: string;
  url?: string;
  className?: string;
}

export function ShareButtons({ title, excerpt, slug, url, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullUrl = url || (slug ? `${window.location.origin}/tin-tuc/${slug}` : window.location.href);
      setShareUrl(fullUrl);
      setHasNativeShare(!!navigator.share);
    }
  }, [slug, url]);

  const getTargetUrl = () => shareUrl || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopyLink = async () => {
    try {
      const urlToCopy = getTargetUrl();
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success("Đã sao chép liên kết!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép liên kết");
    }
  };

  const handleFacebookShare = () => {
    const targetUrl = encodeURIComponent(getTargetUrl());
    const width = 600;
    const height = 500;
    const left = typeof window !== "undefined" ? Math.max(0, Math.floor(window.screen.width / 2 - width / 2)) : 0;
    const top = typeof window !== "undefined" ? Math.max(0, Math.floor(window.screen.height / 2 - height / 2)) : 0;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${targetUrl}`,
      "_blank",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
  };

  const handleZaloShare = async () => {
    const targetUrl = getTargetUrl();
    const encodedUrl = encodeURIComponent(targetUrl);

    // Tự động sao chép link để tiện lợi khi gửi
    try {
      await navigator.clipboard.writeText(targetUrl);
    } catch (e) {
      // Ignore clipboard error
    }

    // Link chia sẻ chuẩn của Zalo Social Plugin (mở khung chọn bạn bè / đăng nhật ký)
    const zaloShareUrl = `https://sp.zalo.me/plugins/share?url=${encodedUrl}`;

    const width = 600;
    const height = 650;
    const left = typeof window !== "undefined" ? Math.max(0, Math.floor(window.screen.width / 2 - width / 2)) : 0;
    const top = typeof window !== "undefined" ? Math.max(0, Math.floor(window.screen.height / 2 - height / 2)) : 0;

    const popup = window.open(
      zaloShareUrl,
      "zalo-share-dialog",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    if (popup) {
      toast.success("Đã mở cửa sổ Zalo! Bạn có thể chọn gửi bạn bè hoặc đăng nhật ký.");
    } else {
      window.open(zaloShareUrl, "_blank");
      toast.success("Đã sao chép liên kết & mở Zalo!");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Chia sẻ trang này",
          text: excerpt || title || "",
          url: getTargetUrl(),
        });
      } catch (err) {
        // User cancelled share
      }
    }
  };

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
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
        title="Chia sẻ qua Zalo (Gửi bạn bè / Đăng nhật ký)"
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
        title={copied ? "Đã sao chép liên kết!" : "Sao chép liên kết"}
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

