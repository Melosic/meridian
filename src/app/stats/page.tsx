'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar } from 'antd-mobile';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  SetOutline,
  PieOutline,
} from 'antd-mobile-icons';
import { useItemStore, useAccountStore } from '@/store';
import { formatMoney } from '@/lib/utils';

export default function StatsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stats');

  const items = useItemStore((s) => s.items);
  const accounts = useAccountStore((s) => s.accounts);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const settledItems = items.filter((item) => item.settled).length;
    const unsettledItems = totalItems - settledItems;
    
    const totalSales = items.reduce((sum, item) => sum + item.price, 0);
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    const totalShipping = items.reduce((sum, item) => sum + item.shipping, 0);
    const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);
    
    const settledProfit = items.filter((item) => item.settled).reduce((sum, item) => sum + item.profit, 0);
    const unsettledProfit = items.filter((item) => !item.settled).reduce((sum, item) => sum + item.profit, 0);

    return {
      totalItems,
      settledItems,
      unsettledItems,
      totalSales,
      totalCost,
      totalShipping,
      totalProfit,
      settledProfit,
      unsettledProfit,
    };
  }, [items]);

  const accountStats = useMemo(() => {
    return accounts.map((account) => {
      const boughtItems = items.filter((item) => item.buyAccountId === account.id);
      const soldItems = items.filter((item) => item.sellAccountId === account.id);
      const shippingItems = items.filter((item) => item.shippingAccountId === account.id);
      
      const costReceivable = boughtItems
        .filter((item) => !item.settled)
        .reduce((sum, item) => sum + item.cost, 0);
      
      const shippingReceivable = shippingItems
        .filter((item) => !item.settled && item.shippingAccountId !== item.sellAccountId)
        .reduce((sum, item) => sum + item.shipping, 0);
      
      const salesReceivable = soldItems
        .filter((item) => item.settled)
        .reduce((sum, item) => sum + item.price, 0);
      
      const netProfit = soldItems
        .filter((item) => item.settled)
        .reduce((sum, item) => sum + item.profit, 0);

      return {
        account,
        itemCount: boughtItems.length + soldItems.length,
        costReceivable,
        shippingReceivable,
        salesReceivable,
        netProfit,
        totalReceivable: costReceivable + shippingReceivable,
      };
    });
  }, [accounts, items]);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#E8E4DD' }}>
      <div 
        className="relative px-6 pt-14 pb-10"
        style={{ background: 'linear-gradient(180deg, #F5F2ED 0%, #E8E4DD 100%)' }}
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>利润统计</h1>
          <p className="text-sm mt-2 font-light" style={{ color: '#64748b' }}>财务数据一览</p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-5">
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-6" style={{ color: '#0f172a' }}>总体概览</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs mb-1.5 font-semibold" style={{ color: '#64748b' }}>商品总数</div>
              <div className="text-3xl font-bold" style={{ color: '#0f172a' }}>{stats.totalItems}</div>
            </div>
            <div>
              <div className="text-xs mb-1.5 font-semibold" style={{ color: '#64748b' }}>已结算/待结算</div>
              <div className="text-3xl font-bold" style={{ color: '#0f172a' }}>{stats.settledItems}/{stats.unsettledItems}</div>
            </div>
            <div>
              <div className="text-xs mb-1.5 font-semibold" style={{ color: '#64748b' }}>总销售额</div>
              <div className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatMoney(stats.totalSales)}</div>
            </div>
            <div>
              <div className="text-xs mb-1.5 font-semibold" style={{ color: '#64748b' }}>总成本</div>
              <div className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatMoney(stats.totalCost)}</div>
            </div>
            <div>
              <div className="text-xs mb-1.5 font-semibold" style={{ color: '#64748b' }}>总邮费</div>
              <div className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatMoney(stats.totalShipping)}</div>
            </div>
            <div>
              <div className="text-xs mb-1.5 font-semibold" style={{ color: '#64748b' }}>总利润</div>
              <div className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'profit-text' : 'loss-text'}`}>
                {formatMoney(stats.totalProfit)}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-6" style={{ color: '#0f172a' }}>结算状态</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs mb-1.5 font-semibold" style={{ color: '#64748b' }}>已结算利润</div>
              <div className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatMoney(stats.settledProfit)}</div>
            </div>
            <div>
              <div className="text-xs mb-1.5 font-semibold" style={{ color: '#64748b' }}>待结算利润</div>
              <div className={`text-xl font-bold ${stats.unsettledProfit >= 0 ? 'profit-text' : 'loss-text'}`}>
                {formatMoney(stats.unsettledProfit)}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-6" style={{ color: '#0f172a' }}>账号统计</h3>
          {accountStats.length === 0 ? (
            <div className="text-slate-500 text-center py-8 font-semibold">暂无账号数据</div>
          ) : (
            <div className="space-y-6">
              {accountStats.map((stat) => (
                <div key={stat.account.id} className="pb-6 last:pb-0 border-b last:border-0" style={{ borderColor: 'rgba(15, 23, 42, 0.1)' }}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg" style={{ color: '#0f172a' }}>{stat.account.name}</span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ color: '#64748b', background: 'rgba(255,255,255,0.4)' }}>{stat.itemCount}笔交易</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs font-semibold" style={{ color: '#64748b' }}>应收成本 </span>
                      <span className="font-bold" style={{ color: '#f59e0b' }}>{formatMoney(stat.costReceivable)}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold" style={{ color: '#64748b' }}>应收邮费 </span>
                      <span className="font-bold" style={{ color: '#f59e0b' }}>{formatMoney(stat.shippingReceivable)}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold" style={{ color: '#64748b' }}>已收货款 </span>
                      <span className="font-bold" style={{ color: '#10b981' }}>{formatMoney(stat.salesReceivable)}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold" style={{ color: '#64748b' }}>净利润 </span>
                      <span className={`font-bold ${stat.netProfit >= 0 ? 'profit-text' : 'loss-text'}`}>
                        {formatMoney(stat.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass-tabbar flex justify-around py-3 px-4 z-50">
        <button 
          onClick={() => { setActiveTab('home'); router.push('/'); }}
          className="flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all cursor-pointer"
          style={{}}
        >
          <AppstoreOutline style={{ fontSize: 24, color: activeTab === 'home' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 11, color: activeTab === 'home' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'home' ? 700 : 500 }}>首页</span>
        </button>
        <button 
          onClick={() => { setActiveTab('items'); router.push('/items'); }}
          className="flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all cursor-pointer"
          style={{}}
        >
          <UnorderedListOutline style={{ fontSize: 24, color: activeTab === 'items' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 11, color: activeTab === 'items' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'items' ? 700 : 500 }}>商品</span>
        </button>
        <button 
          onClick={() => { setActiveTab('stats'); router.push('/stats'); }}
          className="flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all cursor-pointer"
          style={{}}
        >
          <PieOutline style={{ fontSize: 24, color: activeTab === 'stats' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 11, color: activeTab === 'stats' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'stats' ? 700 : 500 }}>统计</span>
        </button>
        <button 
          onClick={() => { setActiveTab('accounts'); router.push('/accounts'); }}
          className="flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all cursor-pointer"
          style={{}}
        >
          <SetOutline style={{ fontSize: 24, color: activeTab === 'accounts' ? '#0f172a' : '#64748b' }} />
          <span style={{ fontSize: 11, color: activeTab === 'accounts' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'accounts' ? 700 : 500 }}>账号</span>
        </button>
      </div>
    </div>
  );
}
