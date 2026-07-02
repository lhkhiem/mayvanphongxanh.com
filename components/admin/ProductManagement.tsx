'use client';

import { products } from '@/lib/mockData';
import { Edit2, Trash2, Plus } from 'lucide-react';

export function ProductManagement() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Product Management</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Price</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Stock</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Rating</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-secondary transition-colors">
                <td className="px-4 py-3 text-foreground font-medium">{product.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                <td className="px-4 py-3 text-foreground">${product.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.stock > 10 ? 'bg-green-100 text-green-800' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} units
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">⭐ {product.rating}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-secondary rounded transition-colors">
                      <Edit2 className="w-4 h-4 text-accent" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
