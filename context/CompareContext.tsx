'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CompareItem {
  id: number;
  name: string;
  category: string;
  image: string;
}

interface CompareContextType {
  items: CompareItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addCompareItem: (item: CompareItem) => { success: boolean; message?: string };
  removeCompareItem: (id: number) => void;
  clearCompare: () => void;
  hasItem: (id: number) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('mvpx_compare_list');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to parse compare list:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save to sessionStorage when items change
  useEffect(() => {
    if (isInitialized) {
      sessionStorage.setItem('mvpx_compare_list', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Also manage auto-open/close based on items length
  useEffect(() => {
    if (isInitialized) {
      if (items.length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [items.length, isInitialized]);

  const addCompareItem = (product: CompareItem) => {
    // Limit to 3 items
    if (items.length >= 3 && !items.find(i => i.id === product.id)) {
      return { success: false, message: 'Bạn chỉ có thể so sánh tối đa 3 sản phẩm.' };
    }

    // Check same category
    if (items.length > 0 && items[0].category !== product.category) {
      return { success: false, message: 'Chỉ có thể so sánh sản phẩm cùng danh mục!' };
    }

    let isSuccess = true;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, product];
    });

    return { success: isSuccess };
  };

  const removeCompareItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompare = () => {
    setItems([]);
  };

  const hasItem = (id: number) => {
    return items.some((item) => item.id === id);
  };

  return (
    <CompareContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addCompareItem,
        removeCompareItem,
        clearCompare,
        hasItem,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
