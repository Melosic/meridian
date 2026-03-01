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
} from 'antd-mobile';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  SetOutline,
  FilterOutline,
  CloseOutline,
} from 'antd-mobile-icons';
import { useItemStore, useCategoryStore, useAccountStore } from '@/store';
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

  const items = useItemStore((s) => s.items);
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

  const categoryName = filterCategoryId ? categories.find((c) => c.id === filterCategoryId)?.name : null;

  const clearFilters = () => {
    setFilterCategoryId('');
    setFilterBuyAccountId('');
    setFilterSellAccountId('');
  };

  const hasActiveFilters = filterCategoryId || filterBuyAccountId || filterSellAccountId;

  const renderItemCard = (item: Item, index: number) => {
    const buyAccount = accounts.find((a) => a.id === item.buyAccountId);
    const sellAccount = accounts.find((a) => a.id === item.sellAccountId);
    const category = item.categoryId ? categories.find((c) => c.id === item.categoryId) : null;

    return (
      <div 
        key={item.id}
        className="animate-fade-in-up"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div 
          className="glass-card p-5 cursor-pointer"
          onClick={() => router.push(`/items/${item.id}`)}
        >
          <div className="flex gap-4">
            {item.images.length > 0 && (
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
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold truncate" style={{ color: '#0f172a', fontSize: 16 }}>{item.name}</div>
              </div>
              <div className="text-xs mt-2 font-semibold" style={{ color: '#64748b' }}>
                买: {buyAccount?.name || '-'} · 卖: {sellAccount?.name || '-'}
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm font-semibold" style={{ color: '#64748b' }}>
                  售价: <span style={{ color: '#0f172a', fontWeight: 700 }}>{formatMoney(item.price)}</span>
                </div>
                <div 
                  className="text-sm font-bold"
                  style={{ 
                    color: item.profit >= 0 ? '#059669' : '#dc2626'
                  }}
                >
                  利润 {formatMoney(item.profit)}
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
            {categoryName ? categoryName : '商品'}
          </h1>
          <Button
            fill="none"
            onClick={() => setFilterVisible(true)}
            className="cursor-pointer font-semibold"
            style={hasActiveFilters ? { color: '#0f172a' } : { color: '#64748b' }}
          >
            <FilterOutline />
          </Button>
        </div>
        <SearchBar
          placeholder="搜索商品名称"
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
          <div className="empty-state-card cursor-pointer" onClick={() => router.push('/items/new')}>
            <div className="w-20 h-20 mx-auto mb-5 rounded-[2rem] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <span className="text-4xl">📦</span>
            </div>
            <div className="text-slate-500 mb-6 font-semibold text-lg">暂无商品</div>
            <button 
              onClick={() => router.push('/items/new')}
              className="glass-button px-8 py-3.5 text-sm cursor-pointer"
            >
              添加商品
            </button>
          </div>
        ) : (
          <>
            {filteredItems.map(renderItemCard)}
            <div 
              className="my-8 p-6 text-center cursor-pointer transition-all hover:scale-[1.02]"
              style={{ 
                background: 'rgba(255, 255, 255, 0.3)', 
                borderRadius: '40px',
                border: '2px dashed rgba(15, 23, 42, 0.15)'
              }}
              onClick={() => router.push('/items/new')}
            >
              <div className="text-base mt-2 font-semibold" style={{ color: '#64748b' }}>添加商品</div>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass-tabbar flex justify-around py-3 px-4 z-50">
        <button 
          onClick={() => { setActiveTab('home'); router.push('/'); }}
          className="flex flex-col items-center gap-1.5 py-2 px-6 rounded-2xl transition-all cursor-pointer"
          style={{}}
        >
          <AppstoreOutline style={{ fontSize: 24, color: activeTab === 'home' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 11, color: activeTab === 'home' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'home' ? 700 : 500 }}>首页</span>
        </button>
        <button 
          onClick={() => { setActiveTab('items'); router.push('/items'); }}
          className="flex flex-col items-center gap-1.5 py-2 px-6 rounded-2xl transition-all cursor-pointer"
          style={{}}
        >
          <UnorderedListOutline style={{ fontSize: 24, color: activeTab === 'items' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 11, color: activeTab === 'items' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'items' ? 700 : 500 }}>商品</span>
        </button>
        <button 
          onClick={() => { setActiveTab('accounts'); router.push('/accounts'); }}
          className="flex flex-col items-center gap-1.5 py-2 px-6 rounded-2xl transition-all cursor-pointer"
          style={{}}
        >
          <SetOutline style={{ fontSize: 24, color: activeTab === 'accounts' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 11, color: activeTab === 'accounts' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'accounts' ? 700 : 500 }}>账号</span>
        </button>
      </div>

      <Dialog
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        title={<div className="font-bold" style={{ color: '#0f172a' }}>筛选条件</div>}
        content={
          <div className="space-y-6">
            <div>
              <div className="text-sm mb-4 font-semibold" style={{ color: '#64748b' }}>分类</div>
              <Selector
                options={[
                  { label: '不限', value: '' },
                  ...categories.map((c) => ({ label: c.name, value: c.id })),
                ]}
                value={[filterCategoryId]}
                onChange={(val) => setFilterCategoryId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-4 font-semibold" style={{ color: '#64748b' }}>购买账号</div>
              <Selector
                options={[
                  { label: '不限', value: '' },
                  ...accounts.filter((a) => a.type === 'buy').map((a) => ({ label: a.name, value: a.id })),
                ]}
                value={[filterBuyAccountId]}
                onChange={(val) => setFilterBuyAccountId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-4 font-semibold" style={{ color: '#64748b' }}>销售账号</div>
              <Selector
                options={[
                  { label: '不限', value: '' },
                  ...accounts.filter((a) => a.type === 'sell').map((a) => ({ label: a.name, value: a.id })),
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
                清空筛选
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
                应用筛选
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
}
