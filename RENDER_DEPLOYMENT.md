# Render 部署指南

本文档提供了将 Spend Harbor 应用部署到 Render 的详细步骤。

## 📋 目录

1. [准备工作](#准备工作)
2. [方法一：使用 Blueprint（推荐）](#方法一使用-blueprint推荐)
3. [方法二：手动部署](#方法二手动部署)
4. [配置 MongoDB Atlas](#配置-mongodb-atlas)
5. [环境变量配置](#环境变量配置)
6. [验证部署](#验证部署)
7. [常见问题](#常见问题)

## 准备工作

### 1. 注册 Render 账户

访问 [Render.com](https://render.com) 并注册免费账户。

### 2. 准备 GitHub 仓库

确保代码已推送到 GitHub：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/DailyLedger.git
git push -u origin main
```

### 3. 准备 MongoDB 数据库

- 选项 A：使用 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 免费层 (512MB)
- 选项 B：使用 Render 的 MongoDB 服务

## 方法一：使用 Blueprint（推荐）

使用 `render.yaml` 文件可以一键部署前后端服务。

### 步骤

1. **确认 render.yaml 文件存在**

   项目根目录应该有 `render.yaml` 文件。

2. **在 Render 创建 Blueprint**
   - 登录 Render Dashboard
   - 点击 "New +" → "Blueprint"
   - 连接你的 GitHub 仓库
   - 选择包含 `render.yaml` 的仓库
   - 点击 "Apply"

3. **配置环境变量**

   部署后，在 Render Dashboard 中：
   - 找到 `daily-ledger-api` 服务
   - 进入 "Environment" 标签
   - 手动设置 `MONGODB_URI`：
     ```
     mongodb+srv://username:password@cluster.mongodb.net/daily-ledger?retryWrites=true&w=majority
     ```

4. **等待部署完成**
   - 后端服务通常需要 3-5 分钟
   - 前端服务通常需要 2-4 分钟
   - 可以在 "Logs" 标签查看部署进度

5. **获取 URLs**
   - 后端 URL: `https://daily-ledger-api.onrender.com`
   - 前端 URL: `https://daily-ledger.onrender.com`

## 方法二：手动部署

如果不使用 Blueprint，可以手动创建服务。

### 部署后端 API

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
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/daily-ledger
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

⚠️ **重要**：`JWT_SECRET` 必须至少 32 个字符，建议使用随机生成的强密钥。

3. **保存并部署**

### 部署前端

1. **更新 API 配置**

确保 `client/src/services/api.js` 使用环境变量：

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
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

3. **设置环境变量**

```env
REACT_APP_API_URL=https://daily-ledger-api.onrender.com/api
```

4. **确认重定向规则**

确保 `client/public/_redirects` 文件存在：

```
/*    /index.html   200
```

5. **保存并部署**

## 配置 MongoDB Atlas

### 创建免费集群

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 注册并创建免费集群（M0，512MB）
3. 选择区域（建议选择离 Render Oregon 最近的区域）

### 配置数据库访问

1. **创建数据库用户**
   - 进入 "Database Access"
   - 点击 "Add New Database User"
   - 创建用户名和密码（记住这些凭证）

2. **配置网络访问**
   - 进入 "Network Access"
   - 点击 "Add IP Address"
   - 选择 "Allow Access from Anywhere" (0.0.0.0/0)
   - 这是必需的，因为 Render 使用动态 IP

### 获取连接字符串

1. 点击 "Connect" → "Connect your application"
2. 选择 Driver: "Node.js"，Version: "4.1 or later"
3. 复制连接字符串：

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

4. 替换 `<username>` 和 `<password>`
5. 在连接字符串中添加数据库名称：

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/daily-ledger?retryWrites=true&w=majority
```

6. 将此连接字符串设置为 Render 后端的 `MONGODB_URI` 环境变量

## 环境变量配置

### 后端必需的环境变量

| 变量名        | 说明                 | 示例                            |
| ------------- | -------------------- | ------------------------------- |
| `NODE_ENV`    | 运行环境             | `production`                    |
| `PORT`        | 服务器端口           | `10000`                         |
| `MONGODB_URI` | MongoDB 连接字符串   | `mongodb+srv://...`             |
| `JWT_SECRET`  | JWT 密钥（32+ 字符） | 随机生成的强密钥                |
| `JWT_EXPIRE`  | Token 有效期         | `7d`                            |
| `CORS_ORIGIN` | 允许的前端域名       | `https://your-app.onrender.com` |

### 前端可选的环境变量

| 变量名              | 说明          | 示例                           |
| ------------------- | ------------- | ------------------------------ |
| `REACT_APP_API_URL` | 后端 API 地址 | `https://api.onrender.com/api` |

## 验证部署

### 1. 检查后端健康状态

访问：`https://daily-ledger-api.onrender.com/api/health`

应该返回：

```json
{
  "status": "ok",
  "message": "Spend Harbor API is running"
}
```

### 2. 测试前端

1. 访问前端 URL
2. 尝试注册新用户
3. 登录
4. 创建交易
5. 测试其他 CRUD 操作

### 3. 检查日志

如果出现问题，在 Render Dashboard 中查看：

- 后端 "Logs" 标签
- 前端 "Logs" 标签
- 浏览器控制台

## 常见问题

### Q1: 服务启动很慢怎么办？

**A**: Render 免费计划的服务在 15 分钟不活动后会休眠。首次访问需要 30-60 秒启动。

**解决方案**：

- 升级到付费计划
- 使用 [UptimeRobot](https://uptimerobot.com) 每 5 分钟 ping 一次保持服务活跃

### Q2: CORS 错误

**A**: 检查以下几点：

1. 后端 `CORS_ORIGIN` 设置为前端完整 URL（包括 https://）
2. 前端 API 请求使用正确的后端 URL
3. 查看浏览器控制台具体错误信息

### Q3: MongoDB 连接失败

**A**: 常见原因：

1. 连接字符串格式错误
2. 用户名/密码包含特殊字符（需要 URL 编码）
3. IP 白名单未设置为 0.0.0.0/0
4. 数据库名称错误

### Q4: 前端显示空白页

**A**: 检查：

1. 浏览器控制台是否有错误
2. `_redirects` 文件是否正确配置
3. 前端是否能连接到后端 API
4. 构建命令是否成功

### Q5: Token 验证失败

**A**: 确保：

1. `JWT_SECRET` 在后端正确设置
2. `JWT_SECRET` 长度至少 32 字符
3. 前端正确存储和发送 token
4. Token 未过期（默认 7 天）

### Q6: 环境变量不生效

**A**:

1. 在 Render Dashboard 中设置环境变量后需要手动触发重新部署
2. React 环境变量必须以 `REACT_APP_` 开头
3. 修改环境变量后需要清除缓存重新构建

## 自动部署

Render 支持自动部署：

1. **GitHub 集成**
   - 推送到 `main` 分支自动触发部署
   - 可以在 Settings 中配置自动部署

2. **手动触发**
   - 在 Render Dashboard 点击 "Manual Deploy" → "Deploy latest commit"

3. **部署通知**
   - 可以配置 Slack/Discord/Email 通知
   - 在 Settings → Notifications 中设置

## 性能优化

### 1. 避免冷启动

免费服务会休眠，可以：

- 使用 UptimeRobot 定期 ping
- 升级到付费计划（$7/月起）

### 2. 使用 CDN

Render 自动为静态网站提供 CDN，无需额外配置。

### 3. 数据库索引

确保 MongoDB 有适当的索引：

```javascript
// 在 models 中添加索引
schema.index({ userId: 1, date: -1 });
schema.index({ userId: 1, categoryId: 1 });
```

### 4. 启用 Gzip

Express 中启用压缩：

```javascript
import compression from "compression";
app.use(compression());
```

## 监控和维护

### 日志查看

- **实时日志**：在 Render Dashboard 的 Logs 标签
- **历史日志**：可以下载或集成日志服务

### 数据库备份

**MongoDB Atlas**：

- 免费层自动备份（保留 2 天）
- 可以手动导出数据

### 更新依赖

定期更新依赖包：

```bash
cd server && npm update
cd client && npm update
```

推送后自动触发重新部署。

## 费用说明

### Render 免费计划限制

- **Web Service**: 750 小时/月，15 分钟不活动后休眠
- **Static Site**: 100GB 带宽/月
- **构建时间**: 每月 500 分钟
- **并发构建**: 1 个

### 升级选项

如果需要更好的性能：

- **Starter**: $7/月（每个服务）
  - 无休眠
  - 更多资源
  - 更快启动

## 安全建议

1. ✅ 使用强 JWT_SECRET（32+ 字符）
2. ✅ 启用 HTTPS（Render 自动提供）
3. ✅ 定期更新依赖包
4. ✅ 不要在代码中硬编码敏感信息
5. ✅ MongoDB 使用强密码
6. ✅ 定期备份数据库
7. ✅ 监控服务日志

## 额外资源

- [Render 官方文档](https://render.com/docs)
- [MongoDB Atlas 文档](https://docs.atlas.mongodb.com/)
- [Express.js 生产最佳实践](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React 部署文档](https://create-react-app.dev/docs/deployment/)

## 获取帮助

遇到问题？

1. 查看 Render Dashboard 日志
2. 检查浏览器控制台
3. 查看本项目的 GitHub Issues
4. 访问 Render 社区论坛

---

**祝部署顺利！** 🚀

如有问题，请提交 Issue 到 GitHub 仓库。
