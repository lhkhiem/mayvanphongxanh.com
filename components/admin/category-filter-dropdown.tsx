"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
  color: string | null;
  icon: string | null;
  _count?: { products: number };
};

interface CategoryFilterDropdownProps {
  categories: Category[];
  value: number | undefined;
  onChange: (id: number | undefined) => void;
}

export function CategoryFilterDropdown({
  categories,
  value,
  onChange,
}: CategoryFilterDropdownProps) {
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

  const parents = categories.filter((c) => c.parentId === null);
  const getChildren = (parentId: number) =>
    categories.filter((c) => c.parentId === parentId);

  const selected = categories.find((c) => c.id === value);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors shadow-sm bg-white dark:bg-[#2a303d] min-w-[180px] max-w-[240px]",
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}
      >
        {selected ? (
          <>
            <span
              className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white text-[9px] font-bold"
              style={{ backgroundColor: selected.color || "#6366f1" }}
            >
              {selected.icon || selected.name.charAt(0)}
            </span>
            <span className="flex-1 text-left text-gray-800 dark:text-gray-100 truncate">
              {selected.name}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="ml-auto p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </span>
          </>
        ) : (
          <>
            <Tag className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="flex-1 text-left text-gray-500 dark:text-gray-400">
              Tất cả danh mục
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
        <div className="absolute z-30 top-full mt-1.5 left-0 min-w-[220px] max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252b3a] shadow-xl">
          {/* All categories option */}
          <button
            type="button"
            onClick={() => { onChange(undefined); setOpen(false); }}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left",
              !value
                ? "bg-primary/10 text-primary font-medium"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            )}
          >
            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center shrink-0">
              <Tag className="h-3 w-3 text-gray-500 dark:text-gray-300" />
            </div>
            <span>Tất cả danh mục</span>
            {!value && <Check className="h-3.5 w-3.5 ml-auto" />}
          </button>

          <div className="border-t border-gray-100 dark:border-gray-700/60" />

          {/* Parent + child rows */}
          {parents.map((parent) => {
            const children = getChildren(parent.id);
            const isParentSelected = value === parent.id;

            return (
              <div key={parent.id}>
                {/* Parent row */}
                <button
                  type="button"
                  onClick={() => { onChange(parent.id); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left",
                    isParentSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[9px] font-bold shadow-sm"
                    style={{ backgroundColor: parent.color || "#6366f1" }}
                  >
                    {parent.icon || parent.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 font-medium">{parent.name}</span>
                  {parent._count?.products !== undefined && (
                    <span className="text-[10px] text-gray-400 shrink-0 mr-1">
                      {parent._count.products}
                    </span>
                  )}
                  {isParentSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                </button>

                {/* Children */}
                {children.map((child) => {
                  const isChildSelected = value === child.id;
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => { onChange(child.id); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-2 pl-8 pr-3 py-2 text-sm transition-colors text-left",
                        isChildSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      )}
                    >
                      {/* Tree line */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-3 h-px bg-gray-300 dark:bg-gray-600 inline-block" />
                        <div
                          className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold"
                          style={{ backgroundColor: child.color || parent.color || "#6366f1", opacity: 0.85 }}
                        >
                          {child.icon || child.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <span className="flex-1 truncate">{child.name}</span>
                      {child._count?.products !== undefined && (
                        <span className="text-[10px] text-gray-400 shrink-0 mr-1">
                          {child._count.products}
                        </span>
                      )}
                      {isChildSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </button>
                  );
                })}

                {/* Separator between parent groups */}
                <div className="border-t border-gray-100 dark:border-gray-700/40 last:hidden" />
              </div>
            );
          })}

          {categories.length === 0 && (
            <p className="px-4 py-6 text-sm text-center text-gray-400">
              Chưa có danh mục nào
            </p>
          )}
        </div>
      )}
    </div>
  );
}
