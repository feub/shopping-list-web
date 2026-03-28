import { useState } from 'react';
import type { StockEntry } from '../../types/models';

interface Props {
  entry: StockEntry;
  onSave: (quantity: number, unit: string | null) => void;
  onClose: () => void;
}

export function StockEditModal({ entry, onSave, onClose }: Props) {
  const [quantity, setQuantity] = useState(String(entry.quantity));
  const [unit, setUnit] = useState(entry.unit ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) return;
    onSave(qty, unit.trim() || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-stone-800">
        <h2 className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">
          Edit: {entry.productName}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
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
              className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
