import { create } from 'zustand';
import type { Item } from '@/types';
import { getItems, saveItems } from '@/lib/db';
import { generateId, calculateProfit } from '@/lib/utils';

interface ItemState {
  items: Item[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'profit' | 'settled' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updateItem: (id: string, data: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<boolean>;
  getItemById: (id: string) => Item | undefined;
  getItemsByCategory: (categoryId: string) => Item[];
  checkItemCountByAccount: (accountId: string) => number;
  checkItemCountByCategory: (categoryId: string) => number;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  isLoading: false,

  loadItems: async () => {
    set({ isLoading: true });
    const items = await getItems();
    set({ items, isLoading: false });
  },

  addItem: async (data) => {
    const now = new Date().toISOString();
    const profit = calculateProfit(data.price, data.cost, data.shipping);
    const newItem: Item = {
      ...data,
      id: generateId(),
      profit,
      settled: false,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    const items = [...get().items, newItem];
    await saveItems(items);
    set({ items });
  },

  updateItem: async (id, data) => {
    const items = get().items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, ...data, updatedAt: new Date().toISOString(), version: item.version + 1 };
        updated.profit = calculateProfit(updated.price, updated.cost, updated.shipping);
        return updated;
      }
      return item;
    });
    await saveItems(items);
    set({ items });
  },

  deleteItem: async (id) => {
    const items = get().items.filter((item) => item.id !== id);
    await saveItems(items);
    set({ items });
    return true;
  },

  getItemById: (id) => {
    return get().items.find((item) => item.id === id);
  },

  getItemsByCategory: (categoryId) => {
    return get().items.filter((item) => item.categoryId === categoryId);
  },

  checkItemCountByAccount: (accountId) => {
    return get().items.filter(
      (item) => item.buyAccountId === accountId || item.sellAccountId === accountId || item.shippingAccountId === accountId
    ).length;
  },

  checkItemCountByCategory: (categoryId) => {
    return get().items.filter((item) => item.categoryId === categoryId).length;
  },
}));
