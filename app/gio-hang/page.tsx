'use client';

import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const cartItems = [
    { id: 1, name: 'MultiFunction Laser Printer', price: 599.99, quantity: 1, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop' },
    { id: 2, name: 'Compatible Toner Cartridge', price: 49.99, quantity: 2, image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop' },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-6 border-b border-border last:border-b-0">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-muted" />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{item.name}</h3>
                      <p className="text-lg font-bold text-primary mb-4">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button className="p-2 hover:bg-muted transition-colors">
                            <Minus className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <span className="px-4 py-2 text-foreground font-semibold">{item.quantity}</span>
                          <button className="p-2 hover:bg-muted transition-colors">
                            <Plus className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                        <span className="text-foreground font-semibold ml-auto">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button className="p-2 hover:bg-red-50 transition-colors rounded-lg">
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground mb-6">Your cart is empty</p>
                <Link href="/san-pham" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-foreground mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {shipping === 0 && (
                <p className="text-sm text-green-600 font-semibold mb-4 p-3 bg-green-50 rounded-lg">
                  ✓ Free shipping on this order
                </p>
              )}

              <Link href="/checkout" className="w-full block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center mb-3">
                Proceed to Checkout
              </Link>
              
              <Link href="/san-pham" className="w-full block px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
