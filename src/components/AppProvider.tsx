'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useAccountStore, useCategoryStore, useItemStore } from '@/store';

export function AppProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    useAccountStore.getState().loadAccounts();
    useCategoryStore.getState().loadCategories();
    useItemStore.getState().loadItems();
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div style={{ color: '#1677ff' }}>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
