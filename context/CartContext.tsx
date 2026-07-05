'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  variantId?: string;
  cartItemId: string; // Composite ID: e.g., "1", "28-v3510-i3-8", "29-cpu-i5-ram-16"
  name: string;
  variantName?: string; // Additional string to display, e.g., "(Core i5, 8GB RAM)"
  sku?: string;
  attributes?: Record<string, string>;
  customOptions?: unknown;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('mvpx_cart');
      if (storedCart) {
        const parsedItems = JSON.parse(storedCart) as CartItem[];
        setItems(parsedItems.map((item) => ({
          ...item,
          cartItemId: item.cartItemId || (item.variantId ? `${item.id}-${item.variantId}` : String(item.id)),
        })));
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('mvpx_cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const cartItemId = product.cartItemId || (product.variantId ? `${product.id}-${product.variantId}` : String(product.id));
    const normalizedProduct = { ...product, cartItemId };

    setItems((prev) => {
      const existingItem = prev.find((item) => item.cartItemId === cartItemId);
      if (existingItem) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...normalizedProduct, quantity }];
    });
    setIsOpen(true); // Auto open cart on add
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
