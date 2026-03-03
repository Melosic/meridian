'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TabBar,
  Button,
  Checkbox,
  Toast,
  Empty,
  Dialog,
} from 'antd-mobile';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  PieOutline,
  SetOutline,
  UserOutline,
  RightOutline,
} from 'antd-mobile-icons';
import { useItemStore, useAccountStore, useLanguageStore } from '@/store';
import { formatMoney } from '@/lib/utils';
import type { SettlementLog, Item } from '@/types';
import { getSettlementLogs, saveSettlementLogs } from '@/lib/db';

export default function SettlementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settlement');
  const [settleTab, setSettleTab] = useState<'unsettled' | 'settled'>('unsettled');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const t = useLanguageStore((s) => s.translations);
  const language = useLanguageStore((s) => s.language);
  const items = useItemStore((s) => s.items);
  const updateItem = useItemStore((s) => s.updateItem);
  const accounts = useAccountStore((s) => s.accounts);

  const unsettledItems = useMemo(() => {
    return items.filter((item) => !item.settled);
  }, [items]);

  const settledItems = useMemo(() => {
    return items.filter((item) => item.settled);
  }, [items]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => 
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const currentItems = settleTab === 'unsettled' ? unsettledItems : settledItems;
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map((item) => item.id));
    }
  };

  const calculateSettlements = (itemList: Item[]) => {
    const settlements: { from: string; to: string; amount: number; type: 'cost' | 'shipping' }[] = [];
    
    for (const item of itemList) {
      const sellAccount = accounts.find((a) => a.id === item.sellAccountId);
      const buyAccount = accounts.find((a) => a.id === item.buyAccountId);
      const shippingAccount = accounts.find((a) => a.id === item.shippingAccountId);
      
      if (sellAccount && buyAccount) {
        settlements.push({
          from: sellAccount.id,
          to: buyAccount.id,
          amount: item.cost,
          type: 'cost',
        });
      }
      
      if (sellAccount && shippingAccount && item.shippingAccountId !== item.sellAccountId) {
        settlements.push({
          from: sellAccount.id,
          to: shippingAccount.id,
          amount: item.shipping,
          type: 'shipping',
        });
      }
    }
    
    return settlements;
  };

  const handleSettle = async () => {
    if (selectedItems.length === 0) {
      Toast.show({ content: t.settlement.selectItems, position: 'bottom' });
      return;
    }

    const itemsToSettle = items.filter((item) => selectedItems.includes(item.id));
    
    Dialog.confirm({
      title: t.common.confirm + ' ' + t.settlement.settle,
      content: (
        <div>
          <div>{language === 'zh' ? `即将结算 ${selectedItems.length} 笔交易` : `Will settle ${selectedItems.length} transactions`}</div>
          <div className="mt-4 text-sm font-semibold" style={{ color: '#64748b' }}>
            {calculateSettlements(itemsToSettle).map((s, i) => {
              const from = accounts.find((a) => a.id === s.from);
              const to = accounts.find((a) => a.id === s.to);
              return (
                <div key={i} className="py-1.5">
                  {from?.name} → {to?.name}: {formatMoney(s.amount)} ({s.type === 'cost' ? (language === 'zh' ? '成本' : 'Cost') : (language === 'zh' ? '邮费' : 'Shipping')})
                </div>
              );
            })}
          </div>
        </div>
      ),
      onConfirm: async () => {
        setActionLoading(true);
        try {
          for (const itemId of selectedItems) {
            await updateItem(itemId, { settled: true });
          }
          
          const settlements = calculateSettlements(itemsToSettle);
          const logs: SettlementLog[] = settlements.map((s) => ({
            id: '',
            itemId: '',
            fromAccountId: s.from,
            toAccountId: s.to,
            amount: s.amount,
            type: s.type,
            createdAt: new Date().toISOString(),
          }));
          
          const existingLogs = await getSettlementLogs();
          await saveSettlementLogs([...existingLogs, ...logs]);
          
          Toast.show({ content: t.settlement.settlementComplete, position: 'bottom' });
          setSelectedItems([]);
        } catch (error) {
          Toast.show({ content: language === 'zh' ? '结算失败' : 'Settlement failed', position: 'bottom' });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleUnsettle = async () => {
    if (selectedItems.length === 0) {
      Toast.show({ content: language === 'zh' ? '请选择要取消结算的商品' : 'Please select items to unsettle', position: 'bottom' });
      return;
    }

    Dialog.confirm({
      title: language === 'zh' ? '确认取消结算' : 'Confirm Unsettle',
      content: language === 'zh' ? `即将取消 ${selectedItems.length} 笔交易的结算状态` : `Will unsettle ${selectedItems.length} transactions`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          for (const itemId of selectedItems) {
            await updateItem(itemId, { settled: false });
          }
          Toast.show({ content: language === 'zh' ? '取消结算成功' : 'Unsettle success', position: 'bottom' });
          setSelectedItems([]);
        } catch (error) {
          Toast.show({ content: '操作失败', position: 'bottom' });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const renderItemCard = (item: Item) => {
    const buyAccount = accounts.find((a) => a.id === item.buyAccountId);
    const sellAccount = accounts.find((a) => a.id === item.sellAccountId);
    const shippingAccount = accounts.find((a) => a.id === item.shippingAccountId);

    return (
      <div key={item.id} className="glass-card p-5 mb-4 cursor-pointer">
        <div className="flex items-start gap-4">
          <Checkbox 
            checked={selectedItems.includes(item.id)}
            onChange={() => handleSelectItem(item.id)}
          />
          <div className="flex-1">
            <div className="font-bold text-lg" style={{ color: '#0f172a' }}>{item.name}</div>
            <div className="text-xs mt-2 font-semibold" style={{ color: '#64748b' }}>
              买: {buyAccount?.name || '-'} · 卖: {sellAccount?.name || '-'}
              {shippingAccount?.id !== sellAccount?.id && ` · 邮: ${shippingAccount?.name || '-'}`}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm font-semibold" style={{ color: '#64748b' }}>
                {t.items.price} {formatMoney(item.price)} · {t.items.cost} {formatMoney(item.cost)}
                {item.shipping > 0 && ` · ${t.items.shipping} ${formatMoney(item.shipping)}`}
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
    );
  };

  const currentItems = settleTab === 'unsettled' ? unsettledItems : settledItems;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)' }}>
      <div 
        className="relative px-6 pt-14 pb-12"
        style={{ background: 'transparent' }}
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>{t.settlement.title}</h1>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10">
        <div className="flex gap-3 mb-6">
          <button
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer"
            style={{ 
              background: settleTab === 'unsettled' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'rgba(255,255,255,0.4)',
              color: settleTab === 'unsettled' ? '#fff' : '#64748b'
            }}
            onClick={() => { setSettleTab('unsettled'); setSelectedItems([]); }}
          >
            {t.settlement.unsettled} ({unsettledItems.length})
          </button>
          <button
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer"
            style={{ 
              background: settleTab === 'settled' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'rgba(255,255,255,0.4)',
              color: settleTab === 'settled' ? '#fff' : '#64748b'
            }}
            onClick={() => { setSettleTab('settled'); setSelectedItems([]); }}
          >
            {t.settlement.settled} ({settledItems.length})
          </button>
        </div>

        {currentItems.length > 0 && (
          <div className="mb-5 flex items-center justify-between">
            <Checkbox 
              checked={selectedItems.length === currentItems.length && currentItems.length > 0}
              onChange={handleSelectAll}
            >
              <span className="font-semibold" style={{ color: '#0f172a' }}>{language === 'zh' ? '全选' : 'Select All'}</span>
            </Checkbox>
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>
              已选 {selectedItems.length} 项
            </span>
          </div>
        )}

        {currentItems.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Empty description={<span className="font-semibold" style={{ color: '#64748b' }}>{settleTab === 'unsettled' ? (language === 'zh' ? '暂无待结算商品' : 'No items to settle') : (language === 'zh' ? '暂无已结算商品' : 'No settled items')}</span>} />
          </div>
        ) : (
          currentItems.map(renderItemCard)
        )}
      </div>

      {currentItems.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(240, 240, 240, 0.98), rgba(240, 240, 240, 0))' }}>
          <button 
            className="glass-button w-full py-4 text-base cursor-pointer"
            onClick={settleTab === 'unsettled' ? handleSettle : handleUnsettle}
            disabled={selectedItems.length === 0}
            style={{ opacity: selectedItems.length === 0 ? 0.5 : 1 }}
          >
            {settleTab === 'unsettled' ? `${t.settlement.settle} ${language === 'zh' ? '选中商品' : 'Selected'} (${selectedItems.length})` : `${language === 'zh' ? '取消结算' : 'Unsettle'} (${selectedItems.length})`}
          </button>
        </div>
      )}

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
    </div>
  );
}
