export interface StockEntry {
  id: string;
  productId: string;
  productName: string;
  listId: string;
  quantity: number;
  unit: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export interface Product {
  id: string;
  name: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  name: string;
}
