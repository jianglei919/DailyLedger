# Daily Ledger 📊

一个现代化的个人财务管理应用，用于跟踪和管理日常收入和支出。

## 🎯 快速开始

### 前置要求

- Node.js (v14 或更高版本)
- MongoDB (本地安装或 MongoDB Atlas 云服务)
- npm 或 yarn

### 一步步安装

#### 1. 克隆仓库并进入项目

```bash
cd DailyLedger
```

#### 2. 设置后端服务器

```bash
cd server

# 安装依赖
npm install

# 创建环境配置文件
cp .env.example .env

# 编辑 .env 文件，配置你的 MongoDB 连接字符串
# 如果使用本地 MongoDB，默认值即可

# 启动开发服务器 (监听 5000 端口)
npm run dev
```

#### 3. 设置前端应用 (新终端)

```bash
cd client

# 安装依赖
npm install

# 启动前端开发服务器 (监听 3000 端口)
npm start
```

#### 4. 访问应用

打开浏览器访问 `http://localhost:3000`

## ✨ 主要功能

- 📝 **用户认证**: 注册、登录、个人资料管理、忘记密码
- 💰 **交易管理**: 记录、编辑、删除收入和支出，支持批量操作
- 🏷️ **分类管理**: 创建自定义收入/支出分类，支持图标和颜色
- 🏷️ **标签系统**: 为交易添加自定义标签，多维度管理
- 📊 **仪表盘**: 统计总收入、总支出、净余额、交易数
- 📈 **数据分析**: 支出趋势图、分类分布、标签统计
- 🔍 **高级筛选**: 按日期、分类、标签、类型筛选交易
- 🌐 **国际化**: 完整的中英文支持，语言无缝切换
- 🔐 **权限管理**: 基于 JWT Token 的认证系统
- 🎨 **现代化 UI**: 紫色渐变主题，响应式设计，完美支持移动设备

## 🛠️ 技术栈

### 前端

- **React 18** - 用户界面框架
- **React Router v6** - 路由管理
- **React Bootstrap 2** - UI 组件库 (无需自写 CSS)
- **Axios** - HTTP 客户端
- **Context API** - 全局状态管理
- **i18next + react-i18next** - 国际化支持
- **Chart.js / Recharts** - 数据可视化图表

### 后端

- **Node.js + Express** - Web 框架
- **MongoDB + Mongoose** - NoSQL 数据库
- **JWT (jsonwebtoken)** - 认证机制
- **Firebase Admin SDK** - 身份验证集成
- **bcryptjs** - 密码加密
- **CORS** - 跨域资源共享

## 📁 项目结构

详见 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

```
DailyLedger/
├── client/                  # React 前端应用
│   ├── public/              # 静态文件
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── context/         # 状态管理
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API 调用
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                  # Node.js 后端服务器
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── controllers/     # 业务逻辑
│   │   ├── middleware/      # 中间件
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # API 路由
│   │   └── index.js
│   ├── .env                 # 环境变量
│   └── package.json
│
├── PROJECT_STRUCTURE.md     # 详细项目结构说明
└── README.md                # 本文件
```

## 🚀 常用命令

### 后端

```bash
cd server
npm install               # 安装依赖
npm run dev              # 开发模式 (带热重载)
npm start                # 生产模式
```

### 前端

```bash
cd client
npm install              # 安装依赖
npm start               # 启动开发服务器 (自动打开浏览器)
npm run build           # 生产构建
```

## 📄 核心页面

| 页面     | 路由            | 功能                         |
| -------- | --------------- | ---------------------------- |
| 登录     | `/login`        | 用户身份验证                 |
| 注册     | `/register`     | 创建新账户                   |
| 仪表盘   | `/dashboard`    | 显示统计信息和最近交易       |
| 交易管理 | `/transactions` | 查看、添加、编辑、删除交易   |
| 个人资料 | `/profile`      | 编辑用户信息、修改密码、登出 |

## 🔑 API 端点概览

### 用户认证

```
POST   /api/users/register          # 注册
POST   /api/users/login             # 登录
GET    /api/users/profile           # 获取资料
PUT    /api/users/profile           # 更新资料
PUT    /api/users/change-password   # 改密码
```

### 分类管理

```
GET    /api/categories              # 获取列表
POST   /api/categories              # 创建分类
PUT    /api/categories/:id          # 编辑分类
DELETE /api/categories/:id          # 删除分类
```

### 交易管理

```
GET    /api/transactions            # 获取列表 (支持筛选、分页)
POST   /api/transactions            # 创建交易
PUT    /api/transactions/:id        # 编辑交易
DELETE /api/transactions/:id        # 删除交易
```

## 🔐 环境变量配置

### 后端 (`server/.env`)

```env
# 服务器配置
NODE_ENV=development
PORT=5000

# MongoDB 连接
MONGODB_URI=mongodb://localhost:27017/daily-ledger

# JWT 配置
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# CORS 配置
CORS_ORIGIN=http://localhost:3000
```

### 前端代理

自动代理到 `http://localhost:5000` (在 `client/package.json` 中配置)

## 📝 数据模型

### 用户 (User)

```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String ('user' | 'admin'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 分类 (Category)

```javascript
{
  _id: ObjectId,
  name: String,
  type: String ('Expenses' | 'Income'),
  description: String,
  userId: ObjectId (ref: User),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 交易 (Transaction)

```javascript
{
  _id: ObjectId,
  date: Date,
  amount: Number,
  type: String ('Expenses' | 'Income'),
  categoryId: ObjectId (ref: Category),
  description: String,
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 安全特性

- ✅ 密码使用 bcryptjs 加密存储
- ✅ JWT Token 基于身份验证
- ✅ CORS 配置限制跨域请求
- ✅ 环境变量分离敏感信息
- ✅ MongoDB 复合索引优化查询
- ✅ 受保护路由需要有效 Token

## ⚠️ 安全提示

- 不要提交 `.env` 文件到版本控制
- 修改 `JWT_SECRET` 为强密钥
- 生产环境使用 HTTPS
- 定期更新依赖包
- 不要在代码中硬编码敏感信息

## 🐛 常见问题和解决方案

### MongoDB 连接失败

```
Error: connect ECONNREFUSED
```

**解决方案:**

- 确保 MongoDB 服务正在运行
- 检查连接字符串是否正确
- 如使用 MongoDB Atlas，确保 IP 白名单配置

**启动 MongoDB:**

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 前端无法连接后端

```
CORS error / Network error
```

**解决方案:**

1. 确保后端运行在 http://localhost:5000
2. 检查 `.env` 中的 `CORS_ORIGIN` 配置
3. 查看浏览器控制台的具体错误信息
4. 重启前后端服务器

### 登录失败 / Token 过期

**解决方案:**

- 清除浏览器 LocalStorage
- 删除密码错误提示后重试
- 重新登录获取新 Token

### 交易无法保存

**解决方案:**

- 检查分类是否创建
- 验证金额和日期格式
- 查看浏览器控制台错误信息
- 确保已登录

## 🎓 学习资源

- [React 官方文档](https://react.dev)
- [Express.js 官方文档](https://expressjs.com)
- [MongoDB 文档](https://docs.mongodb.com)
- [React Bootstrap 文档](https://react-bootstrap.github.io)
- [JWT 认证指南](https://jwt.io/introduction)

## 🚀 部署到 Render

### 准备工作

1. 在 [Render](https://render.com) 注册账号
2. 将代码推送到 GitHub 仓库
3. 准备 MongoDB 数据库（MongoDB Atlas 或 Render MongoDB）

### 方法一：使用 Blueprint（推荐）

#### 1. 创建 `render.yaml` 文件（项目根目录）

```yaml
services:
  # 后端服务
  - type: web
    name: daily-ledger-api
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false # 手动设置
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 7d
      - key: CORS_ORIGIN
        value: https://daily-ledger.onrender.com

  # 前端服务
  - type: web
    name: daily-ledger
    env: static
    region: oregon
    plan: free
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/build
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

#### 2. 点击 "New" → "Blueprint" → 连接 GitHub 仓库

#### 3. 配置环境变量

- 在 Render Dashboard 中为后端服务设置 `MONGODB_URI`

### 方法二：手动部署

#### 部署后端

1. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接 GitHub 仓库
   - 配置如下：

```
Name: daily-ledger-api
Region: Oregon (US West)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

2. **设置环境变量**

在 "Environment" 标签页添加：

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-app-name.onrender.com
```

3. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成（约 3-5 分钟）
   - 记录后端 URL，例如：`https://daily-ledger-api.onrender.com`

#### 部署前端

1. **更新前端 API 配置**

在 `client/src/services/api.js` 中更新 baseURL：

```javascript
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://daily-ledger-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

2. **创建 Static Site**
   - 点击 "New +" → "Static Site"
   - 连接 GitHub 仓库
   - 配置如下：

```
Name: daily-ledger
Branch: main
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: build
```

3. **设置环境变量**（可选）

```env
REACT_APP_API_URL=https://daily-ledger-api.onrender.com/api
```

4. **配置重定向规则**

确保 `client/public/_redirects` 文件存在：

```
/*    /index.html   200
```

或在 `client/build/_redirects` 中（构建时自动复制）。

5. **部署**
   - 点击 "Create Static Site"
   - 等待部署完成

### 配置 MongoDB Atlas

如果还没有 MongoDB 数据库：

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群（512MB）
3. 创建数据库用户
4. 配置网络访问：
   - 点击 "Network Access"
   - 添加 IP：`0.0.0.0/0`（允许所有 IP，适合 Render）
5. 获取连接字符串：
   - 点击 "Connect" → "Connect your application"
   - 复制连接字符串
   - 替换 `<password>` 和 `<dbname>`

```
mongodb+srv://username:password@cluster.mongodb.net/daily-ledger?retryWrites=true&w=majority
```

6. 在 Render 后端服务的环境变量中设置 `MONGODB_URI`

### 自动部署

Render 支持自动部署：

- 推送到 GitHub 的 `main` 分支会自动触发部署
- 在 Render Dashboard 查看部署日志
- 可以在 "Settings" 中配置部署分支

### 重要提示

⚠️ **Render 免费计划限制**：

- 服务在 15 分钟不活动后会休眠
- 首次访问可能需要 30-60 秒启动
- 每月 750 小时免费（约 31 天）
- 建议使用 [UptimeRobot](https://uptimerobot.com) 保持服务活跃

⚠️ **CORS 配置**：

- 确保后端 `CORS_ORIGIN` 设置为前端完整 URL
- 如果有自定义域名，记得更新

⚠️ **环境变量**：

- 不要在代码中硬编码 API URL
- 使用 `process.env.REACT_APP_API_URL`

### 部署后验证

1. 访问前端 URL
2. 测试注册/登录功能
3. 创建交易测试 CRUD 操作
4. 检查浏览器控制台是否有错误
5. 查看 Render 日志排查问题

### 故障排除

**前端无法连接后端**：

- 检查 `CORS_ORIGIN` 是否正确
- 验证后端 URL 是否可访问
- 查看浏览器 Network 标签

**后端启动失败**：

- 查看 Render 日志
- 验证 MongoDB 连接字符串
- 确保所有环境变量已设置

**服务休眠**：

- 使用付费计划避免休眠
- 或使用 UptimeRobot 每 5 分钟 ping 一次

### 其他部署选项

- **Vercel** (前端): 零配置部署，但需要配置 API 路由
- **Netlify** (前端): 类似 Render Static Site
- **Railway** (后端): 类似 Render，但资源限制不同
- **Heroku** (全栈): 需要信用卡验证，即使免费计划

## 🎯 未来规划

- [x] 数据可视化图表 ✅
- [x] 多语言支持（中英文）✅
- [x] 标签系统 ✅
- [x] 高级筛选功能 ✅
- [ ] 定期交易功能
- [ ] 数据导出 (CSV/PDF)
- [ ] 预算管理和提醒
- [ ] 黑暗模式切换
- [ ] PWA 支持（离线访问）
- [ ] 移动 App (React Native)
- [ ] 集成支付功能
- [ ] OCR 账单扫描
- [ ] AI 智能支出分析

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request!

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/Amazing-Feature`)
3. Commit 更改 (`git commit -m 'Add Amazing Feature'`)
4. Push 到分支 (`git push origin feature/Amazing-Feature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 📧 联系方式

如有问题或建议，欢迎提交 GitHub Issue。

## 📚 相关文档

- 📖 [项目结构详解](./PROJECT_STRUCTURE.md) - 完整的项目架构说明
- 🚀 [Render 快速部署](./RENDER_QUICKSTART.md) - 一键部署到 Render
- 📋 [详细部署指南](./RENDER_DEPLOYMENT.md) - 完整的 Render 部署文档
- ✅ [部署检查清单](./DEPLOYMENT_CHECKLIST.md) - 确保部署万无一失
- 📝 [UI 改进日志](./CHANGELOG_UI_IMPROVEMENTS.md) - UI/UX 更新记录
- ⚙️ [环境配置说明](./ENV_CONFIG.md) - 环境变量配置详解

---

**最后更新**: 2025 年 12 月 10 日  
**版本**: 2.0.0 (支持国际化、现代化 UI、标签系统、Render 部署)

祝你使用愉快! 💚
