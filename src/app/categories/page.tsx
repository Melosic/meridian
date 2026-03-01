'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TabBar, 
  Toast,
  Button,
  Dialog,
  Input,
  SwipeAction,
} from 'antd-mobile';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  SetOutline,
} from 'antd-mobile-icons';
import { useCategoryStore, useItemStore } from '@/store';
import type { Category } from '@/types';

const CATEGORY_COLORS = [
  '#0f172a', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
];

export default function CategoriesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('categories');
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  
  const categories = useCategoryStore((s) => s.categories);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const checkItemCountByCategory = useItemStore((s) => s.checkItemCountByCategory);

  const handleAdd = async () => {
    if (!categoryName.trim()) {
      Toast.show({ content: '请输入分类名称', position: 'bottom' });
      return;
    }
    const randomColor = CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
    await addCategory({ name: categoryName.trim(), color: randomColor });
    setCategoryName('');
    setAddDialogVisible(false);
    Toast.show({ content: '添加成功', position: 'bottom' });
  };

  const handleEdit = async () => {
    if (!categoryName.trim() || !currentCategory) {
      Toast.show({ content: '请输入分类名称', position: 'bottom' });
      return;
    }
    await updateCategory(currentCategory.id, { name: categoryName.trim() });
    setCategoryName('');
    setCurrentCategory(null);
    setEditDialogVisible(false);
    Toast.show({ content: '修改成功', position: 'bottom' });
  };

  const handleDelete = async (category: Category) => {
    const count = checkItemCountByCategory(category.id);
    if (count > 0) {
      Toast.show({ content: `该分类关联${count}个商品，无法删除`, position: 'bottom' });
      return;
    }
    Dialog.confirm({
      title: '确认删除',
      content: `确定要删除分类"${category.name}"吗？`,
      onConfirm: async () => {
        await deleteCategory(category.id);
        Toast.show({ content: '删除成功', position: 'bottom' });
      },
    });
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setEditDialogVisible(true);
  };

  const renderCategoryItem = (category: Category, index: number) => {
    const itemCount = checkItemCountByCategory(category.id);
    return (
      <div key={category.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
        <SwipeAction
          rightActions={[
            {
              key: 'edit',
              text: '编辑',
              color: 'primary',
              onClick: () => openEditDialog(category),
            },
            {
              key: 'delete',
              text: '删除',
              color: 'danger',
              onClick: () => handleDelete(category),
            },
          ]}
        >
          <div className="glass-card p-5 cursor-pointer" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div 
                  className="category-icon"
                  style={{ background: `linear-gradient(135deg, ${category.color || '#0f172a'} 0%, ${category.color ? category.color + 'cc' : '#1e293b'} 100%)` }}
                >
                  {category.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-lg" style={{ color: '#0f172a' }}>{category.name}</div>
                  <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>{itemCount} 件商品</div>
                </div>
              </div>
            </div>
          </div>
        </SwipeAction>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)' }}>
      <div 
        className="relative px-6 pt-14 pb-12"
        style={{ background: 'transparent' }}
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>商品类别</h1>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10">
        {categories.length === 0 ? (
          <div className="empty-state-card cursor-pointer" onClick={() => setAddDialogVisible(true)}>
            <div className="w-20 h-20 mx-auto mb-5 rounded-[2rem] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
              <span className="text-4xl">📁</span>
            </div>
            <div className="text-slate-500 mb-6 font-semibold text-lg">暂无分类</div>
            <button 
              onClick={() => setAddDialogVisible(true)}
              className="glass-button px-8 py-3.5 text-sm cursor-pointer"
            >
              添加分类
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {categories.map((category, idx) => renderCategoryItem(category, idx))}
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
              <div className="text-base mt-2 font-semibold" style={{ color: '#64748b' }}>添加分类</div>
            </div>
          </>
        )}
      </div>

      <Dialog
        visible={addDialogVisible}
        onClose={() => setAddDialogVisible(false)}
        title={<div className="font-bold" style={{ color: '#0f172a' }}>添加分类</div>}
        content={
          <Input
            placeholder="请输入分类名称"
            value={categoryName}
            onChange={setCategoryName}
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
        title={<div className="font-bold" style={{ color: '#0f172a' }}>编辑分类</div>}
        content={
          <Input
            placeholder="请输入分类名称"
            value={categoryName}
            onChange={setCategoryName}
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
    </div>
  );
}
