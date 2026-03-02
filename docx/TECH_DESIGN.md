# Meridian 技术设计文档

## 1. 技术栈选择

### 1.1 前端

| 技术 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | 支持静态导出，部署灵活 |
| UI组件库 | Ant Design Mobile | 移动端友好，响应式组件丰富 |
| 状态管理 | Zustand | 轻量级，适合管理全局状态 |
| 样式方案 | Tailwind CSS + CSS Modules | 快速开发 + 组件级样式隔离 |
| 数据获取 | SWR | 为未来云端API预留 |

### 1.2 后端

| 方案 | 技术 | 说明 |
|------|------|------|
| MVP（当前） | 纯前端 + IndexedDB | 无需后端，数据存储在浏览器 |
| 扩展（未来） | Next.js API Routes + Supabase | BFF层处理复杂逻辑 |

### 1.3 数据库

| 阶段 | 技术 | 说明 |
|------|------|------|
| MVP | IndexedDB (通过 localForage 封装) | 浏览器本地存储，刷新不丢失 |
| 云端 | Supabase PostgreSQL | 关系型数据库，支持多表关联 |

### 1.4 图片存储

| 阶段 | 技术 | 说明 |
|------|------|------|
| MVP | IndexedDB (通过 localForage 封装 Blob) | 注意容量限制，建议单图≤500KB |
| 云端 | Supabase Storage / Vercel Blob | 大容量云存储 |

### 1.5 部署

- 平台：Vercel
- 代码托管：GitHub
- 环境：生产环境（main分支）、开发环境（dev分支）

---

## 2. 项目结构

```
Meridian/
├── public/                     # 静态资源
│   └── icons/                  # 应用图标
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页（分类视图）
│   │   ├── globals.css         # 全局样式
│   │   ├── items/              # 商品模块
│   │   │   ├── page.tsx        # 商品列表页（含搜索/筛选）
│   │   │   ├── new/page.tsx    # 新增商品页
│   │   │   └── [id]/page.tsx   # 商品详情页
│   │   ├── accounts/           # 账号管理模块
│   │   │   └── page.tsx
│   │   ├── categories/         # 分类管理模块
│   │   │   └── page.tsx
│   │   ├── settlement/          # 内部结算模块
│   │   │   └── page.tsx
│   │   ├── stats/               # 利润统计模块（含按账号统计）
│   │   │   └── page.tsx
│   │   ├── import/              # 导入预览模块
│   │   │   └── page.tsx
│   │   └── settings/           # 设置模块
│   │       └── page.tsx
│   ├── components/            # 公共组件
│   │   ├── ui/                 # 基础UI组件
│   │   ├── layout/             # 布局组件（导航栏、底部栏）
│   │   └── forms/              # 表单组件
│   ├── hooks/                  # 自定义Hooks
│   │   ├── useItems.ts         # 商品数据操作
│   │   ├── useAccounts.ts      # 账号数据操作
│   │   ├── useCategories.ts    # 分类数据操作
│   │   ├── useSettlement.ts    # 结算计算逻辑
│   │   ├── useImport.ts        # 导入功能
│   │   ├── useExport.ts        # 导出功能
│   │   ├── useSearch.ts         # 搜索与筛选
│   │   └── useStats.ts         # 利润统计
│   ├── lib/                    # 工具库
│   │   ├── db.ts               # IndexedDB封装
│   │   ├── storage.ts          # 存储层抽象
│   │   └── utils.ts            # 通用工具函数
│   ├── store/                  # Zustand状态管理
│   │   └── index.ts
│   └── types/                  # TypeScript类型定义
│       └── index.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

### 目录说明

| 目录 | 职责 |
|------|------|
| `app/` | 页面路由，Next.js App Router规范 |
| `components/ui/` | 按钮、输入框、弹窗等基础组件 |
| `components/layout/` | 顶部导航、底部导航栏、侧边栏 |
| `hooks/` | 业务逻辑复用，数据处理 |
| `lib/db.ts` | IndexedDB底层操作，屏蔽存储细节 |
| `lib/storage.ts` | 存储层抽象，定义数据访问接口 |
| `lib/utils.ts` | 通用工具函数（格式化、校验等） |
| `store/` | Zustand状态管理（accountStore、categoryStore、itemStore等） |
| `types/` | TypeScript接口定义 |

---

## 3. 数据模型

### 3.1 商品表 (Item)

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
```

**计算字段**（不持久化存储）：
- `profit` = price - cost - shipping

### 3.2 账号表 (Account)

```typescript
interface Account {
  id: string;           // UUID
  name: string;         // 账号名称（如"闲鱼号A"）
  createdAt: string;    // ISO时间
}
```

### 3.3 分类表 (Category)

```typescript
interface Category {
  id: string;           // UUID
  name: string;         // 分类名称（如"电子产品"）
  createdAt: string;    // ISO时间
}
```

### 3.4 结算记录表 (SettlementLog)

```typescript
interface SettlementLog {
  id: string;           // UUID
  itemIds: string[];   // 本次结算的商品ID列表
  settledAt: string;   // 结算时间
}
```

### 3.5 导入映射配置 (ImportMapping)

```typescript
interface ImportMapping {
  name: string;           // 商品名称字段映射
  price: string;         // 售价字段映射
  cost: string;          // 成本价字段映射
  shipping?: string;     // 邮费字段映射（可选）
  categoryId?: string;   // 分类字段映射（可选）
  buyAccountId?: string;      // 购买账号字段映射（可选）
  shippingAccountId?: string; // 邮费支付账号映射（可选）
  sellAccountId?: string;     // 销售账号字段映射（可选）
}
```

### 3.6 数据关联

```
Item (商品)
├── categoryId → Category.id
├── buyAccountId → Account.id
├── shippingAccountId → Account.id
└── sellAccountId → Account.id
```

---

## 4. 关键技术点

### 4.1 IndexedDB 本地存储

- **封装层**：`lib/db.ts` 使用 `localForage` 封装（异步、兼容性好），提供统一的 `getItems()`、`saveItem()`、`deleteItem()` 等接口
- **数据隔离**：不同数据类型使用不同的 storeName（items、accounts、categories）
- **版本管理**：通过 version 字段实现数据结构迁移

### 4.2 图片处理

- **上传限制**：单图 ≤2MB，支持 jpg/png/gif/webp
- **压缩建议**：上传前使用 Canvas 或库（如 browser-image-compression）压缩，目标 ≤500KB
- **存储方式**：通过 localForage 存入 IndexedDB（自动转为 Blob 存储）
- **显示优化**：列表页使用缩略图，详情页使用原图

### 4.3 内部结算逻辑

**转账规则**：
1. 销售账号收到售价后，需向购买账号转账成本价
2. 若邮费支付账号 ≠ 销售账号，还需向邮费支付账号转账邮费

**净利润计算**：
- 成本支付方（A）：收到转账 - 实际支出 = 0元
- 销售方（B）：售价 - 转出金额 = 净利润

**结算状态**：Item.settled = true/false，结算后更新商品状态并记录到已结算列表

### 4.4 响应式设计

- **移动端**：底部导航栏（首页、商品列表、账号管理、结算汇总、设置）
- **桌面端**：顶部导航 + 侧边布局
- **组件**：使用 Ant Design Mobile 的 `<Grid>`、`<Card>` 等响应式组件
- **Toast位置**：移动端 Toast 提示统一显示在屏幕底部导航栏上方，持续2秒自动消失

### 4.5 数据迁移

- **版本字段**：每个数据记录包含 `version` 字段
- **迁移逻辑**：应用启动时检查版本，若低于当前版本，执行迁移函数
- **向后兼容**：新增字段提供默认值

### 4.6 批量操作

- **多选**：商品列表支持复选框多选
- **批量删除**：需二次确认，提示"确认删除选中的X件商品？"
- **批量改分类**：选择目标分类后批量更新
- **批量结算**：结算汇总页支持多选后一键结算

### 4.7 导入导出

- **导出**：支持将商品记录、结算清单导出为 Excel/CSV 格式
- **导入**：支持从备份文件（CSV/JSON）导入，需预览数据并确认字段映射后方可执行

### 4.8 搜索与筛选

- **按商品名称搜索**：支持模糊搜索
- **按日期范围筛选**：筛选特定时间段内的交易记录
- **按分类/账号筛选**：快速筛选特定分类或账号的商品

### 4.9 性能优化

- **分页**：商品列表每页20条，支持懒加载
- **图片懒加载**：使用 Next.js `<Image>` 或原生 lazy loading
- **状态缓存**：Zustand 配合 `persist` middleware 持久化到 localStorage，缓存账号、分类列表，避免重复读取 IndexedDB

### 4.10 安全考虑

- **输入校验**：商品名称必填，数字字段 ≥0
- **XSS防护**：对用户输入进行转义
- **图片格式限制**：仅允许 jpg/png/gif/webp

---

## 5. 扩展性设计

### 5.1 云端同步（未来版本）

- 数据存储层抽象为接口，可无缝替换为 Supabase API
- 新增 `useSync` Hook 处理同步逻辑
- 认证：Supabase Auth 或 NextAuth.js

### 5.2 预留字段

商品表预留以下字段（当前版本可不用）：
- `tags`: string[] - 标签
- `platform`: string - 交易平台（闲鱼、转转、eBay）
- `soldAt`: string - 成交日期
