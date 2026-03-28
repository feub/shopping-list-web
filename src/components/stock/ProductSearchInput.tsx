import { useState, useEffect, useRef } from 'react';
import { ProductsService } from '../../services/supabase/products';
import type { Database } from '../../types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: ProductRow | null, name: string) => void;
}

export function ProductSearchInput({ value, onChange, onSelect }: Props) {
  const [results, setResults] = useState<ProductRow[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data } = await ProductsService.searchProducts(value);
      setResults(data ?? []);
      setOpen(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const hasExactMatch = results.some((r) => r.name.toLowerCase() === value.toLowerCase());

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
        autoComplete="off"
      />
      {open && (results.length > 0 || value.length >= 2) && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800">
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-700"
                onClick={() => {
                  onSelect(product, product.name);
                  onChange(product.name);
                  setOpen(false);
                }}
              >
                {product.name}
              </button>
            </li>
          ))}
          {!hasExactMatch && value.trim().length >= 2 && (
            <li>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-stone-100 dark:hover:bg-stone-700"
                onClick={() => {
                  onSelect(null, value.trim());
                  setOpen(false);
                }}
              >
                Add as new product: &quot;{value.trim()}&quot;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
