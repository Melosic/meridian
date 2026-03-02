# Meridian 项目开发提示词

你将帮助我开发一个面向个人二手卖家的轻量级利润记账 Web 应用。

---

## 项目概述

**产品定位**：面向个人二手卖家的轻量级利润记账Web应用，支持记录商品售价、成本、邮费，自动计算利润，支持商品图片、分类管理，并提供多账号内部成本结算功能。

**技术栈**：
- 前端框架: Next.js 14 (App Router)
- UI组件库: Ant Design Mobile
- 状态管理: Zustand + persist middleware
- 样式方案: Tailwind CSS + CSS Modules
- 本地存储: IndexedDB (via localForage)
- 部署平台: Vercel

---

## 数据模型

### 商品表 (Item)
```typescript
interface Item {
  id: string;                    // UUID
  name: string;                   // 商品名称
  categoryId: string | null;      // 分类ID
  buyAccountId: string;           // 购买账号ID（成本支付方）
  shippingAccountId: string;      // 邮费支付账号ID
  sellAccountId: string;          // 销售账号ID
  price: number;                  // 售价
  cost: number;                   // 成本价
  shipping: number;               // 邮费
  images: string[];               // 图片（localForage自动转为Blob存储），最多5张
  settled: boolean;               // 是否已内部结算
  createdAt: string;              // ISO时间
  updatedAt: string;              // ISO时间
  version: number;                // 数据模型版本号
}
// 计算字段（不持久化）：profit = price - cost - shipping
```

### 账号表 (Account)
```typescript
interface Account {
  id: string;
  name: string;         // 账号名称（如"闲鱼号A"）
  createdAt: string;
}
```

### 分类表 (Category)
```typescript
interface Category {
  id: string;
  name: string;
  createdAt: string;
}
```

### 结算记录表 (SettlementLog)
```typescript
interface SettlementLog {
  id: string;
  itemIds: string[];
  settledAt: string;
}
```

---

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页（分类视图）
│   ├── globals.css
│   ├── items/
│   │   ├── page.tsx            # 商品列表页（含搜索/筛选）
│   │   ├── new/page.tsx       # 新增商品页
│   │   └── [id]/page.tsx      # 商品详情页
│   ├── accounts/page.tsx       # 账号管理
│   ├── categories/page.tsx     # 分类管理
│   ├── settlement/page.tsx     # 内部结算
│   ├── stats/page.tsx         # 利润统计
│   ├── import/page.tsx        # 导入预览
│   └── settings/page.tsx      # 设置
├── components/
│   ├── ui/                    # 基础UI组件
│   ├── layout/                # 布局组件（底部导航栏等）
│   └── forms/                 # 表单组件
├── hooks/                     # 自定义Hooks
│   ├── useItems.ts
│   ├── useAccounts.ts
│   ├── useCategories.ts
│   ├── useSettlement.ts
│   ├── useImport.ts
│   ├── useExport.ts
│   ├── useSearch.ts
│   └── useStats.ts
├── lib/
│   ├── db.ts                  # IndexedDB封装 (localForage)
│   ├── storage.ts             # 存储层抽象
│   └── utils.ts               # 通用工具函数
├── store/                      # Zustand状态管理
│   └── index.ts               # accountStore, categoryStore, itemStore等
└── types/
    └── index.ts               # TypeScript接口定义
```

---

## 开发迭代计划

### 阶段一：MVP（核心功能）
1. **初始化项目**
   - 创建 Next.js 14 项目，配置 Tailwind CSS
   - 安装依赖：antd-mobile, zustand, localForage, uuid 等

2. **数据层搭建**
   - 实现 `lib/db.ts`：封装 localForage 操作
   - 定义 TypeScript 接口 `types/index.ts`
   - 创建 Zustand store（使用 persist middleware）

3. **首页（分类视图）**
   - 创建 `app/page.tsx`
   - 支持列表/方格视图切换
   - 点击分类进入该分类的商品列表

4. **账号管理**
   - 创建 `app/accounts/page.tsx`
   - 实现账号的增删改查
   - 删除时检查关联商品

5. **分类管理**
   - 创建 `app/categories/page.tsx`
   - 实现分类的增删改查
   - 删除时检查关联商品

6. **商品管理（核心）**
   - 创建 `app/items/new/page.tsx` - 新增商品表单
   - 实现必填字段校验
   - 实时计算利润
   - 创建 `app/items/page.tsx` - 商品列表
   - 创建 `app/items/[id]/page.tsx` - 商品详情

7. **本地存储**
   - 确保所有数据持久化到 IndexedDB

### 阶段二：迭代功能
7. **图片上传**
   - 实现图片压缩（≤500KB）
   - 支持最多5张图片上传/预览/删除
   - 通过 localForage 存入 IndexedDB

8. **搜索与筛选**
   - 按商品名称模糊搜索
   - 按日期范围、分类、账号筛选

9. **利润统计**
   - 创建 `app/stats/page.tsx`
   - 汇总总利润、总销售额、总成本、总邮费
   - 按账号统计应收/应付金额

10. **内部结算**
    - 创建 `app/settlement/page.tsx`
    - 自动计算转账关系
    - 待结算/已结算列表
    - 标记结算功能
    - 结算后展示各账号净利润

### 阶段三：完善功能
11. **导入导出**
    - 创建 `app/import/page.tsx` - 导入预览
    - 实现 Excel/CSV 导出
    - 实现备份文件导入（含字段映射）

12. **设置页**
    - 创建 `app/settings/page.tsx`
    - 清除本地数据
    - 导出全部数据
    - 查看存储使用量

13. **移动端适配**
    - 底部导航栏（首页、商品列表、账号管理、结算汇总、设置）
    - Toast 位置优化（底部导航栏上方）
    - 响应式布局

---

## 关键技术要求

### 图片处理
- 单图 ≤2MB，支持 jpg/png/gif/webp
- 上传前压缩，目标 ≤500KB
- 最多 5 张图片
- 通过 localForage 存入 IndexedDB（自动转为 Blob）

### 内部结算逻辑
- 转账规则：
  1. 销售账号 → 购买账号：转账成本价
  2. 若邮费支付账号 ≠ 销售账号：销售账号 → 邮费支付账号：转账邮费
- 成本支付方净利润 = 0（收到转账 = 实际支出）
- 销售方净利润 = 售价 - 转出金额

### 响应式设计
- 移动端：底部导航栏（首页、商品列表、账号管理、结算汇总、设置）
- Toast 提示显示在屏幕底部导航栏上方

### 数据迁移
- 每个数据记录包含 `version` 字段
- 数据结构变更时编写迁移函数

---

## 代码规范

### TypeScript
- 所有代码必须使用 TypeScript
- 接口定义放在 `types/index.ts`
- 必须定义返回类型，不使用 `any`

### 组件
- 使用函数组件 + Hooks
- 组件文件使用 PascalCase 命名
- Props 使用 TypeScript interface 定义

### 样式
- 优先使用 Tailwind CSS
- 复杂组件使用 CSS Modules

### 数据层
- 所有 IndexedDB 操作通过 `lib/db.ts` 封装
- 禁止直接在组件中操作 localForage

---

## 注意事项

- IndexedDB 容量限制：50-100MB，建议总图片数 ≤100 张
- 商品列表分页，每页20条
- 图片使用懒加载
- 删除操作需二次确认
- 批量删除提示数量
- 利润为负时红色标记

---

## 相关文档

- [PRD.md](./PRD.md) - 产品需求文档
- [TECH_DESIGN.md](./TECH_DESIGN.md) - 技术设计文档
- [AGENTS.md](./AGENTS.md) - 开发指南

---

## 开发要求

1. 按照迭代计划逐步开发
2. 遵循代码规范
3. 每完成一个功能后，说明完成状态
4. 如遇到问题或需要决策，提出具体问题供我确认
5. 开发完成后，运行 lint 和 typecheck 确保代码正确
