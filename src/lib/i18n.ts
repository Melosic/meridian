export type Language = 'zh' | 'en';

export interface Translations {
  app: {
    title: string;
    description: string;
    home: string;
    items: string;
    accounts: string;
    categories: string;
    settlement: string;
    settings: string;
  };
  settings: {
    title: string;
    dataManagement: string;
    exportData: string;
    exportDesc: string;
    importData: string;
    importDesc: string;
    clearData: string;
    clearDesc: string;
    storageUsage: string;
    used: string;
    storageWarning: string;
    dataStats: string;
    products: string;
    language: string;
    languageDesc: string;
  };
  common: {
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    save: string;
    add: string;
    search: string;
    filter: string;
    yes: string;
    no: string;
    loading: string;
    success: string;
    error: string;
    noData: string;
  };
  items: {
    title: string;
    addItem: string;
    editItem: string;
    itemName: string;
    category: string;
    buyAccount: string;
    sellAccount: string;
    shippingAccount: string;
    price: string;
    cost: string;
    shipping: string;
    profit: string;
    remark: string;
    images: string;
    settled: string;
    createdAt: string;
    deleteConfirm: string;
    profitNegative: string;
  };
  accounts: {
    title: string;
    addAccount: string;
    editAccount: string;
    accountName: string;
    deleteConfirm: string;
  };
  categories: {
    title: string;
    addCategory: string;
    editCategory: string;
    categoryName: string;
    deleteConfirm: string;
  };
  settlement: {
    title: string;
    settle: string;
    settled: string;
    unsettled: string;
    settleAll: string;
    totalProfit: string;
    totalSales: string;
    totalCost: string;
    totalShipping: string;
    settlementComplete: string;
    selectItems: string;
  };
  import: {
    title: string;
    selectFile: string;
    preview: string;
    confirm: string;
    importSuccess: string;
    importFailed: string;
  };
  stats: {
    title: string;
    totalProfit: string;
    totalSales: string;
    totalCost: string;
    totalShipping: string;
    averageProfit: string;
  };
}

export const zh: Translations = {
  app: {
    title: 'Meridian',
    description: '个人二手卖家轻量级利润记账应用',
    home: '首页',
    items: '商品',
    accounts: '账号',
    categories: '分类',
    settlement: '结算',
    settings: '设置',
  },
  settings: {
    title: '设置',
    dataManagement: '数据管理',
    exportData: '导出数据',
    exportDesc: '导出为JSON或CSV',
    importData: '导入数据',
    importDesc: '从备份文件导入',
    clearData: '清除本地数据',
    clearDesc: '删除所有本地数据',
    storageUsage: '存储使用',
    used: '已使用',
    storageWarning: '数据存储在浏览器本地，超出限制可能导致存储失败',
    dataStats: '数据统计',
    products: '商品',
    language: '语言设置',
    languageDesc: '切换中英文',
  },
  common: {
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    add: '添加',
    search: '搜索',
    filter: '筛选',
    yes: '是',
    no: '否',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    noData: '暂无数据',
  },
  items: {
    title: '商品管理',
    addItem: '添加商品',
    editItem: '编辑商品',
    itemName: '商品名称',
    category: '分类',
    buyAccount: '购买账号',
    sellAccount: '销售账号',
    shippingAccount: '邮费账号',
    price: '售价',
    cost: '成本',
    shipping: '邮费',
    profit: '利润',
    remark: '备注',
    images: '商品图片',
    settled: '已结算',
    createdAt: '创建时间',
    deleteConfirm: '确定要删除该商品吗？',
    profitNegative: '亏损',
  },
  accounts: {
    title: '账号管理',
    addAccount: '添加账号',
    editAccount: '编辑账号',
    accountName: '账号名称',
    deleteConfirm: '确定要删除该账号吗？',
  },
  categories: {
    title: '分类管理',
    addCategory: '添加分类',
    editCategory: '编辑分类',
    categoryName: '分类名称',
    deleteConfirm: '确定要删除该分类吗？',
  },
  settlement: {
    title: '结算汇总',
    settle: '结算',
    settled: '已结算',
    unsettled: '未结算',
    settleAll: '全部结算',
    totalProfit: '总利润',
    totalSales: '总销售额',
    totalCost: '总成本',
    totalShipping: '总邮费',
    settlementComplete: '结算完成',
    selectItems: '选择要结算的商品',
  },
  import: {
    title: '导入数据',
    selectFile: '选择文件',
    preview: '预览',
    confirm: '确认导入',
    importSuccess: '导入成功',
    importFailed: '导入失败',
  },
  stats: {
    title: '利润统计',
    totalProfit: '总利润',
    totalSales: '总销售额',
    totalCost: '总成本',
    totalShipping: '总邮费',
    averageProfit: '平均利润',
  },
};

export const en: Translations = {
  app: {
    title: 'Meridian',
    description: 'Lightweight profit bookkeeping app for second-hand sellers',
    home: 'Home',
    items: 'Items',
    accounts: 'Accounts',
    categories: 'Categories',
    settlement: 'Settlement',
    settings: 'Settings',
  },
  settings: {
    title: 'Settings',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    exportDesc: 'Export as JSON or CSV',
    importData: 'Import Data',
    importDesc: 'Import from backup file',
    clearData: 'Clear Local Data',
    clearDesc: 'Delete all local data',
    storageUsage: 'Storage Usage',
    used: 'Used',
    storageWarning: 'Data is stored locally in browser, exceeding limits may cause storage failures',
    dataStats: 'Data Statistics',
    products: 'Products',
    language: 'Language',
    languageDesc: 'Switch between Chinese and English',
  },
  common: {
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    noData: 'No data',
  },
  items: {
    title: 'Items Management',
    addItem: 'Add Item',
    editItem: 'Edit Item',
    itemName: 'Item Name',
    category: 'Category',
    buyAccount: 'Buy Account',
    sellAccount: 'Sell Account',
    shippingAccount: 'Shipping Account',
    price: 'Price',
    cost: 'Cost',
    shipping: 'Shipping',
    profit: 'Profit',
    remark: 'Remark',
    images: 'Images',
    settled: 'Settled',
    createdAt: 'Created At',
    deleteConfirm: 'Are you sure you want to delete this item?',
    profitNegative: 'Loss',
  },
  accounts: {
    title: 'Account Management',
    addAccount: 'Add Account',
    editAccount: 'Edit Account',
    accountName: 'Account Name',
    deleteConfirm: 'Are you sure you want to delete this account?',
  },
  categories: {
    title: 'Category Management',
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    categoryName: 'Category Name',
    deleteConfirm: 'Are you sure you want to delete this category?',
  },
  settlement: {
    title: 'Settlement Summary',
    settle: 'Settle',
    settled: 'Settled',
    unsettled: 'Unsettled',
    settleAll: 'Settle All',
    totalProfit: 'Total Profit',
    totalSales: 'Total Sales',
    totalCost: 'Total Cost',
    totalShipping: 'Total Shipping',
    settlementComplete: 'Settlement Complete',
    selectItems: 'Select items to settle',
  },
  import: {
    title: 'Import Data',
    selectFile: 'Select File',
    preview: 'Preview',
    confirm: 'Confirm Import',
    importSuccess: 'Import Success',
    importFailed: 'Import Failed',
  },
  stats: {
    title: 'Profit Statistics',
    totalProfit: 'Total Profit',
    totalSales: 'Total Sales',
    totalCost: 'Total Cost',
    totalShipping: 'Total Shipping',
    averageProfit: 'Average Profit',
  },
};
