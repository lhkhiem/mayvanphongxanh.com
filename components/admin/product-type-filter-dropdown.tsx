"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Package, Tag, Layers, Settings2, Box } from "lucide-react";
import { cn } from "@/lib/utils";

const PRODUCT_TYPES = [
  { value: 'standard', label: 'Tiêu chuẩn', color: '#6b7280', icon: Package },
  { value: 'rental', label: 'Cho thuê', color: '#3b82f6', icon: Tag },
  { value: 'pre-packaged', label: 'Trọn gói', color: '#10b981', icon: Layers },
  { value: 'custom-build', label: 'Tùy chỉnh (Build)', color: '#8b5cf6', icon: Settings2 },
];

interface ProductTypeFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductTypeFilterDropdown({
  value,
  onChange,
}: ProductTypeFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = PRODUCT_TYPES.find((t) => t.value === value);
  const SelectedIcon = selected?.icon;

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-2 px-3 h-10 rounded-md border text-sm transition-colors shadow-sm bg-white dark:bg-[#2a303d] min-w-[170px]",
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}
      >
        {selected ? (
          <>
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: selected.color }}
            >
              {SelectedIcon && <SelectedIcon className="h-3 w-3" />}
            </span>
            <span className="flex-1 text-left text-gray-800 dark:text-gray-100 truncate font-medium">
              {selected.label}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('all');
              }}
              className="ml-auto p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </>
        ) : (
          <>
            <Box className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="flex-1 text-left text-gray-500 dark:text-gray-400">
              Tất cả loại SP
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-400 shrink-0 transition-transform",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-30 top-full mt-1.5 left-0 w-full min-w-[200px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252b3a] shadow-xl">
          {/* All types option */}
          <button
            type="button"
            onClick={() => { onChange('all'); setOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left",
              value === 'all'
                ? "bg-primary/10 text-primary font-medium"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            )}
          >
            <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
              <Box className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            </div>
            <span>Tất cả loại SP</span>
            {value === 'all' && <Check className="h-4 w-4 ml-auto" />}
          </button>

          <div className="border-t border-gray-100 dark:border-gray-700/60" />

          {/* Individual types */}
          <div className="p-1">
            {PRODUCT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = value === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => { onChange(type.value); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors text-left",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                  )}
                >
                  <div
                    className="w-6 h-6 rounded shrink-0 flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: type.color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="flex-1">{type.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
