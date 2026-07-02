'use client';

import { X, Minus, Plus, Trash2 } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
}

export function CartDrawer({ isOpen, onClose, items = [] }: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full md:w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-border pb-4">
                <div className="w-16 h-16 bg-secondary rounded-md flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm mb-1">{item.name}</p>
                  <p className="text-accent font-bold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button className="p-1 hover:bg-secondary rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  <div className="flex items-center gap-2 bg-secondary rounded">
                    <button className="p-1 hover:opacity-70">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button className="p-1 hover:opacity-70">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (10%):</span>
                <span className="text-foreground font-medium">${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-bold text-foreground">Total:</span>
              <span className="font-bold text-lg text-accent">${total.toFixed(2)}</span>
            </div>
            <button className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity">
              Checkout
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border-2 border-primary text-primary rounded-md font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
