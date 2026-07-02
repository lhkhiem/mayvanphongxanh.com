'use client';

import { X, Star, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    description: string;
    stock: number;
  };
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!isOpen || !product) return null;

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card">
            <h2 className="text-xl font-bold text-foreground">Quick View</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="bg-secondary rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">Product Image</div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        fill={i < Math.floor(product.rating) ? '#c4a57b' : '#e8e4df'}
                        color={i < Math.floor(product.rating) ? '#c4a57b' : '#e8e4df'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-accent">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>
                {product.stock < 5 && product.stock > 0 && (
                  <p className="text-orange-600 font-semibold text-sm">Only {product.stock} left in stock!</p>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{product.description}</p>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-foreground">Quantity:</span>
                  <div className="flex items-center gap-2 border border-border rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 text-foreground font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 py-2 hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    disabled={product.stock === 0}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`px-6 py-3 rounded-md font-semibold transition-all ${
                      isWishlisted
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="p-3 bg-secondary rounded-md text-sm text-foreground">
                {product.stock > 0 ? (
                  <p>✓ In stock and ready to ship</p>
                ) : (
                  <p className="text-red-600">Out of stock</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
