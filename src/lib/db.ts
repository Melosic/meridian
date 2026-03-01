import type { Account, Category, Item, SettlementLog } from '@/types';

const DB_KEYS = {
  ACCOUNTS: 'accounts',
  CATEGORIES: 'categories',
  ITEMS: 'items',
  SETTLEMENT_LOGS: 'settlementLogs',
} as const;

let localforage: any = null;

async function getLocalForage() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!localforage) {
    const localforageModule = await import('localforage');
    localforage = localforageModule.default;
    localforage.config({
      name: 'Meridian',
      storeName: 'meridian_db',
    });
  }
  return localforage;
}

export async function getData<T>(key: string): Promise<T[]> {
  const lf = await getLocalForage();
  if (!lf) return [];
  const data = await (lf.getItem(key) as Promise<T[]>);
  return data || [];
}

export async function setData<T>(key: string, data: T[]): Promise<void> {
  const lf = await getLocalForage();
  if (!lf) return;
  await lf.setItem(key, data);
}

export async function getAccounts(): Promise<Account[]> {
  return getData<Account>(DB_KEYS.ACCOUNTS);
}

export async function saveAccounts(accounts: Account[]): Promise<void> {
  await setData(DB_KEYS.ACCOUNTS, accounts);
}

export async function getCategories(): Promise<Category[]> {
  return getData<Category>(DB_KEYS.CATEGORIES);
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await setData(DB_KEYS.CATEGORIES, categories);
}

export async function getItems(): Promise<Item[]> {
  return getData<Item>(DB_KEYS.ITEMS);
}

export async function saveItems(items: Item[]): Promise<void> {
  await setData(DB_KEYS.ITEMS, items);
}

export async function getSettlementLogs(): Promise<SettlementLog[]> {
  return getData<SettlementLog>(DB_KEYS.SETTLEMENT_LOGS);
}

export async function saveSettlementLogs(logs: SettlementLog[]): Promise<void> {
  await setData(DB_KEYS.SETTLEMENT_LOGS, logs);
}
