'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  TabBar, 
  Button,
  SearchBar,
  Image,
  Selector,
  Dialog,
  Checkbox,
  Toast,
} from 'antd-mobile';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  SetOutline,
  PieOutline,
  FilterOutline,
  RightOutline,
  DeleteOutline,
} from 'antd-mobile-icons';
import { useItemStore, useCategoryStore, useAccountStore, useLanguageStore } from '@/store';
import { formatMoney } from '@/lib/utils';
import type { Item } from '@/types';

export default function ItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get('categoryId');
  const [activeTab, setActiveTab] = useState('items');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState(categoryIdParam || '');
  const [filterBuyAccountId, setFilterBuyAccountId] = useState('');
  const [filterSellAccountId, setFilterSellAccountId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const PAGE_SIZE = 20;

  const t = useLanguageStore((s) => s.translations);
  const language = useLanguageStore((s) => s.language);
  const items = useItemStore((s) => s.items);
  const deleteItem = useItemStore((s) => s.deleteItem);
  const categories = useCategoryStore((s) => s.categories);
  const accounts = useAccountStore((s) => s.accounts);

  const filteredItems = useMemo(() => {
    let result = items;
    
    if (filterCategoryId) {
      result = result.filter((item) => item.categoryId === filterCategoryId);
    }
    
    if (searchText) {
      result = result.filter((item) => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (filterBuyAccountId) {
      result = result.filter((item) => item.buyAccountId === filterBuyAccountId);
    }
    
    if (filterSellAccountId) {
      result = result.filter((item) => item.sellAccountId === filterSellAccountId);
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items, filterCategoryId, searchText, filterBuyAccountId, filterSellAccountId]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);

  const categoryName = filterCategoryId ? categories.find((c) => c.id === filterCategoryId)?.name : null;

  const clearFilters = () => {
    setFilterCategoryId('');
    setFilterBuyAccountId('');
    setFilterSellAccountId('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterCategoryId || filterBuyAccountId || filterSellAccountId;

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return;
    
    Dialog.confirm({
      title: t.common.confirm + ' ' + t.common.delete,
      onConfirm: async () => {
        for (const itemId of selectedItems) {
          await deleteItem(itemId);
        }
        setSelectedItems([]);
        setSelectMode(false);
        Toast.show({ content: t.common.success, position: 'bottom' });
      },
    });
  };

  useMemo(() => {
    setCurrentPage(1);
  }, [filterCategoryId, searchText, filterBuyAccountId, filterSellAccountId]);

  const renderItemCard = (item: Item, index: number) => {
    const buyAccount = accounts.find((a) => a.id === item.buyAccountId);
    const sellAccount = accounts.find((a) => a.id === item.sellAccountId);
    const category = item.categoryId ? categories.find((c) => c.id === item.categoryId) : null;
    const isSelected = selectedItems.includes(item.id);

    const handleClick = () => {
      if (selectMode) {
        toggleSelectItem(item.id);
      } else {
        router.push(`/items/${item.id}`);
      }
    };

    return (
      <div 
        key={item.id}
        className="animate-fade-in-up"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div 
          className="glass-card p-5 cursor-pointer"
          style={{ 
            border: selectMode && isSelected ? '2px solid #0f172a' : 'none'
          }}
          onClick={handleClick}
        >
          <div className="flex gap-4 items-start">
            {selectMode && (
              <Checkbox 
                checked={isSelected}
                onChange={() => toggleSelectItem(item.id)}
                className="shrink-0 mt-2"
              />
            )}
            {item.images.length > 0 && !selectMode && (
              <div className="relative shrink-0">
                <Image
                  src={item.images[0].data}
                  className="w-20 h-20 rounded-2xl"
                  style={{ width: 80, height: 80, objectFit: 'cover' }}
                  fit="cover"
                />
                {item.settled && (
                  <div 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    ✓
                  </div>
                )}
              </div>
            )}
            {item.images.length > 0 && selectMode && (
              <div className="relative shrink-0">
                <Image
                  src={item.images[0].data}
                  className="w-16 h-16 rounded-2xl"
                  style={{ width: 64, height: 64, objectFit: 'cover' }}
                  fit="cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold truncate" style={{ color: '#0f172a', fontSize: 16 }}>{item.name}</div>
              </div>
              <div className="text-xs mt-2 font-semibold" style={{ color: '#64748b' }}>
                买: {buyAccount?.name || '-'} · 卖: {sellAccount?.name || '-'}
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm font-semibold" style={{ color: '#64748b' }}>
                  {t.items.price}: <span style={{ color: '#0f172a', fontWeight: 700 }}>{formatMoney(item.price)}</span>
                </div>
                <div 
                  className="text-sm font-bold"
                  style={{ 
                    color: item.profit >= 0 ? '#059669' : '#dc2626'
                  }}
                >
                  {t.items.profit} {formatMoney(item.profit)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)' }}>
      <div 
        className="relative px-5 pt-14 pb-12"
        style={{ background: 'transparent' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
            {categoryName ? categoryName : t.app.items}
          </h1>
          {selectMode ? (
            <div className="flex gap-2">
              <Button
                fill="none"
                onClick={() => { toggleSelectAll(); }}
                className="cursor-pointer font-semibold text-sm"
                style={{ color: '#0f172a' }}
              >
                {selectedItems.length === filteredItems.length ? t.common.cancel : (language === 'zh' ? '全选' : 'Select All')}
              </Button>
              <Button
                fill="none"
                onClick={() => { setSelectMode(false); setSelectedItems([]); }}
                className="cursor-pointer font-semibold text-sm"
                style={{ color: '#64748b' }}
              >
                取消
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                fill="none"
                onClick={() => { if (items.length > 0) setSelectMode(true); }}
                className="cursor-pointer font-semibold"
                style={{ color: items.length > 0 ? '#0f172a' : '#94a3b8' }}
                disabled={items.length === 0}
              >
                {language === 'zh' ? '选择' : 'Select'}
              </Button>
              <Button
                fill="none"
                onClick={() => setFilterVisible(true)}
                className="cursor-pointer font-semibold"
                style={hasActiveFilters ? { color: '#0f172a' } : { color: '#64748b' }}
              >
                <FilterOutline />
              </Button>
            </div>
          )}
        </div>
        <SearchBar
          placeholder={t.common.search + ' ' + t.items.itemName}
          value={searchText}
          onChange={setSearchText}
          style={{ 
            '--border-radius': '9999px',
            background: 'rgba(255, 255, 255, 0.5)',
            height: 46,
          }}
        />
      </div>

      <div className="px-5">
        {filteredItems.length === 0 ? (
          <div className="empty-state-card cursor-pointer flex flex-col items-center justify-center py-12" onClick={() => router.push('/items/new')}>
            <div className="text-slate-500 mb-6 font-semibold text-lg">{t.common.noData}</div>
            <button 
              onClick={() => router.push('/items/new')}
              className="glass-button px-8 py-3.5 text-sm cursor-pointer"
            >
              {t.items.addItem}
            </button>
          </div>
        ) : (
          <>
            {paginatedItems.map(renderItemCard)}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-6">
                <button
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ 
                    background: currentPage > 1 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                    color: currentPage > 1 ? '#0f172a' : '#94a3b8'
                  }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </button>
                <span className="text-sm font-semibold" style={{ color: '#64748b' }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ 
                    background: currentPage < totalPages ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                    color: currentPage < totalPages ? '#0f172a' : '#94a3b8'
                  }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </button>
              </div>
            )}

            {selectMode && (
              <button 
                className="glass-button w-full py-4 text-base cursor-pointer mt-4"
                onClick={handleBatchDelete}
                disabled={selectedItems.length === 0}
                style={{ opacity: selectedItems.length === 0 ? 0.5 : 1 }}
              >
                {t.common.delete} {language === 'zh' ? '选中' : 'Selected'} ({selectedItems.length})
              </button>
            )}

            <div 
              className="my-8 p-6 text-center cursor-pointer transition-all hover:scale-[1.02]"
              style={{ 
                background: 'rgba(255, 255, 255, 0.3)', 
                borderRadius: '40px',
                border: '2px dashed rgba(15, 23, 42, 0.15)'
              }}
              onClick={() => router.push('/items/new')}
            >
              <div className="text-base mt-2 font-semibold" style={{ color: '#64748b' }}>{t.items.addItem}</div>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass-tabbar flex justify-around py-3 px-2 z-50">
        <button 
          onClick={() => { setActiveTab('home'); router.push('/'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <AppstoreOutline style={{ fontSize: 22, color: activeTab === 'home' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'home' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'home' ? 700 : 500 }}>{t.app.home}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('items'); router.push('/items'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <UnorderedListOutline style={{ fontSize: 22, color: activeTab === 'items' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'items' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'items' ? 700 : 500 }}>{t.app.items}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('settlement'); router.push('/settlement'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <PieOutline style={{ fontSize: 22, color: activeTab === 'settlement' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'settlement' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'settlement' ? 700 : 500 }}>{t.app.settlement}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('accounts'); router.push('/accounts'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <SetOutline style={{ fontSize: 22, color: activeTab === 'accounts' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'accounts' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'accounts' ? 700 : 500 }}>{t.app.accounts}</span>
        </button>
        <button 
          onClick={() => { setActiveTab('settings'); router.push('/settings'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <RightOutline style={{ fontSize: 22, color: activeTab === 'settings' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'settings' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'settings' ? 700 : 500 }}>{t.app.settings}</span>
        </button>
      </div>

      <Dialog
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title={<div className="font-bold" style={{ color: '#0f172a' }}>{language === 'zh' ? '筛选条件' : 'Filter'}</div>}
        content={
          <div className="space-y-6">
            <div>
              <div className="text-sm mb-4 font-semibold" style={{ color: '#64748b' }}>{t.items.category}</div>
              <Selector
                options={[
                  { label: language === 'zh' ? '不限' : 'All', value: '' },
                  ...categories.map((c) => ({ label: c.name, value: c.id })),
                ]}
                value={[filterCategoryId]}
                onChange={(val) => setFilterCategoryId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-4 font-semibold" style={{ color: '#64748b' }}>{t.items.buyAccount}</div>
              <Selector
                options={[
                  { label: language === 'zh' ? '不限' : 'All', value: '' },
                  ...accounts.map((a) => ({ label: a.name, value: a.id })),
                ]}
                value={[filterBuyAccountId]}
                onChange={(val) => setFilterBuyAccountId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-4 font-semibold" style={{ color: '#64748b' }}>{t.items.sellAccount}</div>
              <Selector
                options={[
                  { label: language === 'zh' ? '不限' : 'All', value: '' },
                  ...accounts.map((a) => ({ label: a.name, value: a.id })),
                ]}
                value={[filterSellAccountId]}
                onChange={(val) => setFilterSellAccountId(val[0] || '')}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                block 
                onClick={clearFilters}
                style={{ borderRadius: 9999, height: 48, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                {language === 'zh' ? '清空筛选' : 'Clear Filter'}
              </Button>
              <Button 
                block 
                onClick={() => setFilterVisible(false)}
                style={{ 
                  borderRadius: 9999,
                  height: 48,
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#fff',
                  border: 'none'
                }}
              >
                {language === 'zh' ? '应用筛选' : 'Apply Filter'}
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
}
