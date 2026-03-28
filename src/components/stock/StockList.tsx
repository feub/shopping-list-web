import { useStock } from '../../hooks/useStock';
import { StockRow } from './StockRow';

interface Props {
  listId: string;
}

export function StockList({ listId }: Props) {
  const { query, increment, decrement, setStock, deleteStock } = useStock(listId);

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-sm text-stone-500">Loading stock...</span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
        Failed to load stock. Please try again.
      </div>
    );
  }

  const entries = [...(query.data ?? [])].sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-stone-500">
        No stock entries yet. Add one with the + button.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <StockRow
          key={entry.id}
          entry={entry}
          onIncrement={() =>
            increment.mutate({ productId: entry.productId, listId: entry.listId })
          }
          onDecrement={() =>
            decrement.mutate({
              stockId: entry.id,
              currentQuantity: entry.quantity,
              productId: entry.productId,
            })
          }
          onEdit={(quantity, unit) =>
            setStock.mutate({
              productId: entry.productId,
              listId: entry.listId,
              quantity,
              unit,
            })
          }
          onDelete={() => deleteStock.mutate({ stockId: entry.id })}
        />
      ))}
    </div>
  );
}
