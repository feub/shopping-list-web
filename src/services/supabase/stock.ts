import { supabase } from './client';
import type { StockEntry } from '../../types/models';

export interface StockRowWithProduct {
  id: string;
  product_id: string;
  list_id: string;
  quantity: number;
  unit: string | null;
  updated_at: string;
  updated_by: string | null;
  products: {
    name: string;
  } | null;
}

function mapRow(row: StockRowWithProduct): StockEntry {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? '',
    listId: row.list_id,
    quantity: row.quantity,
    unit: row.unit,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

export class StockService {
  static async getListStock(listId: string): Promise<{ data: StockEntry[] | null; error: unknown }> {
    const { data, error } = await supabase
      .from('stock')
      .select('*, products(name)')
      .eq('list_id', listId)
      .order('updated_at', { ascending: false });

    if (error) return { data: null, error };
    return { data: (data as StockRowWithProduct[]).map(mapRow), error: null };
  }

  static async incrementStock(
    productId: string,
    listId: string,
    delta = 1
  ): Promise<{ error: unknown }> {
    const { error } = await supabase.rpc('upsert_stock', {
      p_product_id: productId,
      p_list_id: listId,
      p_quantity_delta: delta,
    });
    return { error };
  }

  static async decrementStock(
    stockId: string,
    currentQuantity: number,
    delta = 1
  ): Promise<{ data: unknown; error: unknown; blocked: boolean }> {
    if (currentQuantity < delta) {
      return { data: null, error: null, blocked: true };
    }
    const newQty = currentQuantity - delta;
    const { data, error } = await supabase
      .from('stock')
      .update({ quantity: newQty })
      .eq('id', stockId)
      .gte('quantity', delta)
      .select()
      .single();

    if (!data && !error) {
      return { data: null, error: null, blocked: true };
    }
    return { data, error, blocked: false };
  }

  static async setStock(
    productId: string,
    listId: string,
    quantity: number,
    unit: string | null
  ): Promise<{ data: unknown; error: unknown }> {
    const sanitizedUnit = unit ? sanitize(unit) : null;
    const { data, error } = await supabase
      .from('stock')
      .upsert(
        {
          product_id: productId,
          list_id: listId,
          quantity: Math.max(0, quantity),
          unit: sanitizedUnit,
        },
        { onConflict: 'product_id,list_id' }
      )
      .select()
      .single();
    return { data, error };
  }

  static async deleteStock(stockId: string): Promise<{ error: unknown }> {
    const { error } = await supabase.from('stock').delete().eq('id', stockId);
    return { error };
  }
}
