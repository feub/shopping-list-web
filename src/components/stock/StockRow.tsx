import { useState } from 'react';
import { clsx } from 'clsx';
import type { StockEntry } from '../../types/models';
import { StockEditModal } from './StockEditModal';

interface Props {
  entry: StockEntry;
  onIncrement: () => void;
  onDecrement: () => void;
  onEdit: (quantity: number, unit: string | null) => void;
  onDelete: () => void;
}

export function StockRow({ entry, onIncrement, onDecrement, onEdit, onDelete }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isAtZero = entry.quantity === 0;

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-stone-800">
        <div className="min-w-0 flex-1">
          <span className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
            {entry.productName}
          </span>
          {entry.unit && (
            <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">{entry.unit}</span>
          )}
        </div>
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-sm font-bold text-white',
            isAtZero ? 'bg-red-500' : 'bg-orange-600'
          )}
        >
          {entry.quantity}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onDecrement}
            disabled={isAtZero}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
            aria-label="Decrease"
          >
            −
          </button>
          <button
            onClick={onIncrement}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            aria-label="Increase"
          >
            +
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600"
            aria-label="Edit"
          >
            ✎
          </button>
          {confirmDelete ? (
            <>
              <button
                onClick={onDelete}
                className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg bg-stone-100 px-2 py-1 text-xs text-stone-700 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-red-100 hover:text-red-600 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              aria-label="Delete"
            >
              🗑
            </button>
          )}
        </div>
      </div>
      {showEdit && (
        <StockEditModal
          entry={entry}
          onSave={(qty, unit) => {
            onEdit(qty, unit);
            setShowEdit(false);
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
