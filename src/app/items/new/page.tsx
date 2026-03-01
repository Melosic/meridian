'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card,
  Toast,
  Button,
  Input,
  Selector,
  TextArea,
  Form,
  ImageUploader,
} from 'antd-mobile';
import type { ImageUploadItem } from 'antd-mobile';
import { LeftOutline, AddOutline } from 'antd-mobile-icons';
import { useItemStore, useCategoryStore, useAccountStore } from '@/store';
import { calculateProfit, compressImage } from '@/lib/utils';
import type { ItemImage } from '@/types';

export default function NewItemPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [buyAccountId, setBuyAccountId] = useState('');
  const [sellAccountId, setSellAccountId] = useState('');
  const [shippingAccountId, setShippingAccountId] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [shipping, setShipping] = useState('');
  const [remark, setRemark] = useState('');
  const [images, setImages] = useState<ImageUploadItem[]>([]);

  const categories = useCategoryStore((s) => s.categories);
  const accounts = useAccountStore((s) => s.accounts);
  const addItem = useItemStore((s) => s.addItem);

  const buyAccounts = accounts.filter((a) => a.type === 'buy');
  const sellAccounts = accounts.filter((a) => a.type === 'sell');
  const shippingAccounts = accounts.filter((a) => a.type === 'shipping');

  const profit = calculateProfit(
    Number(price) || 0,
    Number(cost) || 0,
    Number(shipping) || 0
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ content: '请输入商品名称', position: 'bottom' });
      return;
    }
    if (!buyAccountId) {
      Toast.show({ content: '请选择购买账号', position: 'bottom' });
      return;
    }
    if (!sellAccountId) {
      Toast.show({ content: '请选择销售账号', position: 'bottom' });
      return;
    }
    if (!shippingAccountId) {
      Toast.show({ content: '请选择邮费支付账号', position: 'bottom' });
      return;
    }
    if (price === '' || Number(price) < 0) {
      Toast.show({ content: '请输入有效的售价', position: 'bottom' });
      return;
    }
    if (cost === '' || Number(cost) < 0) {
      Toast.show({ content: '请输入有效的成本', position: 'bottom' });
      return;
    }
    if (shipping === '' || Number(shipping) < 0) {
      Toast.show({ content: '请输入有效的邮费', position: 'bottom' });
      return;
    }

    setSubmitting(true);
    try {
      const itemImages: ItemImage[] = images.map((img) => ({
        id: img.url || String(Date.now()),
        data: img.url || '',
        createdAt: new Date().toISOString(),
      }));

      await addItem({
        name: name.trim(),
        categoryId: categoryId || undefined,
        buyAccountId,
        sellAccountId,
        shippingAccountId,
        price: Number(price),
        cost: Number(cost),
        shipping: Number(shipping),
        images: itemImages,
        remark: remark.trim() || undefined,
      });

      Toast.show({ content: '添加成功', position: 'bottom' });
      router.push('/items');
    } catch (error) {
      Toast.show({ content: '添加失败', position: 'bottom' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (files: ImageUploadItem[]): Promise<ImageUploadItem[]> => {
    if (files.length > 5) {
      Toast.show({ content: '最多上传5张图片', position: 'bottom' });
      return files.slice(0, 5);
    }
    
    const processedFiles: ImageUploadItem[] = [];
    
    for (const file of files) {
      if (file.url) {
        processedFiles.push(file);
      } else if ((file as any).file) {
        try {
          const compressedData = await compressImage((file as any).file, 500);
          processedFiles.push({
            ...file,
            url: compressedData,
          });
        } catch (error) {
          Toast.show({ content: '图片处理失败', position: 'bottom' });
        }
      }
    }
    
    return processedFiles;
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)' }}>
      <div 
        className="glass-header px-4 py-4 sticky top-0 z-10 flex items-center gap-3"
      >
        <button onClick={() => router.back()} className="p-1">
          <LeftOutline style={{ fontSize: 22, color: '#1a1a1a' }} />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: '#1a1a1a' }}>新增商品</h1>
      </div>

      <div className="px-4 pt-2">
        <div className="glass-card p-5 mb-4">
          <div className="space-y-4">
            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>商品名称 <span style={{ color: '#ef4444' }}>*</span></div>
              <Input
                placeholder="请输入商品名称"
                value={name}
                onChange={setName}
                style={{ 
                  borderRadius: 12,
                  '--placeholder-color': '#bbb',
                  background: 'rgba(0,0,0,0.03)',
                  height: 44,
                }}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>商品分类</div>
              <Selector
                options={[
                  { label: '无分类', value: '' },
                  ...categories.map((c) => ({ label: c.name, value: c.id })),
                ]}
                value={[categoryId]}
                onChange={(val) => setCategoryId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>购买账号 <span style={{ color: '#ef4444' }}>*</span></div>
              <Selector
                options={buyAccounts.map((a) => ({ label: a.name, value: a.id }))}
                value={[buyAccountId]}
                onChange={(val) => setBuyAccountId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>销售账号 <span style={{ color: '#ef4444' }}>*</span></div>
              <Selector
                options={sellAccounts.map((a) => ({ label: a.name, value: a.id }))}
                value={[sellAccountId]}
                onChange={(val) => setSellAccountId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>邮费支付账号 <span style={{ color: '#ef4444' }}>*</span></div>
              <Selector
                options={shippingAccounts.map((a) => ({ label: a.name, value: a.id }))}
                value={[shippingAccountId]}
                onChange={(val) => setShippingAccountId(val[0] || '')}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-sm mb-2" style={{ color: '#666' }}>售价 <span style={{ color: '#ef4444' }}>*</span></div>
                <Input
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={setPrice}
                  style={{ 
                    borderRadius: 12,
                    '--placeholder-color': '#bbb',
                    background: 'rgba(0,0,0,0.03)',
                    height: 44,
                  }}
                />
              </div>
              <div>
                <div className="text-sm mb-2" style={{ color: '#666' }}>成本 <span style={{ color: '#ef4444' }}>*</span></div>
                <Input
                  type="number"
                  placeholder="0"
                  value={cost}
                  onChange={setCost}
                  style={{ 
                    borderRadius: 12,
                    '--placeholder-color': '#bbb',
                    background: 'rgba(0,0,0,0.03)',
                    height: 44,
                  }}
                />
              </div>
              <div>
                <div className="text-sm mb-2" style={{ color: '#666' }}>邮费 <span style={{ color: '#ef4444' }}>*</span></div>
                <Input
                  type="number"
                  placeholder="0"
                  value={shipping}
                  onChange={setShipping}
                  style={{ 
                    borderRadius: 12,
                    '--placeholder-color': '#bbb',
                    background: 'rgba(0,0,0,0.03)',
                    height: 44,
                  }}
                />
              </div>
            </div>

            <div className="glass-card p-4" style={{ background: profit >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: '#666' }}>预计利润</span>
                <span className={`text-xl font-bold ${profit >= 0 ? 'profit-text' : 'loss-text'}`}>
                  ¥{profit.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>商品图片 <span className="text-xs" style={{ color: '#999' }}>(最多5张)</span></div>
              <ImageUploader
                value={images}
                onChange={setImages}
                maxCount={5}
                accept="image/jpg,image/png,image/gif,image/webp"
                upload={async (file) => {
                  const compressed = await compressImage(file, 500);
                  return { url: compressed };
                }}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>备注</div>
              <TextArea
                placeholder="可选填写备注信息"
                value={remark}
                onChange={setRemark}
                maxLength={200}
                rows={3}
                style={{ 
                  borderRadius: 12,
                  '--placeholder-color': '#bbb',
                  background: 'rgba(0,0,0,0.03)',
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <Button 
            block 
            onClick={() => router.back()}
            style={{ 
              flex: 1,
              borderRadius: 14,
              height: 50,
              background: 'rgba(0,0,0,0.05)',
              color: '#666',
              border: 'none'
            }}
          >
            取消
          </Button>
          <Button 
            block 
            onClick={handleSubmit}
            loading={submitting}
            style={{ 
              flex: 1,
              borderRadius: 14,
              height: 50,
              background: '#1a1a1a',
              color: '#fff',
              border: 'none'
            }}
          >
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
