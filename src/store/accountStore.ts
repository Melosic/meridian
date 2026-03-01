import { create } from 'zustand';
import type { Account } from '@/types';
import { getAccounts, saveAccounts } from '@/lib/db';
import { generateId } from '@/lib/utils';

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  loadAccounts: () => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<boolean>;
  getAccountById: (id: string) => Account | undefined;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  isLoading: false,

  loadAccounts: async () => {
    set({ isLoading: true });
    const accounts = await getAccounts();
    set({ accounts, isLoading: false });
  },

  addAccount: async (data) => {
    const now = new Date().toISOString();
    const newAccount: Account = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const accounts = [...get().accounts, newAccount];
    await saveAccounts(accounts);
    set({ accounts });
  },

  updateAccount: async (id, data) => {
    const accounts = get().accounts.map((acc) =>
      acc.id === id ? { ...acc, ...data, updatedAt: new Date().toISOString() } : acc
    );
    await saveAccounts(accounts);
    set({ accounts });
  },

  deleteAccount: async (id) => {
    const accounts = get().accounts.filter((acc) => acc.id !== id);
    await saveAccounts(accounts);
    set({ accounts });
    return true;
  },

  getAccountById: (id) => {
    return get().accounts.find((acc) => acc.id === id);
  },
}));
