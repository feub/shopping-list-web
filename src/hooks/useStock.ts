import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StockService } from '../services/supabase/stock';
import type { StockEntry } from '../types/models';

export function useStock(listId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['stock', listId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!listId) return [];
      const { data, error } = await StockService.getListStock(listId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!listId,
  });

  const increment = useMutation({
    mutationFn: ({ productId, listId: lid }: { productId: string; listId: string }) =>
      StockService.incrementStock(productId, lid),
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<StockEntry[]>(queryKey);
      queryClient.setQueryData<StockEntry[]>(queryKey, (old) =>
        old?.map((e) => (e.productId === productId ? { ...e, quantity: e.quantity + 1 } : e))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const decrement = useMutation({
    mutationFn: ({
      stockId,
      currentQuantity,
    }: {
      stockId: string;
      currentQuantity: number;
      productId: string;
    }) => StockService.decrementStock(stockId, currentQuantity),
    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<StockEntry[]>(queryKey);
      queryClient.setQueryData<StockEntry[]>(queryKey, (old) =>
        old?.map((e) =>
          e.productId === productId && e.quantity > 0
            ? { ...e, quantity: e.quantity - 1 }
            : e
        )
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const setStock = useMutation({
    mutationFn: ({
      productId,
      listId: lid,
      quantity,
      unit,
    }: {
      productId: string;
      listId: string;
      quantity: number;
      unit: string | null;
    }) => StockService.setStock(productId, lid, quantity, unit),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteStock = useMutation({
    mutationFn: ({ stockId }: { stockId: string }) => StockService.deleteStock(stockId),
    onMutate: async ({ stockId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<StockEntry[]>(queryKey);
      queryClient.setQueryData<StockEntry[]>(queryKey, (old) =>
        old?.filter((e) => e.id !== stockId)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { query, increment, decrement, setStock, deleteStock };
}
