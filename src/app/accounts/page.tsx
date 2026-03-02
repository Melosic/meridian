'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TabBar, 
  Toast,
  Dialog,
  Input,
  SwipeAction,
} from 'antd-mobile';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  SetOutline,
  PieOutline,
  RightOutline,
} from 'antd-mobile-icons';
import { useAccountStore, useItemStore } from '@/store';
import type { Account } from '@/types';

export default function AccountsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('accounts');
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  
  const accounts = useAccountStore((s) => s.accounts);
  const addAccount = useAccountStore((s) => s.addAccount);
  const updateAccount = useAccountStore((s) => s.updateAccount);
  const deleteAccount = useAccountStore((s) => s.deleteAccount);
  const checkItemCountByAccount = useItemStore((s) => s.checkItemCountByAccount);

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      Toast.show({ content: '请输入账号名称', position: 'bottom' });
      return;
    }
    const exists = accounts.some(a => a.name.toLowerCase() === formData.name.trim().toLowerCase());
    if (exists) {
      Toast.show({ content: '该账号名称已存在', position: 'bottom' });
      return;
    }
    await addAccount({ name: formData.name.trim() });
    setFormData({ name: '' });
    setAddDialogVisible(false);
    Toast.show({ content: '添加成功', position: 'bottom' });
  };

  const handleEdit = async () => {
    if (!formData.name.trim() || !currentAccount) {
      Toast.show({ content: '请输入账号名称', position: 'bottom' });
      return;
    }
    const exists = accounts.some(a => a.name.toLowerCase() === formData.name.trim().toLowerCase() && a.id !== currentAccount.id);
    if (exists) {
      Toast.show({ content: '该账号名称已存在', position: 'bottom' });
      return;
    }
    await updateAccount(currentAccount.id, { name: formData.name.trim() });
    setFormData({ name: '' });
    setCurrentAccount(null);
    setEditDialogVisible(false);
    Toast.show({ content: '修改成功', position: 'bottom' });
  };

  const handleDelete = async (account: Account) => {
    const count = checkItemCountByAccount(account.id);
    if (count > 0) {
      Toast.show({ content: `该账号关联${count}个商品，无法删除`, position: 'bottom' });
      return;
    }
    Dialog.confirm({
      title: '确认删除',
      content: `确定要删除账号"${account.name}"吗？`,
      onConfirm: async () => {
        await deleteAccount(account.id);
        Toast.show({ content: '删除成功', position: 'bottom' });
      },
    });
  };

  const openEditDialog = (account: Account) => {
    setCurrentAccount(account);
    setFormData({ name: account.name });
    setEditDialogVisible(true);
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)' }}>
      <div 
        className="relative px-6 pt-14 pb-12"
        style={{ background: 'transparent' }}
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>账号管理</h1>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10">
        {accounts.length === 0 ? (
          <div className="empty-state-card cursor-pointer flex flex-col items-center justify-center py-12" onClick={() => setAddDialogVisible(true)}>
            <div className="text-slate-500 mb-6 font-semibold text-lg">暂无账号</div>
            <button 
              onClick={() => setAddDialogVisible(true)}
              className="glass-button px-8 py-3.5 text-sm cursor-pointer"
            >
              添加账号
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {accounts.map((account, index) => (
                <div key={account.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <SwipeAction
                    style={{ background: 'transparent', boxShadow: 'none' }}
                    rightActions={[
                      {
                        key: 'edit',
                        text: '编辑',
                        color: 'primary',
                        onClick: () => openEditDialog(account),
                      },
                      {
                        key: 'delete',
                        text: '删除',
                        color: 'danger',
                        onClick: () => handleDelete(account),
                      },
                    ]}
                  >
                    <div className="glass-card p-4 cursor-pointer" style={{ boxShadow: 'none', borderRadius: '16px' }}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div 
                            className="category-icon"
                            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
                          >
                            {account.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-lg" style={{ color: '#0f172a' }}>{account.name}</div>
                            <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>
                              关联 {checkItemCountByAccount(account.id)} 个商品
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwipeAction>
                </div>
              ))}
            </div>
            <div 
              className="my-8 p-6 text-center cursor-pointer transition-all hover:scale-[1.02]"
              style={{ 
                background: 'rgba(255, 255, 255, 0.3)', 
                borderRadius: '40px',
                border: '2px dashed rgba(15, 23, 42, 0.15)'
              }}
              onClick={() => setAddDialogVisible(true)}
            >
              <div className="text-base mt-2 font-semibold" style={{ color: '#64748b' }}>添加账号</div>
            </div>
          </>
        )}
      </div>

      <Dialog
        visible={addDialogVisible}
        onClose={() => setAddDialogVisible(false)}
        title={<div className="font-bold" style={{ color: '#0f172a' }}>添加账号</div>}
        content={
          <Input
            placeholder="请输入账号名称"
            value={formData.name}
            onChange={(val) => setFormData({ name: val })}
            style={{ 
              borderRadius: 16,
              '--placeholder-color': '#94a3b8',
              background: 'rgba(255, 255, 255, 0.5)',
              height: 50,
              padding: '0 16px',
            }}
          />
        }
        actions={[
          { text: '取消', key: 'cancel', onClick: () => setAddDialogVisible(false), style: { color: '#64748b' } },
          { 
            text: '确定', 
            key: 'confirm', 
            onClick: handleAdd,
            style: { color: '#0f172a', fontWeight: 700 }
          },
        ]}
      />

      <Dialog
        visible={editDialogVisible}
        onClose={() => setEditDialogVisible(false)}
        title={<div className="font-bold" style={{ color: '#0f172a' }}>编辑账号</div>}
        content={
          <Input
            placeholder="请输入账号名称"
            value={formData.name}
            onChange={(val) => setFormData({ name: val })}
            style={{ 
              borderRadius: 16,
              '--placeholder-color': '#94a3b8',
              background: 'rgba(255, 255, 255, 0.5)',
              height: 50,
              padding: '0 16px',
            }}
          />
        }
        actions={[
          { text: '取消', key: 'cancel', onClick: () => setEditDialogVisible(false), style: { color: '#64748b' } },
          { 
            text: '确定', 
            key: 'confirm', 
            onClick: handleEdit,
            style: { color: '#0f172a', fontWeight: 700 }
          },
        ]}
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
