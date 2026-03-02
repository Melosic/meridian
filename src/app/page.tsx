'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryStore, useItemStore } from '@/store';
import { formatMoney } from '@/lib/utils';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  SetOutline,
  PieOutline,
  RightOutline,
} from 'antd-mobile-icons';

export default function HomePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  const categories = useCategoryStore((s) => s.categories);
  const items = useItemStore((s) => s.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getCategoryStats = (categoryId: string) => {
    const categoryItems = items.filter((item) => item.categoryId === categoryId);
    const totalProfit = categoryItems.reduce((sum, item) => sum + item.profit, 0);
    const totalCount = categoryItems.length;
    return { totalProfit, totalCount };
  };

  const totalStats = {
    totalItems: items.length,
    totalProfit: items.reduce((sum, item) => sum + item.profit, 0),
    totalSales: items.reduce((sum, item) => sum + item.price, 0),
    settledCount: items.filter((item) => item.settled).length,
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)' }}>
        <div className="animate-pulse text-base" style={{ color: '#64748b' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)' }}>
      <div className="relative px-6 pt-14 pb-12" style={{ background: 'transparent' }}>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#0f172a' }}>Meridian</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card p-4 text-center cursor-default">
              <div className="text-2xl font-bold" style={{ color: '#0f172a' }}>{totalStats.totalItems}</div>
              <div className="text-xs mt-2 font-semibold" style={{ color: '#64748b' }}>商品总数</div>
            </div>
            <div className="stat-card p-4 text-center cursor-default">
              <div className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatMoney(totalStats.totalSales)}</div>
              <div className="text-xs mt-2 font-semibold" style={{ color: '#64748b' }}>总销售额</div>
            </div>
            <div className="stat-card p-4 text-center cursor-default">
              <div className={`text-2xl font-bold ${totalStats.totalProfit >= 0 ? 'profit-text' : 'loss-text'}`}>
                {formatMoney(totalStats.totalProfit)}
              </div>
              <div className="text-xs mt-2 font-semibold" style={{ color: '#64748b' }}>总利润</div>
            </div>
            <div 
              className="stat-card p-4 text-center cursor-pointer"
              onClick={() => router.push('/stats')}
            >
              <div className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{totalStats.settledCount}</div>
              <div className="text-xs mt-2 font-semibold" style={{ color: '#64748b' }}>已结算</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: '#0f172a' }}>商品分类</h2>
          <button 
            onClick={() => router.push('/categories')}
            className="text-sm font-semibold transition-all hover:opacity-70 cursor-pointer"
            style={{ color: '#64748b' }}
          >
            管理
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state-card cursor-pointer flex flex-col items-center justify-center py-12" onClick={() => router.push('/categories')}>
            <div className="text-slate-500 mb-6 font-semibold text-lg">暂无分类</div>
            <button 
              onClick={(e) => { e.stopPropagation(); router.push('/categories'); }}
              className="glass-button px-8 py-3.5 text-sm cursor-pointer"
            >
              去添加分类
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category, index) => {
              const stats = getCategoryStats(category.id);
              return (
                <div 
                  key={category.id}
                  className="glass-card p-5 cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push(`/items?categoryId=${category.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div 
                        className="category-icon"
                        style={{ background: `linear-gradient(135deg, ${category.color || '#0f172a'} 0%, ${category.color || '#1e293b'} 100%)` }}
                      >
                        {category.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-lg" style={{ color: '#0f172a' }}>{category.name}</div>
                        <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>{stats.totalCount} 件商品</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'profit-text' : 'loss-text'}`}>
                        {formatMoney(stats.totalProfit)}
                      </div>
                      <RightOutline style={{ color: '#94a3b8', fontSize: 16 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass-tabbar flex justify-around py-3 px-2 z-50">
        <button 
          onClick={() => { setActiveTab('home'); router.push('/'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <AppstoreOutline style={{ fontSize: 22, color: activeTab === 'home' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'home' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'home' ? 700 : 500 }}>首页</span>
        </button>
        <button 
          onClick={() => { setActiveTab('items'); router.push('/items'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <UnorderedListOutline style={{ fontSize: 22, color: activeTab === 'items' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'items' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'items' ? 700 : 500 }}>商品</span>
        </button>
        <button 
          onClick={() => { setActiveTab('settlement'); router.push('/settlement'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <PieOutline style={{ fontSize: 22, color: activeTab === 'settlement' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'settlement' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'settlement' ? 700 : 500 }}>结算</span>
        </button>
        <button 
          onClick={() => { setActiveTab('accounts'); router.push('/accounts'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <SetOutline style={{ fontSize: 22, color: activeTab === 'accounts' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'accounts' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'accounts' ? 700 : 500 }}>账号</span>
        </button>
        <button 
          onClick={() => { setActiveTab('settings'); router.push('/settings'); }}
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-2xl transition-all cursor-pointer"
        >
          <RightOutline style={{ fontSize: 22, color: activeTab === 'settings' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 10, color: activeTab === 'settings' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'settings' ? 700 : 500 }}>设置</span>
        </button>
      </div>
    </div>
  );
}
