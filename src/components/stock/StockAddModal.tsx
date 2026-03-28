import { useState } from 'react';
import type { Database } from '../../types/database';
import { ProductSearchInput } from './ProductSearchInput';

type ProductRow = Database['public']['Tables']['products']['Row'];

interface Props {
  onSave: (name: string, product: ProductRow | null, quantity: number, unit: string | null) => void;
  onClose: () => void;
}

export function StockAddModal({ onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) return;
    onSave(name.trim(), selectedProduct, qty, unit.trim() || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-stone-800">
        <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
          Add Stock
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Product
            </label>
            <ProductSearchInput
              value={name}
              onChange={(v) => {
                setName(v);
                setSelectedProduct(null);
              }}
              onSelect={(product, n) => {
                setSelectedProduct(product);
                setName(n);
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Quantity
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Unit (optional)
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. kg, L, pieces"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
