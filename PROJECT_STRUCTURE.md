# Daily Ledger - 项目结构说明

## 项目概述

Daily Ledger 是一个全栈个人财务管理应用，用于跟踪收入和支出。采用现代技术栈，支持多语言国际化，现代化 UI 设计：

- **前端**: React 18 + React Bootstrap + Axios + i18next
- **后端**: Node.js + Express + MongoDB
- **认证**: JWT (JSON Web Tokens)
- **数据库**: MongoDB
- **国际化**: i18next (支持中文/英文切换)

## 项目结构

```
DailyLedger/
├── client/                          # React 前端应用
│   ├── public/                      # 静态资源
│   │   ├── index.html              # HTML 入口
│   │   ├── _redirects              # Netlify/Render 重定向配置
│   │   └── render.json             # Render 部署配置
│   ├── src/                         # 源代码
│   │   ├── App.js                  # 主应用组件 (路由配置、认证检查)
│   │   ├── App.css                 # 全局样式 (变量、主题色)
│   │   ├── index.js                # 应用入口 (ReactDOM 挂载)
│   │   ├── index.css               # 全局重置样式
│   │   │
│   │   ├── components/             # 可复用组件
│   │   │   ├── Navbar.js           # 导航栏 (路由链接、用户菜单、语言切换)
│   │   │   ├── Navbar.css          # 导航栏样式 (响应式菜单、渐变背景)
│   │   │   ├── PrivateRoute.js     # 受保护路由 (认证检查、重定向)
│   │   │   └── LanguageSwitcher.js # 语言切换器 (i18n 集成)
│   │   │
│   │   ├── pages/                  # 页面组件
│   │   │   ├── Login.js            # 登录页 (邮箱密码认证)
│   │   │   ├── Auth.css            # 认证页面样式 (双栏设计、渐变)
│   │   │   ├── Register.js         # 注册页 (用户创建账户)
│   │   │   ├── ForgotPassword.js   # 忘记密码页 (密码重置)
│   │   │   ├── ChangePassword.js   # 修改密码页 (安全变更)
│   │   │   ├── DayDetail.js        #
│   │   │   │── Dashboard.js        # 仪表盘 (统计卡片、近期交易)
│   │   │   ├── Transactions.js     # 交易记录
│   │   │   └── Profile.js          # 用户资料页 (个人信息、密码修改)
│   │   ├── context/                # 全局状态管理
│   │   │   └── AuthContext.js      # 认证上下文 (用户信息、登录登出)
│   │   │
│   │   ├── services/               # API 服务层
│   │   │   ├── api.js              # HTTP 客户端 (Axios 配置、拦截器)
│   │   │   └── accountingApi.js    # 会计 API (交易、分类、标签操作)
│   │   │
│   │   ├── i18n/                   # 国际化配置
│   │   │   ├── config.js           # i18next 配置 (语言检测、命名空间)
│   │   │   └── locales/            # 翻译文件
│   │   │       ├── en.json         # 英文翻译 (110+ 键)
│   │   │       └── zh.json         # 中文翻译 (110+ 键)
│   │   │
│   │   └── config/                 # 应用配置
│   │       └── wage.config.js      # 工资配置 (扩展功能)
│   │
│   ├── build/                       # 生产构建输出 (npm run build)
│   │   ├── index.html
│   │   ├── static/                  # JS/CSS 打包文件
│   │   ├── _redirects
│   │   ├── asset-manifest.json
│   │   └── render.json
│   │
│   ├── package.json                 # 前端依赖和脚本
│   └── .env.local                   # 本地环境变量 (可选)
│
├── server/                          # Node.js + Express 后端应用
│   ├── src/
│   │   ├── index.js                # 服务器入口 (Express 应用、路由注册)
│   │   │
│   │   ├── config/                 # 配置模块
│   │   │   ├── env.js              # 环境变量加载 (dotenv 配置)
│   │   │   ├── mongodb.js          # MongoDB 连接 (Mongoose 连接字符串)
│   │   │   └── firebase.js         # Firebase 配置 (Admin SDK 初始化)
│   │   │
│   │   ├── models/                 # 数据模型 (Mongoose Schema)
│   │   │   ├── index.js            # 模型导出汇总
│   │   │   ├── User.js             # 用户模型 (用户名、邮箱、密码、角色)
│   │   │   ├── Category.js         # 分类模型 (名称、类型、图标、颜色)
│   │   │   ├── Label.js            # 标签模型 (名称、颜色、用户关联)
│   │   │   ├── Transaction.js      # 交易模型 (日期、金额、分类、标签)
│   │   │   └── mongodb/            # MongoDB 专用模型
│   │   │       ├── UserModel.js
│   │   │       ├── OrderModel.js
│   │   │       └── WorkTimeModel.js
│   │   │
│   │   ├── controllers/            # 业务逻辑控制器
│   │   │   ├── userController.js   # 用户操作 (注册、登录、资料更新)
│   │   │   ├── categoryController.js  # 分类操作 (CRUD)
│   │   │   ├── labelController.js     # 标签操作 (CRUD)
│   │   │   ├── transactionController.js # 交易操作 (CRUD、筛选、统计)
│   │   │   └── statsController.js  # 统计分析 (汇总、分类、标签、趋势)
│   │   │
│   │   ├── routes/                 # API 路由定义
│   │   │   ├── userRoutes.js       # 用户路由 (auth、profile、password)
│   │   │   ├── categoryRoutes.js   # 分类路由 (CRUD、受保护)
│   │   │   ├── labelRoutes.js      # 标签路由 (CRUD、受保护)
│   │   │   ├── transactionRoutes.js # 交易路由 (CRUD、筛选、批删)
│   │   │   └── statsRoutes.js      # 统计路由 (汇总、分类、标签、趋势)
│   │   │
│   │   └── middleware/             # 中间件
│   │       └── auth.js             # JWT 认证中间件 (token 验证)
│   │
│   ├── package.json                # 后端依赖和脚本
│   ├── serviceAccountKey.json      # Firebase 服务账户密钥 (git ignore)
│   ├── .env                        # 环境变量 (git ignore)
│   ├── test-mongodb.js             # MongoDB 连接测试脚本
│   ├── switch-db.js                # 数据库切换工具脚本
│   └── scripts/                    # 工具脚本目录
│
├── README.md                        # 项目说明文档 (使用指南、快速开始)
├── PROJECT_STRUCTURE.md             # 本文件 (项目结构详细说明)
├── CHANGELOG_UI_IMPROVEMENTS.md     # UI 改进日志
├── ENV_CONFIG.md                    # 环境配置指南
│
└── .gitignore                       # Git 忽略文件

## 核心文件说明

### 前端核心
- **App.js**: 应用入口，路由配置，认证状态检查
- **AuthContext.js**: 全局认证状态管理
- **api.js**: HTTP 客户端，Axios 拦截器
- **Navbar.js**: 应用导航栏，路由链接，用户菜单

### 后端核心
- **index.js**: Express 服务器配置，路由注册，中间件设置
- **models/**: Mongoose 数据模型定义
- **controllers/**: 业务逻辑实现
- **routes/**: API 端点定义
- **middleware/auth.js**: JWT 认证中间件

### 配置文件
- **.env**: 后端环境变量 (git ignore)
- **package.json**: 依赖管理和脚本定义
- **render.json**: Render 部署配置
- **_redirects**: SPA 路由重定向配置
```

## 核心功能模块

### 1. 用户管理 (User Management)

- **注册**: 新用户账户创建，现代化双栏设计
- **登录**: 用户身份验证，JWT Token 生成，支持 Firebase Auth
- **忘记密码**: 密码重置功能
- **个人资料**: 查看和编辑用户信息，显示会员时长
- **密码管理**: 修改用户密码
- **权限**: 基于角色的访问控制 (User/Admin)

### 2. 交易管理 (Transaction Management)

- **创建交易**: 记录收入或支出，支持分类和标签
- **编辑交易**: 模态框内修改交易详情
- **删除交易**: 批量或单个删除交易记录
- **查询交易**: 按日期、分类、标签、类型筛选
- **交易统计**: 收入/支出统计，图表展示
- **会计设置**: 自定义显示列、排序选项、每页条数

### 3. 分类管理 (Category Management)

- **创建分类**: 为收入/支出创建自定义分类，支持图标和颜色
- **编辑分类**: 模态框内修改分类信息
- **删除分类**: 删除分类
- **分类查询**: 按类型查询分类
- **分类统计**: 显示各分类支出占比

### 4. 标签管理 (Label Management)

- **创建标签**: 为交易创建自定义标签
- **编辑标签**: 修改标签信息
- **删除标签**: 删除标签
- **标签筛选**: 按标签筛选交易
- **标签统计**: 显示各标签使用情况

### 5. 统计分析 (Statistics)

- **支出概览**: 当前月份支出趋势
- **分类分布**: 饼图展示分类支出占比
- **标签分布**: 饼图展示标签使用情况
- **Top 支出**: 显示最高支出项目
- **日期筛选**: 按月份查看历史数据

### 6. 仪表盘 (Dashboard)

- **统计卡片**: 显示总收入、总支出、净余额、交易数
- **近期交易**: 显示最近的交易记录
- **快速操作**: 添加交易、查看详情
- **响应式设计**: 移动端和桌面端自适应

### 7. 国际化 (Internationalization)

- **多语言支持**: 中文/英文无缝切换
- **语言切换器**: 桌面端和移动端都支持
- **持久化存储**: localStorage 保存语言偏好
- **动态更新**: 页面标题和内容实时切换

## 技术栈详解

### 前端技术

- **React 18.2.0**: 现代前端框架，组件化开发
- **React Router v6**: 页面路由管理，支持 PrivateRoute
- **React Bootstrap 2.10.10**: UI 组件库，响应式设计
- **Axios**: HTTP 客户端，API 通信，统一拦截器
- **Context API**: 全局状态管理 (认证状态)
- **i18next**: 国际化框架
- **react-i18next**: React i18n 绑定，useTranslation hook
- **Chart.js / Recharts**: 图表库，数据可视化

### 后端技术

- **Express.js 4.x**: 轻量级 Web 框架
- **MongoDB**: NoSQL 数据库
- **Mongoose 8.x**: MongoDB ODM，数据模型定义
- **JWT (jsonwebtoken)**: Token 认证机制
- **Firebase Admin SDK**: Firebase 身份验证集成
- **bcryptjs**: 密码加密库
- **Dotenv**: 环境变量管理
- **CORS**: 跨域资源共享配置

### 设计系统

- **配色方案**: 紫色渐变主题
  - 主色: `#667eea → #764ba2 → #f093fb` (品牌区)
  - 强调色: `#8b5cf6 → #7c3aed` (按钮)
  - 背景: `#0f172a → #1e293b` (深色渐变)
  - 文本: `#f1f5f9, #e2e8f0, #94a3b8` (浅色层次)
- **响应式断点**:
  - 992px (桌面/平板)
  - 576px (移动端)
- **动画效果**: pulse, float, bounce, slideIn, slideDown
- **UI 风格**: 现代化卡片设计，毛玻璃效果，平滑过渡

## 数据模型

### User (用户)

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  role: String ('user' | 'admin'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Category (分类)

```javascript
{
  _id: ObjectId,
  name: String (required),
  type: String ('Expenses' | 'Income'),
  description: String,
  icon: String,           // 图标 emoji
  color: String,          // 颜色代码
  userId: ObjectId (ref: User),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Label (标签)

```javascript
{
  _id: ObjectId,
  name: String (required),
  color: String,          // 标签颜色
  userId: ObjectId (ref: User),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction (交易)

```javascript
{
  _id: ObjectId,
  date: Date (required),
  amount: Number (required),
  type: String ('Expenses' | 'Income'),
  categoryId: ObjectId (ref: Category),
  labelId: ObjectId (ref: Label),  // 新增标签关联
  description: String,
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## API 端点

### 认证相关

- `POST /api/users/register` - 注册新用户
- `POST /api/users/login` - 登录用户
- `POST /api/users/forgot-password` - 忘记密码
- `POST /api/users/reset-password` - 重置密码
- `GET /api/users/profile` - 获取用户资料 (需认证)
- `PUT /api/users/profile` - 更新用户资料 (需认证)
- `PUT /api/users/change-password` - 修改密码 (需认证)

### 分类管理

- `GET /api/categories` - 获取分类列表 (需认证)
- `GET /api/categories/:id` - 获取单个分类 (需认证)
- `POST /api/categories` - 创建分类 (需认证)
- `PUT /api/categories/:id` - 更新分类 (需认证)
- `DELETE /api/categories/:id` - 删除分类 (需认证)

### 标签管理

- `GET /api/labels` - 获取标签列表 (需认证)
- `GET /api/labels/:id` - 获取单个标签 (需认证)
- `POST /api/labels` - 创建标签 (需认证)
- `PUT /api/labels/:id` - 更新标签 (需认证)
- `DELETE /api/labels/:id` - 删除标签 (需认证)

### 交易管理

- `GET /api/transactions` - 获取交易列表 (需认证, 支持筛选、分页、排序)
  - Query 参数: `type`, `categoryId`, `labelId`, `startDate`, `endDate`, `page`, `limit`, `sort`
- `GET /api/transactions/:id` - 获取单个交易详情 (需认证)
- `POST /api/transactions` - 创建交易 (需认证)
- `PUT /api/transactions/:id` - 更新交易 (需认证)
- `DELETE /api/transactions/:id` - 删除单个交易 (需认证)
- `POST /api/transactions/bulk-delete` - 批量删除交易 (需认证)

### 统计分析

- `GET /api/stats/summary` - 获取总体统计 (需认证)
  - 返回: 总收入、总支出、净余额、交易数
- `GET /api/stats/category` - 获取分类统计 (需认证)
  - Query 参数: `startDate`, `endDate`, `type`
- `GET /api/stats/label` - 获取标签统计 (需认证)
  - Query 参数: `startDate`, `endDate`
- `GET /api/stats/trend` - 获取趋势数据 (需认证)
  - Query 参数: `startDate`, `endDate`, `groupBy` (day/week/month)

## 页面及功能

### 登录页面 (`/login`)

- **现代化双栏设计**: 左侧品牌区，右侧表单区
- **品牌展示**: 应用 logo、欢迎语、功能特性卡片
- **表单元素**: 邮箱、密码输入，带图标装饰
- **加载状态**: 提交时显示加载动画
- **响应式**: 移动端单栏布局
- **紫色渐变主题**: 现代化配色方案
- **完全国际化**: 支持中英文切换

### 注册页面 (`/register`)

- **匹配登录页设计**: 统一的视觉风格
- **四个表单字段**: 用户名、邮箱、密码、确认密码
- **密码验证**: 最少 6 字符提示
- **功能展示**: 快速设置、安全、多语言支持
- **全屏无边框**: Edge-to-edge 设计
- **密码可见性增强**: 等宽字体、字符间距优化

### 忘记密码页面 (`/forgot-password`)

- 邮箱输入
- 密码重置链接发送

### 修改密码页面 (`/change-password`)

- 当前密码验证
- 新密码输入
- 密码确认

### 仪表盘页面 (`/dashboard`)

- **统计卡片**: 总收入、总支出、净余额、交易数
- **近期交易列表**: 最近 10 条交易记录
- **快速添加**: 添加交易按钮
- **响应式布局**: 移动端和桌面端自适应
- **实时更新**: 数据自动刷新

### 会计页面 (`/accounting`)

- **交易表格**: 日期、金额、类型、分类、标签、描述
- **高级筛选**:
  - 日期范围选择器
  - 交易类型筛选 (收入/支出/全部)
  - 分类多选
  - 标签多选
- **批量操作**: 多选删除交易
- **添加交易模态框**: 完整表单，支持分类和标签
- **编辑功能**: 行内编辑或模态框编辑
- **会计设置**:
  - 自定义显示列
  - 排序选项 (日期/金额)
  - 每页显示条数
- **分页**: 支持大数据集浏览

### 统计分析页面 (`/statistics`)

- **支出概览图**: 当前月份每日支出趋势线
- **分类分布饼图**: 各分类支出占比
- **标签分布饼图**: 各标签使用情况
- **Top 支出表格**: 最高金额交易列表
- **日期筛选器**: 按月份查看历史数据
- **刷新按钮**: 手动刷新统计数据
- **无数据提示**: 友好的空状态展示

### 用户资料页面 (`/profile`)

- **个人信息卡片**: 用户名、邮箱、角色徽章
- **会员信息**: 注册时间、会员时长
- **编辑模式**: 用户名修改
- **修改密码表单**: 当前密码、新密码、确认密码
- **成功/错误提示**: 操作反馈
- **登出按钮**: 安全退出

## 环境配置

### 后端环境变量 (`.env`)

```bash
# 服务器配置
NODE_ENV=development
PORT=5000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/daily-ledger
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/daily-ledger

# JWT 配置
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# CORS 配置
CORS_ORIGIN=http://localhost:3000

# Firebase 配置 (可选)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
# 或使用服务账户密钥文件: serviceAccountKey.json
```

### 前端环境变量 (可选)

```bash
# API 端点 (如果需要覆盖默认代理)
REACT_APP_API_URL=http://localhost:5000

# Firebase 配置 (如果使用 Firebase Auth)
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### 前端代理配置 (`package.json`)

```json
{
  "proxy": "http://localhost:5000"
}
```

- 自动转发 `/api/*` 请求到后端
- 避免 CORS 问题

## 安装和运行

### 前置要求

- Node.js (v14+)
- MongoDB (本地或云端)
- npm 或 yarn

### 后端安装和运行

```bash
cd server
npm install

# 创建 .env 文件
cp .env.example .env

# 编辑 .env 配置数据库连接

# 开发模式运行
npm run dev

# 生产模式运行
npm start
```

### 前端安装和运行

```bash
cd client
npm install

# 开发模式运行
npm start

# 生产构建
npm run build
```

## 开发工作流

1. **启动 MongoDB**: 确保本地 MongoDB 运行
2. **启动后端服务器**: `cd server && npm run dev`
3. **启动前端开发服务器**: `cd client && npm start`
4. **访问应用**: http://localhost:3000

## 认证流程

### JWT 认证流程

1. 用户在前端输入凭证
2. 前端调用 `/api/users/login` API
3. 后端验证凭证，生成 JWT Token
4. 前端存储 Token 到 localStorage
5. 后续请求在 Header 中携带 `Authorization: Bearer <token>`
6. 后端中间件验证 Token 的有效性
7. Token 过期后需要重新登录

### Firebase 认证集成 (可选)

1. 前端使用 Firebase SDK 进行身份验证
2. 获取 Firebase ID Token
3. 将 ID Token 发送到后端
4. 后端使用 Firebase Admin SDK 验证 Token
5. 生成应用内部 JWT Token
6. 双重验证保障安全性

### PrivateRoute 保护

- 使用 `AuthContext` 管理认证状态
- `PrivateRoute` 组件检查登录状态
- 未登录用户自动重定向到登录页
- 登录后恢复原访问路径

## 错误处理

- 所有 API 返回标准 JSON 格式
- 错误响应包含 `error` 字段说明错误信息
- HTTP 状态码:
  - 200: 成功
  - 201: 创建成功
  - 400: 请求错误
  - 401: 未授权
  - 404: 资源不找
  - 500: 服务器错误

## 性能优化

- MongoDB 复合索引优化查询性能
- 分页支持大数据集查询
- React Bootstrap 减少 CSS 编写
- Axios 请求拦截器统一处理认证

## 安全性

- 密码使用 bcryptjs 加密存储
- JWT Token 有效期设置 (默认 7 天)
- 受保护路由需要有效 Token
- CORS 配置限制来源
- 环境变量分离敏感信息

## 已实现的高级功能

- ✅ **国际化 (i18n)**: 完整的中英文支持，110+ 翻译键
- ✅ **现代化 UI**: 紫色渐变主题，毛玻璃效果，平滑动画
- ✅ **标签系统**: 支持为交易添加自定义标签
- ✅ **高级筛选**: 多维度筛选交易 (日期、分类、标签、类型)
- ✅ **数据可视化**: 图表展示支出趋势和分布
- ✅ **会计设置**: 自定义表格显示列和排序
- ✅ **批量操作**: 支持批量删除交易
- ✅ **响应式设计**: 完美适配桌面和移动设备
- ✅ **密码安全**: bcrypt 加密，密码强度要求
- ✅ **分页支持**: 大数据集高效加载

## 未来扩展建议

1. **预算功能**: 设置分类预算，超支提醒
2. **重复交易**: 支持定期自动记账
3. **数据导出**: CSV/Excel 导出功能
4. **PWA 支持**: 离线访问，移动端安装
5. **黑暗模式**: UI 主题切换
6. **多币种**: 支持多种货币和汇率转换
7. **账单扫描**: OCR 识别账单内容
8. **财务报告**: 生成月度/年度财务报表
9. **协作功能**: 家庭账本共享
10. **AI 分析**: 智能支出建议和预测

## 国际化架构

### i18next 配置

- **配置文件**: `src/i18n/config.js`
- **语言检测**:
  1. localStorage (`language` key)
  2. 浏览器语言
  3. 默认语言 (en)
- **持久化**: 语言偏好保存到 localStorage
- **事件监听**: `languageChanged` 事件更新 document.title 和 document.documentElement.lang

### 翻译文件结构

```javascript
{
  "navbar": {
    "appName": "Daily Ledger",
    "dashboard": "Dashboard",
    "statistics": "Statistics",
    // ...
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    // ...28 keys
  },
  "dashboard": { /* ... */ },
  "statistics": { /* ... */ },
  "profile": { /* ... */ },
  "transaction": { /* ... */ },
  "common": { /* ... */ }
}
```

### 使用方法

```javascript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t("navbar.appName")}</h1>;
}
```

### 语言切换组件

- **LanguageSwitcher.js**: 独立的语言切换组件
- **桌面端**: 导航栏右侧下拉菜单，带图标和箭头指示
- **移动端**: 侧边栏中的语言选项按钮
- **状态同步**: 使用 i18n 事件监听器保持状态一致
- **视觉反馈**: 当前语言高亮显示，点击外部关闭菜单

## 故障排除

### 连接数据库错误

- 确保 MongoDB 服务运行: `mongod` 或 MongoDB Atlas 连接
- 检查 `.env` 中的 `MONGODB_URI` 配置
- 验证网络连接和防火墙设置

### 前端 API 请求失败

- 检查后端服务是否运行: `http://localhost:5000`
- 查看浏览器控制台错误信息
- 验证 CORS 配置: `CORS_ORIGIN=http://localhost:3000`
- 检查代理配置: `package.json` 中的 `proxy` 字段

### Token 过期问题

- 清除 localStorage 中的 token: `localStorage.removeItem('token')`
- 重新登录获取新 token
- 检查 JWT_EXPIRE 设置 (默认 7d)

### 语言切换不生效

- 清除浏览器缓存
- 检查 localStorage 中的 `language` 值
- 确认翻译文件正确加载: 浏览器 Network 标签
- 验证 i18n 配置: `src/i18n/config.js`

### 样式问题

- 清除构建缓存: `cd client && rm -rf build node_modules/.cache`
- 重新安装依赖: `npm install`
- 检查 CSS 导入顺序
- 验证 Bootstrap 版本兼容性

## 部署指南

### 后端部署

1. **环境准备**:

   - Node.js 14+ 运行环境
   - MongoDB 数据库 (本地或 Atlas)
   - 配置生产环境变量

2. **构建命令**: 无需构建，直接运行
3. **启动命令**: `npm start` 或 `node src/index.js`
4. **端口配置**: 默认 5000，可通过 PORT 环境变量修改

### 前端部署

1. **构建命令**: `npm run build`
2. **构建输出**: `build/` 目录
3. **静态托管**:

   - Netlify: 使用 `_redirects` 文件支持 SPA 路由
   - Render: 使用 `render.json` 配置
   - Vercel/GitHub Pages: 需配置重写规则

4. **环境变量**:
   - 设置 `REACT_APP_API_URL` 指向后端 API
   - 配置 Firebase 凭证 (如使用)

### 推荐部署方案

- **后端**: Railway / Render / Heroku
- **前端**: Netlify / Vercel / Render
- **数据库**: MongoDB Atlas (免费层 512MB)

## 性能优化

- ✅ MongoDB 复合索引优化查询性能
- ✅ 分页支持大数据集查询
- ✅ Axios 拦截器统一处理认证
- ✅ React.memo 优化组件渲染
- ✅ Lazy loading 路由组件 (可选)
- ✅ CSS 按需加载，减少首屏体积
- ✅ 图片懒加载和压缩 (如有)

## 安全性

- ✅ 密码使用 bcryptjs 加密存储 (salt rounds: 10)
- ✅ JWT Token 有效期设置 (默认 7 天)
- ✅ 受保护路由需要有效 Token
- ✅ CORS 配置限制来源
- ✅ 环境变量分离敏感信息
- ✅ Firebase Admin SDK 验证 (双重认证)
- ✅ 防止 SQL 注入 (使用 Mongoose)
- ✅ XSS 防护 (React 自动转义)

## 许可证

MIT
