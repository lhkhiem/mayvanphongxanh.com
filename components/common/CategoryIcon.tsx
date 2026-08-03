"use client";

import React from "react";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  icon?: string | null;
  name?: string;
  color?: string | null;
  className?: string;
  iconClassName?: string;
  fallbackSize?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function CategoryIcon({
  icon,
  name,
  color,
  className,
  iconClassName = "w-full h-full object-contain",
}: CategoryIconProps) {
  const iconStr = icon?.trim() || "";

  // If icon is provided (URL or image path from Media Manager)
  if (iconStr) {
    // Check if it's an image path / URL / SVG / PNG
    const isImage =
      iconStr.startsWith("http://") ||
      iconStr.startsWith("https://") ||
      iconStr.startsWith("/") ||
      iconStr.startsWith("data:image/") ||
      /\.(png|jpe?g|svg|webp|gif)(\?.*)?$/i.test(iconStr);

    if (isImage) {
      return (
        <span className={cn("inline-flex items-center justify-center shrink-0 overflow-hidden", className)}>
          {/* eslint-disable-next-html-img-element */}
          <img
            src={iconStr}
            alt={name || "Icon danh mục"}
            className={cn("object-contain", iconClassName)}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </span>
      );
    }

    // If string is an emoji or text
    return (
      <span className={cn("inline-flex items-center justify-center shrink-0 leading-none select-none", className)}>
        {iconStr}
      </span>
    );
  }

  // Fallback if no icon is selected: Clean folder icon or monogram
  const bgColor = color || "#3b82f6";
  const initial = name ? name.trim().charAt(0).toUpperCase() : "D";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 rounded-md text-white font-bold text-xs select-none shadow-xs",
        className
      )}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initial}
    </span>
  );
}

export default CategoryIcon;
