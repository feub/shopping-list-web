import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/supabase/auth';
import { StockList } from '../components/stock/StockList';
import { StockAddModal } from '../components/stock/StockAddModal';
import { ProductsService } from '../services/supabase/products';
import { StockService } from '../services/supabase/stock';
import type { Database } from '../types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];

interface ListOption {
  id: string;
  name: string;
}

const STORAGE_KEY = 'default_list_id';

export function StockPage() {
  const { user, signOut } = useAuth();
  const [lists, setLists] = useState<ListOption[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(
    localStorage.getItem(STORAGE_KEY)
  );
  const [showAdd, setShowAdd] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    if (!user) return;
    AuthService.getUserLists(user.id).then(({ data }) => {
      if (!data) return;
      const mapped: ListOption[] = data.flatMap((row) => {
        if (!row.lists) return [];
        const list = row.lists as unknown as { id: string; name: string };
        return [{ id: list.id, name: list.name }];
      });
      setLists(mapped);
      if (mapped.length > 0 && !selectedListId) {
        const id = mapped[0].id;
        setSelectedListId(id);
        localStorage.setItem(STORAGE_KEY, id);
      }
      setLoadingLists(false);
    });
  }, [user]);

  const handleListChange = (id: string) => {
    setSelectedListId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const handleAddStock = async (
    name: string,
    product: ProductRow | null,
    quantity: number,
    unit: string | null
  ) => {
    if (!selectedListId) return;
    setShowAdd(false);
    let prod = product;
    if (!prod) {
      const { data } = await ProductsService.findOrCreate(name);
      if (!data) return;
      prod = data;
    }
    await StockService.setStock(prod.id, selectedListId, quantity, unit);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-800">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-orange-600">Stock Manager</h1>
          <div className="flex items-center gap-3">
            {lists.length > 1 && (
              <select
                value={selectedListId ?? ''}
                onChange={(e) => handleListChange(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm text-stone-900 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
            {lists.length === 1 && (
              <span className="text-sm text-stone-600 dark:text-stone-400">{lists[0].name}</span>
            )}
            <button
              onClick={signOut}
              className="rounded-lg bg-stone-100 px-3 py-1 text-sm text-stone-700 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loadingLists ? (
          <div className="py-12 text-center text-sm text-stone-500">Loading lists...</div>
        ) : !selectedListId ? (
          <div className="py-12 text-center text-sm text-stone-500">No lists found.</div>
        ) : (
          <StockList listId={selectedListId} />
        )}
      </main>

      {selectedListId && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-2xl text-white shadow-lg hover:bg-orange-700"
          aria-label="Add stock"
        >
          +
        </button>
      )}

      {showAdd && (
        <StockAddModal
          onSave={handleAddStock}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
