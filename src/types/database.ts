export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock: {
        Row: {
          id: string;
          product_id: string;
          list_id: string;
          quantity: number;
          unit: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          list_id: string;
          quantity?: number;
          unit?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          list_id?: string;
          quantity?: number;
          unit?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'stock_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      lists: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      list_members: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_stock: {
        Args: {
          p_product_id: string;
          p_list_id: string;
          p_quantity_delta: number;
        };
        Returns: undefined;
      };
      is_list_member: {
        Args: {
          p_list_id: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
