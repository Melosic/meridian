'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Toast,
  Button,
  Image,
  Dialog,
  DotLoading,
} from 'antd-mobile';
import { 
  DeleteOutline, 
  EditSOutline,
  LeftOutline,
} from 'antd-mobile-icons';
import { useItemStore, useCategoryStore, useAccountStore } from '@/store';
import { formatMoney, formatDate } from '@/lib/utils';

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const [loading, setLoading] = useState(true);

  const getItemById = useItemStore((s) => s.getItemById);
  const deleteItem = useItemStore((s) => s.deleteItem);
  const getCategoryById = useCategoryStore((s) => s.getCategoryById);
  const getAccountById = useAccountStore((s) => s.getAccountById);

  const item = getItemById(itemId);

  useEffect(() => {
    if (item) {
      setLoading(false);
    }
  }, [item]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)' }}>
        <DotLoading color="primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)' }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: '#f5f5f5' }}>
          <span className="text-4xl">❓</span>
        </div>
        <div className="text-gray-400 mb-5">商品不存在</div>
        <button 
          onClick={() => router.push('/items')}
          className="glass-button px-6 py-3 text-sm"
        >
          返回商品列表
        </button>
      </div>
    );
  }

  const buyAccount = getAccountById(item.buyAccountId);
  const sellAccount = getAccountById(item.sellAccountId);
  const shippingAccount = getAccountById(item.shippingAccountId);
  const category = item.categoryId ? getCategoryById(item.categoryId) : null;

  const handleDelete = () => {
    Dialog.confirm({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      onConfirm: async () => {
        await deleteItem(item.id);
        Toast.show({ content: '删除成功', position: 'bottom' });
        router.push('/items');
      },
    });
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)' }}>
      <div 
        className="glass-header px-4 py-4 sticky top-0 z-10 flex items-center gap-3"
      >
        <button onClick={() => router.back()} className="p-1">
          <LeftOutline style={{ fontSize: 22, color: '#1a1a1a' }} />
        </button>
        <h1 className="text-xl font-semibold flex-1" style={{ color: '#1a1a1a' }}>商品详情</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => router.push(`/items/${item.id}/edit`)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(0,0,0,0.05)' }}
          >
            <EditSOutline style={{ color: '#1a1a1a', fontSize: 18 }} />
          </button>
          <button 
            onClick={handleDelete}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <DeleteOutline style={{ color: '#ef4444', fontSize: 18 }} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="glass-card p-5">
          <div className="flex items-start gap-4">
            {item.images.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img.data}
                    className="rounded-xl"
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                    fit="cover"
                  />
                ))}
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ background: '#f5f5f5' }}>
                <span style={{ color: '#ccc' }}>无图</span>
              </div>
            )}
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>{item.name}</h2>
            </div>
            <div 
              className="inline-flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: item.settled ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}
            >
              <span 
                className="text-xl font-bold"
                style={{ color: item.settled ? '#10b981' : '#f59e0b' }}
              >
                利润: {formatMoney(item.profit)}
              </span>
              <span 
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ 
                  background: item.settled ? '#10b981' : '#f59e0b',
                  color: '#fff'
                }}
              >
                {item.settled ? '已结算' : '待结算'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#1a1a1a' }}>账号信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#999' }}>购买账号</span>
              <span className="font-medium" style={{ color: '#1a1a1a' }}>{buyAccount?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#999' }}>销售账号</span>
              <span className="font-medium" style={{ color: '#1a1a1a' }}>{sellAccount?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span style={{ color: '#999' }}>邮费支付账号</span>
              <span className="font-medium" style={{ color: '#1a1a1a' }}>{shippingAccount?.name || '-'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#1a1a1a' }}>财务信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#999' }}>售价</span>
              <span className="font-semibold" style={{ color: '#10b981' }}>{formatMoney(item.price)}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#999' }}>成本</span>
              <span className="font-semibold" style={{ color: '#ef4444' }}>- {formatMoney(item.cost)}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <span style={{ color: '#999' }}>邮费</span>
              <span className="font-semibold" style={{ color: '#f59e0b' }}>- {formatMoney(item.shipping)}</span>
            </div>
            <div className="flex justify-between items-center py-4 rounded-xl mt-2" style={{ background: item.profit >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
              <span className="font-semibold" style={{ color: '#1a1a1a' }}>实际利润</span>
              <span className="text-xl font-bold" style={{ color: item.profit >= 0 ? '#10b981' : '#ef4444' }}>
                {formatMoney(item.profit)}
              </span>
            </div>
          </div>
        </div>

        {item.remark && (
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3" style={{ color: '#1a1a1a' }}>备注</h3>
            <div className="text-sm p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)', color: '#666' }}>
              {item.remark}
            </div>
          </div>
        )}

        <div className="glass-card p-5">
          <div className="space-y-3 text-sm" style={{ color: '#999' }}>
            <div className="flex justify-between">
              <span>创建时间</span>
              <span style={{ color: '#666' }}>{formatDate(item.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>更新时间</span>
              <span style={{ color: '#666' }}>{formatDate(item.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>结算状态</span>
              <span style={{ color: item.settled ? '#10b981' : '#f59e0b', fontWeight: 500 }}>
                {item.settled ? '已结算' : '待结算'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
