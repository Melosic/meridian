export interface Account {
  id: string;
  name: string;
  type: 'buy' | 'sell' | 'shipping';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemImage {
  id: string;
  data: string;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId?: string;
  buyAccountId: string;
  sellAccountId: string;
  shippingAccountId: string;
  price: number;
  cost: number;
  shipping: number;
  profit: number;
  images: ItemImage[];
  remark?: string;
  settled: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface SettlementLog {
  id: string;
  itemId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  type: 'cost' | 'shipping';
  createdAt: string;
}

export interface AppState {
  accounts: Account[];
  categories: Category[];
  items: Item[];
  settlementLogs: SettlementLog[];
}
