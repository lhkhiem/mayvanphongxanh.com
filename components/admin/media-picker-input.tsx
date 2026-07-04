"use client";

import { useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { MediaPickerModal } from "./media-picker-modal";
import { cn } from "@/lib/utils";

interface MediaPickerInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function MediaPickerInput({
  value,
  onChange,
  label,
  placeholder = "Chưa chọn ảnh",
  className,
  name,
}: MediaPickerInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        {/* Hidden input for form submission */}
        {name && <input type="hidden" name={name} value={value} />}

        {/* Preview + Trigger */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-3 py-2 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors shadow-sm"
        >
          {value ? (
            <>
              <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100 dark:bg-gray-800">
                <img src={value} alt="Selected" className="w-full h-full object-cover" />
              </div>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">{value}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="shrink-0 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
                title="Xóa ảnh"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-md border border-dashed border-gray-300 dark:border-gray-600 shrink-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-gray-400" />
              </div>
              <span className="flex-1 text-sm text-gray-400 dark:text-gray-500">{placeholder}</span>
              <span className="shrink-0 text-xs text-primary font-medium group-hover:underline">
                Chọn ảnh
              </span>
            </>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={onChange}
      />
    </>
  );
}
