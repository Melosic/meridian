'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button,
  Dialog,
  Toast,
  ProgressBar,
} from 'antd-mobile';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  SetOutline,
  PieOutline,
  RightOutline,
  ExclamationOutline,
  DeleteOutline,
  DownlandOutline,
  UploadOutline,
} from 'antd-mobile-icons';
import { useItemStore, useAccountStore, useCategoryStore } from '@/store';
import { saveItems, saveAccounts, saveCategories, saveSettlementLogs, getSettlementLogs } from '@/lib/db';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 500 * 1024 * 1024 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const items = useItemStore((s) => s.items);
  const accounts = useAccountStore((s) => s.accounts);
  const categories = useCategoryStore((s) => s.categories);
  const loadItems = useItemStore((s) => s.loadItems);
  const loadAccounts = useAccountStore((s) => s.loadAccounts);
  const loadCategories = useCategoryStore((s) => s.loadCategories);

  useEffect(() => {
    calculateStorageUsage();
  }, []);

  const calculateStorageUsage = async () => {
    const accounts = useAccountStore.getState().accounts;
    const categories = useCategoryStore.getState().categories;
    const items = useItemStore.getState().items;

    let totalSize = 0;
    totalSize += accounts.length * 200;
    totalSize += categories.length * 150;
    
    for (const item of items) {
      totalSize += item.name.length * 2;
      totalSize += item.remark ? item.remark.length * 2 : 0;
      for (const img of item.images) {
        totalSize += img.data.length * 0.75;
      }
    }

    setStorageInfo({
      used: Math.round(totalSize),
      total: 500 * 1024 * 1024,
    });
  };

  const handleClearData = async () => {
    try {
      await saveItems([]);
      await saveAccounts([]);
      await saveCategories([]);
      await saveSettlementLogs([]);
      
      await loadItems();
      await loadAccounts();
      await loadCategories();
      
      setClearDialogVisible(false);
      Toast.show({ content: '数据已清除', position: 'bottom' });
    } catch (error) {
      Toast.show({ content: '清除失败', position: 'bottom' });
    }
  };

  const handleExportJSON = async () => {
    const settlementLogs = await getSettlementLogs();
    
    const data = {
      accounts,
      categories,
      items,
      settlementLogs,
      exportedAt: new Date().toISOString(),
      version: 1,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meridian-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportDialogVisible(false);
    Toast.show({ content: 'JSON导出成功', position: 'bottom' });
  };

  const handleExportCSV = () => {
    const headers = ['商品名称', '分类', '购买账号', '销售账号', '邮费账号', '售价', '成本', '邮费', '利润', '备注', '是否结算', '创建时间'];
    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateStr;
      }
    };
    const rows = items.map(item => {
      const buyAccount = accounts.find(a => a.id === item.buyAccountId);
      const sellAccount = accounts.find(a => a.id === item.sellAccountId);
      const shippingAccount = accounts.find(a => a.id === item.shippingAccountId);
      const category = categories.find(c => c.id === item.categoryId);
      
      return [
        item.name,
        category?.name || '',
        buyAccount?.name || '',
        sellAccount?.name || '',
        shippingAccount?.name || '',
        item.price.toString(),
        item.cost.toString(),
        item.shipping.toString(),
        item.profit.toString(),
        item.remark || '',
        item.settled ? '是' : '否',
        formatDate(item.createdAt),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meridian-items-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExportDialogVisible(false);
    Toast.show({ content: 'CSV导出成功', position: 'bottom' });
  };

  const handleImportClick = () => {
    router.push('/import');
  };

  const storagePercent = Math.min((storageInfo.used / storageInfo.total) * 100, 100);

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)' }}>
      <div 
        className="relative px-6 pt-14 pb-12"
        style={{ background: 'transparent' }}
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>设置</h1>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-5">
        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-5" style={{ color: '#0f172a' }}>数据管理</h3>
          
          <div 
            className="flex items-center justify-between p-4 mb-4 cursor-pointer transition-all hover:bg-white/30 rounded-2xl"
            style={{ borderRadius: '16px' }}
            onClick={() => setExportDialogVisible(true)}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <DownlandOutline style={{ fontSize: 22, color: '#fff' }} />
              </div>
              <div>
                <div className="font-bold" style={{ color: '#0f172a' }}>导出数据</div>
                <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>导出为JSON或CSV</div>
              </div>
            </div>
            <RightOutline style={{ color: '#94a3b8', fontSize: 16 }} />
          </div>

          <div 
            className="flex items-center justify-between p-4 mb-4 cursor-pointer transition-all hover:bg-white/30 rounded-2xl"
            style={{ borderRadius: '16px' }}
            onClick={handleImportClick}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}
              >
                <UploadOutline style={{ fontSize: 22, color: '#fff' }} />
              </div>
              <div>
                <div className="font-bold" style={{ color: '#0f172a' }}>导入数据</div>
                <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>从备份文件导入</div>
              </div>
            </div>
            <RightOutline style={{ color: '#94a3b8', fontSize: 16 }} />
          </div>

          <div 
            className="flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-red-50 rounded-2xl"
            style={{ borderRadius: '16px' }}
            onClick={() => setClearDialogVisible(true)}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              >
                <DeleteOutline style={{ fontSize: 22, color: '#fff' }} />
              </div>
              <div>
                <div className="font-bold" style={{ color: '#ef4444' }}>清除本地数据</div>
                <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>删除所有本地数据</div>
              </div>
            </div>
            <RightOutline style={{ color: '#94a3b8', fontSize: 16 }} />
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-5" style={{ color: '#0f172a' }}>存储使用</h3>
          <div className="mb-3 flex justify-between text-sm">
            <span style={{ color: '#64748b' }}>已使用</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{storageInfo.used > 1024 ? `${(storageInfo.used / 1024).toFixed(2)} MB` : `${storageInfo.used} KB`} / {storageInfo.total / 1024 / 1024} MB</span>
          </div>
          <ProgressBar 
            percent={storagePercent} 
            style={{ 
              '--track-width': '8px',
              '--track-color': 'rgba(15, 23, 42, 0.1)',
              '--fill-color': storagePercent > 80 ? '#ef4444' : storagePercent > 50 ? '#f59e0b' : '#10b981',
            } as any}
          />
          <div className="mt-4 text-xs font-semibold" style={{ color: '#64748b' }}>
            数据存储在浏览器本地，超出限制可能导致存储失败
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-5" style={{ color: '#0f172a' }}>数据统计</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.4)' }}>
              <div className="text-2xl font-bold" style={{ color: '#0f172a' }}>{items.length}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>商品</div>
            </div>
            <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.4)' }}>
              <div className="text-2xl font-bold" style={{ color: '#0f172a' }}>{accounts.length}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>账号</div>
            </div>
            <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.4)' }}>
              <div className="text-2xl font-bold" style={{ color: '#0f172a' }}>{categories.length}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>分类</div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        visible={clearDialogVisible}
        onClose={() => setClearDialogVisible(false)}
        title={
          <div className="flex items-center gap-2 font-bold" style={{ color: '#ef4444' }}>
            <ExclamationOutline /> 确认清除
          </div>
        }
        content={
          <div className="text-base font-semibold" style={{ color: '#64748b' }}>
            确定要清除所有本地数据吗？此操作不可恢复！
          </div>
        }
        actions={[
          { text: '取消', key: 'cancel', onClick: () => setClearDialogVisible(false), style: { color: '#64748b' } },
          { 
            text: '确认清除', 
            key: 'confirm', 
            onClick: handleClearData,
            style: { color: '#ef4444', fontWeight: 700 }
          },
        ]}
      />

      <Dialog
        visible={exportDialogVisible}
        onClose={() => setExportDialogVisible(false)}
        title={<div className="font-bold" style={{ color: '#0f172a' }}>导出数据</div>}
        content={
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-white/50 rounded-2xl"
              style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.3)' }}
              onClick={handleExportJSON}
            >
              <div className="flex items-center gap-3">
                <div className="font-bold" style={{ color: '#0f172a' }}>JSON 备份</div>
                <div className="text-xs font-semibold" style={{ color: '#64748b' }}>完整备份</div>
              </div>
              <RightOutline style={{ color: '#94a3b8', fontSize: 16 }} />
            </div>
            <div 
              className="flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-white/50 rounded-2xl"
              style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.3)' }}
              onClick={handleExportCSV}
            >
              <div className="flex items-center gap-3">
                <div className="font-bold" style={{ color: '#0f172a' }}>CSV 表格</div>
                <div className="text-xs font-semibold" style={{ color: '#64748b' }}>商品列表</div>
              </div>
              <RightOutline style={{ color: '#94a3b8', fontSize: 16 }} />
            </div>
          </div>
        }
      />

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
