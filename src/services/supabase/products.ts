import { supabase } from './client';
import type { Database } from '../../types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];

function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

export class ProductsService {
  static async searchProducts(
    query: string,
    limit = 10
  ): Promise<{ data: ProductRow[] | null; error: unknown }> {
    const sanitized = sanitize(query);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `${sanitized}%`)
      .order('name')
      .limit(limit);
    return { data, error };
  }

  static async findByName(name: string): Promise<{ data: ProductRow | null; error: unknown }> {
    const sanitized = sanitize(name);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', sanitized)
      .maybeSingle();
    return { data, error };
  }

  static async findOrCreate(name: string): Promise<{ data: ProductRow | null; error: unknown }> {
    const { data: existing, error: findError } = await ProductsService.findByName(name);
    if (findError) return { data: null, error: findError };
    if (existing) return { data: existing, error: null };

    const sanitized = sanitize(name);
    const { data, error } = await supabase
      .from('products')
      .insert({ name: sanitized })
      .select()
      .single();
    return { data, error };
  }
}
