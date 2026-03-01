# Meridian 开发指南

## 任务开始前

在开始任何开发任务前，务必使用 `find-skills` 技能查找可用的相关技能，以充分利用现有工具提升开发效率。

在进行前端页面样式UI开发时，务必使用 `frontend-design` 技能来确保高质量的界面设计。

## 1. 项目概述

### 1.1 产品定位
面向个人二手卖家的轻量级利润记账Web应用，支持记录商品售价、成本、邮费，自动计算利润，支持商品图片、分类管理，并提供多账号内部成本结算功能。

### 1.2 技术栈
- **前端框架**: Next.js 14 (App Router)
- **UI组件库**: Ant Design Mobile
- **状态管理**: Zustand + persist middleware
- **样式方案**: Tailwind CSS + CSS Modules
- **本地存储**: IndexedDB (via localForage)
- **部署平台**: Vercel

### 1.3 项目结构
```
src/
├── app/              # Next.js App Router 页面
│   ├── items/        # 商品模块
│   ├── accounts/     # 账号管理模块
│   ├── categories/   # 分类管理模块
│   ├── settlement/   # 内部结算模块
│   ├── stats/        # 利润统计模块
│   ├── import/       # 导入预览模块
│   └── settings/    # 设置模块
├── components/      # 公共组件 (ui/, layout/, forms/)
├── hooks/           # 自定义Hooks (useItems, useAccounts, useCategories, useSettlement, useImport, useExport, useSearch, useStats)
├── lib/             # 工具库
│   ├── db.ts        # IndexedDB封装 (localForage)
│   ├── storage.ts   # 存储层抽象
│   └── utils.ts     # 通用工具函数
├── store/           # Zustand状态管理 (accountStore, categoryStore, itemStore等)
└── types/           # TypeScript类型定义
```

---

## 2. 开发规范

### 2.1 分支管理
- `main` - 生产环境（自动部署）
- `dev` - 开发环境（自动部署预览）
- 功能分支 - 提交PR触发预览部署

### 2.2 路由规范
- 页面放在 `app/` 目录下，使用 App Router 规范
- 动态路由使用 `[id]` 文件夹命名
- 每个页面模块独立目录（如 `app/items/`）

### 2.3 状态管理
- 全局状态使用 Zustand，放在 `store/` 目录
- 使用 `persist` middleware 持久化到 localStorage
- 组件级状态使用 React useState

### 2.4 数据层
- 所有 IndexedDB 操作通过 `lib/db.ts` 封装
- 禁止直接在组件中操作 localForage
- 数据存储使用不同的 storeName：items、accounts、categories、settlementLogs

---

## 3. 代码风格

### 3.1 TypeScript
- 所有新增代码必须使用 TypeScript
- 接口定义放在 `types/index.ts`
- 必须定义返回类型，不使用 `any`

### 3.2 组件规范
- 使用函数组件 + Hooks
- 组件文件使用 PascalCase 命名（如 `ItemCard.tsx`）
- Props 使用 TypeScript interface 定义

### 3.3 样式规范
- 优先使用 Tailwind CSS
- 复杂组件样式使用 CSS Modules（`.module.css`）
- 保持样式类名简洁

### 3.4 命名规范
- 变量/函数: camelCase
- 组件/类型: PascalCase
- 文件: PascalCase.tsx

---

## 4. 功能开发要点

### 4.1 商品管理
- 新增/编辑页面使用表单组件
- 必填字段：商品名称、购买账号、邮费支付账号、销售账号、售价、成本、邮费
- 实时计算利润（profit = price - cost - shipping）
- 利润为负时红色标记

### 4.2 图片上传
- 单图 ≤2MB，支持 jpg/png/gif/webp
- 上传前压缩，目标 ≤500KB
- 最多 5 张图片
- 通过 localForage 存入 IndexedDB

### 4.3 内部结算
- 转账规则：
  1. 销售账号 → 购买账号：转账成本价
  2. 若邮费支付账号 ≠ 销售账号：销售账号 → 邮费支付账号：转账邮费
- 结算状态：Item.settled = true/false

### 4.4 利润统计
- 汇总总利润、总销售额、总成本、总邮费等
- 按账号统计各账号的应收/应付金额
- 结算后展示各账号净利润

### 4.5 响应式设计
- 移动端：底部导航栏（首页、商品列表、账号管理、结算汇总、设置）
- Toast 提示显示在屏幕底部导航栏上方

### 4.6 数据迁移
- 每个数据记录包含 `version` 字段
- 数据结构变更时编写迁移函数
- 新增字段提供默认值

### 4.7 导入导出
- 导出：支持将商品记录、结算清单导出为 Excel/CSV 格式
- 导入：支持从备份文件（CSV/JSON）导入，需预览数据并确认字段映射后方可执行

### 4.8 搜索与筛选
- 按商品名称模糊搜索
- 按日期范围、分类、账号筛选

---

## 5. 测试要求

### 5.1 功能测试
- 每个页面核心功能需测试
- 测试场景：
  - 新增/编辑/删除商品
  - 图片上传/预览/删除
  - 账号/分类管理
  - 内部结算计算
  - 导入/导出功能
  - 搜索与筛选

### 5.2 边界测试
- 空状态显示
- 数据为0或负数的情况
- 图片超过限制的处理
- 删除关联数据的二次确认

### 5.3 浏览器兼容性
- 测试主流浏览器最新版本（Chrome、Firefox、Safari、Edge）
- 移动端测试（iOS Safari、Android Chrome）

---

## 6. 注意事项

### 6.1 性能优化
- 商品列表分页，每页20条
- 图片使用懒加载
- 避免在组件中直接读取 IndexedDB，使用 Zustand 缓存

### 6.2 安全考虑
- 用户输入必填校验
- 数字字段 ≥0 校验
- XSS 防护（对用户输入转义）
- 图片格式限制

### 6.3 数据安全
- 删除账号/分类时检查关联商品
- 删除操作需二次确认
- 批量删除提示数量

### 6.4 常见问题
- IndexedDB 容量限制：50-100MB，建议总图片数 ≤100 张
- Blob 存储：localForage 自动处理，无需手动转换
- Zustand persist：首次加载可能短暂闪烁，属正常现象
- 导出功能入口：设置页可导出全部数据为 JSON/CSV

---

## 7. 相关文档

- [PRD.md](../PRD.md) - 产品需求文档
- [TECH_DESIGN.md](./TECH_DESIGN.md) - 技术设计文档
