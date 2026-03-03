'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Toast,
  Button,
  Input,
  Selector,
  TextArea,
  Form,
  ImageUploader,
  DotLoading,
} from 'antd-mobile';
import type { ImageUploadItem } from 'antd-mobile';
import { LeftOutline } from 'antd-mobile-icons';
import { useItemStore, useCategoryStore, useAccountStore, useLanguageStore } from '@/store';
import { calculateProfit, compressImage } from '@/lib/utils';
import type { ItemImage } from '@/types';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const t = useLanguageStore((s) => s.translations);
  const language = useLanguageStore((s) => s.language);
  
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

  const getItemById = useItemStore((s) => s.getItemById);
  const updateItem = useItemStore((s) => s.updateItem);
  const categories = useCategoryStore((s) => s.categories);
  const accounts = useAccountStore((s) => s.accounts);

  const buyAccounts = accounts;
  const sellAccounts = accounts;
  const shippingAccounts = accounts;

  const item = getItemById(itemId);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategoryId(item.categoryId || '');
      setBuyAccountId(item.buyAccountId);
      setSellAccountId(item.sellAccountId);
      setShippingAccountId(item.shippingAccountId);
      setPrice(String(item.price));
      setCost(String(item.cost));
      setShipping(String(item.shipping));
      setRemark(item.remark || '');
      setImages(item.images.map((img) => ({
        url: img.data,
        key: img.id,
      })));
      setLoading(false);
    }
  }, [item]);

  const profit = calculateProfit(
    Number(price) || 0,
    Number(cost) || 0,
    Number(shipping) || 0
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ content: language === 'zh' ? '请输入商品名称' : 'Please enter item name', position: 'bottom' });
      return;
    }
    if (!buyAccountId) {
      Toast.show({ content: language === 'zh' ? '请选择购买账号' : 'Please select buy account', position: 'bottom' });
      return;
    }
    if (!sellAccountId) {
      Toast.show({ content: language === 'zh' ? '请选择销售账号' : 'Please select sell account', position: 'bottom' });
      return;
    }
    if (!shippingAccountId) {
      Toast.show({ content: language === 'zh' ? '请选择邮费支付账号' : 'Please select shipping account', position: 'bottom' });
      return;
    }
    if (price === '' || Number(price) < 0) {
      Toast.show({ content: language === 'zh' ? '请输入有效的售价' : 'Please enter valid price', position: 'bottom' });
      return;
    }
    if (cost === '' || Number(cost) < 0) {
      Toast.show({ content: language === 'zh' ? '请输入有效的成本' : 'Please enter valid cost', position: 'bottom' });
      return;
    }
    if (shipping === '' || Number(shipping) < 0) {
      Toast.show({ content: language === 'zh' ? '请输入有效的邮费' : 'Please enter valid shipping', position: 'bottom' });
      return;
    }

    setSubmitting(true);
    try {
      const itemImages: ItemImage[] = images.map((img) => ({
        id: String(img.key) || String(Date.now()),
        data: img.url || '',
        createdAt: new Date().toISOString(),
      }));

      await updateItem(itemId, {
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

      Toast.show({ content: '修改成功', position: 'bottom' });
      router.push(`/items/${itemId}`);
    } catch (error) {
      Toast.show({ content: '修改失败', position: 'bottom' });
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="text-gray-400 mb-4">{language === 'zh' ? '商品不存在' : 'Item not found'}</div>
        <button 
          onClick={() => router.push('/items')}
          className="glass-button px-6 py-3 text-sm"
        >
          {language === 'zh' ? '返回商品列表' : 'Back to Items'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)' }}>
      <div 
        className="glass-header px-4 py-4 sticky top-0 z-10 flex items-center gap-3"
      >
        <button onClick={() => router.back()} className="p-1">
          <LeftOutline style={{ fontSize: 22, color: '#1a1a1a' }} />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: '#1a1a1a' }}>{t.items.editItem}</h1>
      </div>

      <div className="px-4 pt-2">
        <div className="glass-card p-5 mb-4">
          <div className="space-y-4">
            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.itemName} <span style={{ color: '#ef4444' }}>*</span></div>
              <Input
                value={name}
                onChange={setName}
                placeholder={language === 'zh' ? '请输入商品名称' : 'Please enter item name'}
                style={{
                  borderRadius: 12,
                  '--placeholder-color': '#bbb',
                  background: 'rgba(0,0,0,0.03)',
                  height: 44,
                }}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.category}</div>
              <Selector
                options={[
                  { label: language === 'zh' ? '无分类' : 'No Category', value: '' },
                  ...categories.map((c) => ({ label: c.name, value: c.id })),
                ]}
                value={[categoryId]}
                onChange={(val) => setCategoryId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.buyAccount} <span style={{ color: '#ef4444' }}>*</span></div>
              <Selector
                options={buyAccounts.map((a) => ({ label: a.name, value: a.id }))}
                value={[buyAccountId]}
                onChange={(val) => setBuyAccountId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.sellAccount} <span style={{ color: '#ef4444' }}>*</span></div>
              <Selector
                options={sellAccounts.map((a) => ({ label: a.name, value: a.id }))}
                value={[sellAccountId]}
                onChange={(val) => setSellAccountId(val[0] || '')}
              />
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.shippingAccount} <span style={{ color: '#ef4444' }}>*</span></div>
              <Selector
                options={shippingAccounts.map((a) => ({ label: a.name, value: a.id }))}
                value={[shippingAccountId]}
                onChange={(val) => setShippingAccountId(val[0] || '')}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.price} <span style={{ color: '#ef4444' }}>*</span></div>
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
                <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.cost} <span style={{ color: '#ef4444' }}>*</span></div>
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
                <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.shipping} <span style={{ color: '#ef4444' }}>*</span></div>
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

            <div className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: '#666' }}>{language === 'zh' ? '预计利润' : 'Expected Profit'}</span>
                <span className={`text-xl font-bold ${profit >= 0 ? 'profit-text' : 'loss-text'}`}>
                  ¥{profit.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm mb-2" style={{ color: '#666' }}>{t.items.images} <span className="text-xs" style={{ color: '#999' }}>({language === 'zh' ? '最多5张' : 'Max 5'})</span></div>
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
