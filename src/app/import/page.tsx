'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button,
  Dialog,
  Toast,
  Selector,
  Input,
  Image,
} from 'antd-mobile';
import { 
  AppstoreOutline, 
  UnorderedListOutline, 
  SetOutline,
  PieOutline,
  RightOutline,
  ExclamationOutline,
} from 'antd-mobile-icons';
import { useItemStore, useAccountStore, useCategoryStore } from '@/store';
import { saveItems, saveAccounts, saveCategories } from '@/lib/db';
import { generateId, calculateProfit } from '@/lib/utils';
import type { Item, Account, Category } from '@/types';

interface ImportedRow {
  name: string;
  category?: string;
  buyAccount?: string;
  sellAccount?: string;
  shippingAccount?: string;
  price: string;
  cost: string;
  shipping: string;
  remark?: string;
  buyAccountId?: string;
  sellAccountId?: string;
  shippingAccountId?: string;
  isFullBackup?: boolean;
}

interface FieldMapping {
  name: string;
  category: string;
  buyAccount: string;
  sellAccount: string;
  shippingAccount: string;
  price: string;
  cost: string;
  shipping: string;
  remark: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [importedData, setImportedData] = useState<ImportedRow[]>([]);
  const [fileType, setFileType] = useState<'json' | 'csv'>('json');
  const [backupAccounts, setBackupAccounts] = useState<any[]>([]);
  const [backupCategories, setBackupCategories] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    name: '',
    category: '',
    buyAccount: '',
    sellAccount: '',
    shippingAccount: '',
    price: '',
    cost: '',
    shipping: '',
    remark: '',
  });
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const items = useItemStore((s) => s.items);
  const accounts = useAccountStore((s) => s.accounts);
  const categories = useCategoryStore((s) => s.categories);
  const loadItems = useItemStore((s) => s.loadItems);
  const loadAccounts = useAccountStore((s) => s.loadAccounts);
  const loadCategories = useCategoryStore((s) => s.loadCategories);

  const csvHeaders = useMemo(() => {
    if (importedData.length === 0) return [];
    return Object.keys(importedData[0]);
  }, [importedData]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        setFileType('json');
        const data = JSON.parse(text);
        
        if (data.items && Array.isArray(data.items)) {
          const mapped = data.items.map((item: any) => ({
            name: item.name || '',
            category: item.categoryId || '',
            buyAccountId: item.buyAccountId || '',
            sellAccountId: item.sellAccountId || '',
            shippingAccountId: item.shippingAccountId || '',
            price: String(item.price || 0),
            cost: String(item.cost || 0),
            shipping: String(item.shipping || 0),
            remark: item.remark || '',
            isFullBackup: true,
          }));
          
          setBackupAccounts(data.accounts || []);
          setBackupCategories(data.categories || []);
          setImportedData(mapped);
          setImportStep('preview');
          setSelectedRows(mapped.length > 0 ? Array.from({ length: mapped.length }, (_, i) => i) : []);
        } else if (Array.isArray(data)) {
          const mapped = data.map((item: any) => ({
            name: item.name || '',
            category: item.category || item.categoryName || '',
            buyAccount: item.buyAccount || item.buyAccountName || '',
            sellAccount: item.sellAccount || item.sellAccountName || '',
            shippingAccount: item.shippingAccount || item.shippingAccountName || '',
            price: String(item.price || 0),
            cost: String(item.cost || 0),
            shipping: String(item.shipping || 0),
            remark: item.remark || item.notes || '',
          }));
          setImportedData(mapped);
          setImportStep('preview');
          setSelectedRows(mapped.length > 0 ? Array.from({ length: mapped.length }, (_, i) => i) : []);
        }
      } else if (file.name.endsWith('.csv')) {
        setFileType('csv');
        const { headers, rows } = parseCSV(text);
        
        if (headers.length === 0) {
          Toast.show({ content: 'CSV文件解析失败', position: 'bottom' });
          return;
        }
        
        setImportedData(rows as unknown as ImportedRow[]);
        
        const autoMapping: FieldMapping = {
          name: headers.find(h => h.includes('名称') || h.includes('商品') || h.includes('name')) || '',
          category: headers.find(h => h.includes('分类') || h.includes('category')) || '',
          buyAccount: headers.find(h => h.includes('购买') || h.includes('买') || h.includes('buy')) || '',
          sellAccount: headers.find(h => h.includes('销售') || h.includes('卖') || h.includes('sell')) || '',
          shippingAccount: headers.find(h => h.includes('运费账号') || h.includes('邮费账号') || h.includes('ship') && !h.includes('shipp')) || '',
          price: headers.find(h => h.includes('售价') || h.includes('price')) || '',
          cost: headers.find(h => h.includes('成本') || h.includes('cost')) || '',
          shipping: headers.find(h => h.includes('运费') || h.includes('邮费') || h.includes('fee')) || '',
          remark: headers.find(h => h.includes('备注') || h.includes('remark') || h.includes('notes')) || '',
        };
        setFieldMapping(autoMapping);
        setImportStep('mapping');
      }
    } catch (error) {
      Toast.show({ content: '文件解析失败', position: 'bottom' });
    }
  };

  const parseCSV = (text: string): { headers: string[], rows: Record<string, string>[] } => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else if (char !== '\r') {
        current += char;
      }
    }
    result.push(current.trim());

    const headerCount = Math.ceil(result.length / 2);
    if (headerCount < 2) return { headers: [], rows: [] };

    const headers = result.slice(0, headerCount);
    const values = result.slice(headerCount);
    
    const rows: Record<string, string>[] = [];
    for (let i = 0; i < values.length; i += headerCount) {
      const row: Record<string, string> = {};
      headers.forEach((header, j) => {
        row[header] = values[i + j] || '';
      });
      rows.push(row);
    }

    return { headers, rows };
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleMappingConfirm = () => {
    const requiredFields = [
      { key: 'name', label: '商品名称' },
      { key: 'buyAccount', label: '购买账号' },
      { key: 'sellAccount', label: '销售账号' },
      { key: 'price', label: '售价' },
      { key: 'cost', label: '成本' },
    ];

    const missingFields = requiredFields.filter(f => !fieldMapping[f.key as keyof typeof fieldMapping]);
    
    if (missingFields.length > 0) {
      Toast.show({ content: `请映射必填字段: ${missingFields.map(f => f.label).join(', ')}`, position: 'bottom' });
      return;
    }

    setImportStep('preview');
    setSelectedRows(Array.from({ length: importedData.length }, (_, i) => i));
  };

  const handleImport = async () => {
    if (selectedRows.length === 0) {
      Toast.show({ content: '请选择要导入的数据', position: 'bottom' });
      return;
    }

    setImporting(true);
    try {
      const row = importedData[selectedRows[0]];
      const isFullBackup = row.isFullBackup;

      const accountNameToId = (name: string) => {
        const account = accounts.find(a => a.name === name);
        return account?.id || '';
      };

      const categoryNameToId = (name: string) => {
        if (!name) return undefined;
        const category = categories.find(c => c.name === name);
        return category?.id;
      };

      const newItems: Item[] = selectedRows.map(rowIndex => {
        const row = importedData[rowIndex];
        
        if (isFullBackup) {
          const price = parseFloat(row.price) || 0;
          const cost = parseFloat(row.cost) || 0;
          const shipping = parseFloat(row.shipping) || 0;
          
          const buyAccountId = row.buyAccountId || '';
          const sellAccountId = row.sellAccountId || '';
          
          return {
            id: generateId(),
            name: row.name || '未命名',
            categoryId: row.category || undefined,
            buyAccountId,
            sellAccountId,
            shippingAccountId: row.shippingAccountId || sellAccountId,
            price,
            cost,
            shipping,
            profit: calculateProfit(price, cost, shipping),
            images: [],
            remark: row.remark || '',
            settled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          };
        }

        const getFieldValue = (field: keyof typeof row): string => {
          const val = row[field];
          return val !== undefined && val !== null ? String(val) : '';
        };

        const price = fieldMapping.price ? parseFloat(getFieldValue(fieldMapping.price as keyof typeof row) || '0') || 0 : 0;
        const cost = fieldMapping.cost ? parseFloat(getFieldValue(fieldMapping.cost as keyof typeof row) || '0') || 0 : 0;
        const shipping = fieldMapping.shipping ? parseFloat(getFieldValue(fieldMapping.shipping as keyof typeof row) || '0') || 0 : 0;
        
        const name = fieldMapping.name ? getFieldValue(fieldMapping.name as keyof typeof row) || '未命名' : '未命名';
        const categoryId = fieldMapping.category ? categoryNameToId(getFieldValue(fieldMapping.category as keyof typeof row)) : undefined;
        const buyAccountId = fieldMapping.buyAccount ? accountNameToId(getFieldValue(fieldMapping.buyAccount as keyof typeof row)) : '';
        const sellAccountId = fieldMapping.sellAccount ? accountNameToId(getFieldValue(fieldMapping.sellAccount as keyof typeof row)) : '';
        const shippingAccountId = fieldMapping.shippingAccount ? accountNameToId(getFieldValue(fieldMapping.shippingAccount as keyof typeof row)) : sellAccountId;
        const remark = fieldMapping.remark ? getFieldValue(fieldMapping.remark as keyof typeof row) : '';

        return {
          id: generateId(),
          name,
          categoryId,
          buyAccountId,
          sellAccountId,
          shippingAccountId: shippingAccountId || sellAccountId,
          price,
          cost,
          shipping,
          profit: calculateProfit(price, cost, shipping),
          images: [],
          remark,
          settled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        };
        }).filter(item => (item.buyAccountId && item.sellAccountId) || isFullBackup);

      if (newItems.length === 0) {
        Toast.show({ content: '没有有效数据可导入，请检查字段映射', position: 'bottom' });
        setImporting(false);
        return;
      }

      if (isFullBackup && backupCategories.length > 0) {
        const categoryIdMap: Record<string, string> = {};
        const newCategories = backupCategories.map((cat: any) => {
          const newId = generateId();
          categoryIdMap[cat.id] = newId;
          return {
            ...cat,
            id: newId,
            createdAt: cat.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });
        
        const updatedItems = newItems.map(item => ({
          ...item,
          categoryId: item.categoryId ? categoryIdMap[item.categoryId] : undefined,
        }));
        newItems.length = 0;
        newItems.push(...updatedItems);
        
        await saveCategories([...categories, ...newCategories]);
        await loadCategories();
      }

      if (isFullBackup && backupAccounts.length > 0) {
        const accountIdMap: Record<string, string> = {};
        const newAccounts = backupAccounts.map((acc: any) => {
          const newId = generateId();
          accountIdMap[acc.id] = newId;
          return {
            ...acc,
            id: newId,
            createdAt: acc.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });
        
        const updatedItems = newItems.map(item => ({
          ...item,
          buyAccountId: item.buyAccountId ? accountIdMap[item.buyAccountId] || item.buyAccountId : '',
          sellAccountId: item.sellAccountId ? accountIdMap[item.sellAccountId] || item.sellAccountId : '',
          shippingAccountId: item.shippingAccountId ? accountIdMap[item.shippingAccountId] || item.shippingAccountId : item.sellAccountId,
        }));
        newItems.length = 0;
        newItems.push(...updatedItems);
        
        await saveAccounts([...accounts, ...newAccounts]);
        await loadAccounts();
      }

      await saveItems([...items, ...newItems]);
      await loadItems();
      
      Toast.show({ content: `成功导入${newItems.length}条数据`, position: 'bottom' });
      router.push('/items');
    } catch (error) {
      Toast.show({ content: '导入失败', position: 'bottom' });
    } finally {
      setImporting(false);
    }
  };

  const toggleRow = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === importedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(Array.from({ length: importedData.length }, (_, i) => i));
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)' }}>
      <div 
        className="relative px-6 pt-14 pb-8"
        style={{ background: 'transparent' }}
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0f172a' }}>导入数据</h1>
          <p className="text-sm mt-2 font-light" style={{ color: '#64748b' }}>
            {importStep === 'upload' && '选择备份文件'}
            {importStep === 'mapping' && '映射CSV字段'}
            {importStep === 'preview' && '预览并导入'}
          </p>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10">
        {importStep === 'upload' && (
          <div className="glass-card p-8 text-center">
            <div className="mb-6">
              <div 
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}
              >
                <RightOutline style={{ fontSize: 40, color: '#fff' }} />
              </div>
              <div className="font-bold text-lg mb-2" style={{ color: '#0f172a' }}>选择导入文件</div>
              <div className="text-sm font-semibold" style={{ color: '#64748b' }}>支持 JSON 备份文件和 CSV 表格文件</div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button 
              className="glass-button px-8 py-4 text-base cursor-pointer w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              选择文件
            </button>

            <div className="mt-8 pt-6" style={{ borderTop: '1px dashed rgba(15, 23, 42, 0.15)' }}>
              <div className="text-sm font-semibold mb-4" style={{ color: '#64748b' }}>支持格式说明</div>
              <div className="text-left space-y-3 text-sm font-semibold" style={{ color: '#94a3b8' }}>
                <div>• JSON: 完整的 Meridian 备份文件</div>
                <div>• CSV: 包含商品信息的表格文件</div>
                <div>• 导入后需选择账号映射关系</div>
              </div>
            </div>
          </div>
        )}

        {importStep === 'mapping' && (
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-5" style={{ color: '#0f172a' }}>字段映射</h3>
            <p className="text-sm mb-6 font-semibold" style={{ color: '#64748b' }}>
              请将CSV列映射到对应的商品字段
            </p>
            
            <div className="space-y-4">
              {[
                { key: 'name' as const, label: '商品名称', required: true },
                { key: 'category' as const, label: '分类', required: false },
                { key: 'buyAccount' as const, label: '购买账号', required: true },
                { key: 'sellAccount' as const, label: '销售账号', required: true },
                { key: 'shippingAccount' as const, label: '邮费账号', required: false },
                { key: 'price' as const, label: '售价', required: true },
                { key: 'cost' as const, label: '成本', required: true },
                { key: 'shipping' as const, label: '邮费', required: false },
                { key: 'remark' as const, label: '备注', required: false },
              ].map(field => (
                <div key={field.key}>
                  <div className="text-sm mb-3 font-semibold" style={{ color: '#64748b' }}>
                    {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </div>
                  <Selector
                    options={[
                      { label: '-- 不使用 --', value: '' },
                      ...csvHeaders.map(h => ({ label: h, value: h })),
                    ]}
                    value={[fieldMapping[field.key]]}
                    onChange={(val) => setFieldMapping({ ...fieldMapping, [field.key]: val[0] || '' })}
                  />
                </div>
              ))}
            </div>

            <button 
              className="glass-button px-8 py-4 text-base cursor-pointer w-full mt-8"
              onClick={handleMappingConfirm}
            >
              确认映射
            </button>
          </div>
        )}

        {importStep === 'preview' && (
          <div className="space-y-4">
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="font-semibold" style={{ color: '#0f172a' }}>
                已选择 {selectedRows.length} / {importedData.length} 条数据
              </div>
              <button 
                className="text-sm font-bold cursor-pointer"
                style={{ color: '#0ea5e9' }}
                onClick={toggleAll}
              >
                {selectedRows.length === importedData.length ? '取消全选' : '全选'}
              </button>
            </div>

            <div className="space-y-3">
              {importedData.map((row, index) => {
                const isFullBackup = row.isFullBackup;
                const getPreviewFieldValue = (field: keyof typeof row): string => {
                  const val = row[field];
                  return val !== undefined && val !== null ? String(val) : '';
                };

                const name = isFullBackup 
                  ? (row.name || '未命名')
                  : (fieldMapping.name ? getPreviewFieldValue(fieldMapping.name as keyof typeof row) || '未命名' : `商品 ${index + 1}`);
                const price = isFullBackup 
                  ? (parseFloat(row.price) || 0)
                  : (fieldMapping.price ? parseFloat(getPreviewFieldValue(fieldMapping.price as keyof typeof row) || '0') || 0 : 0);
                const cost = isFullBackup 
                  ? (parseFloat(row.cost) || 0)
                  : (fieldMapping.cost ? parseFloat(getPreviewFieldValue(fieldMapping.cost as keyof typeof row) || '0') || 0 : 0);
                const shipping = isFullBackup 
                  ? (parseFloat(row.shipping) || 0)
                  : (fieldMapping.shipping ? parseFloat(getPreviewFieldValue(fieldMapping.shipping as keyof typeof row) || '0') || 0 : 0);
                const profit = price - cost - shipping;

                return (
                  <div 
                    key={index}
                    className="glass-card p-4 cursor-pointer"
                    onClick={() => toggleRow(index)}
                    style={{ 
                      border: selectedRows.includes(index) ? '2px solid #0ea5e9' : '2px solid transparent',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ 
                            borderColor: selectedRows.includes(index) ? '#0ea5e9' : '#94a3b8',
                            background: selectedRows.includes(index) ? '#0ea5e9' : 'transparent',
                          }}
                        >
                          {selectedRows.includes(index) && (
                            <span style={{ color: '#fff', fontSize: 12 }}>✓</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold" style={{ color: '#0f172a' }}>{name}</div>
                          <div className="text-xs mt-1 font-semibold" style={{ color: '#64748b' }}>
                            售价: ¥{price.toFixed(2)} | 成本: ¥{cost.toFixed(2)} | 邮费: ¥{shipping.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div 
                        className="font-bold"
                        style={{ color: profit >= 0 ? '#10b981' : '#ef4444' }}
                      >
                        ¥{profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              className="glass-button px-8 py-4 text-base cursor-pointer w-full"
              onClick={handleImport}
              disabled={importing}
              style={{ opacity: importing ? 0.5 : 1 }}
            >
              {importing ? '导入中...' : `导入 ${selectedRows.length} 条数据`}
            </button>
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
