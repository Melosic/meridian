import { create } from 'zustand';
import type { Category } from '@/types';
import { getCategories, saveCategories } from '@/lib/db';
import { generateId } from '@/lib/utils';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  loadCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<boolean>;
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,

  loadCategories: async () => {
    set({ isLoading: true });
    const categories = await getCategories();
    set({ categories, isLoading: false });
  },

  addCategory: async (data) => {
    const now = new Date().toISOString();
    const newCategory: Category = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const categories = [...get().categories, newCategory];
    await saveCategories(categories);
    set({ categories });
  },

  updateCategory: async (id, data) => {
    const categories = get().categories.map((cat) =>
      cat.id === id ? { ...cat, ...data, updatedAt: new Date().toISOString() } : cat
    );
    await saveCategories(categories);
    set({ categories });
  },

  deleteCategory: async (id) => {
    const categories = get().categories.filter((cat) => cat.id !== id);
    await saveCategories(categories);
    set({ categories });
    return true;
  },

  getCategoryById: (id) => {
    return get().categories.find((cat) => cat.id === id);
  },
}));
