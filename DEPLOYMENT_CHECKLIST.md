# Render 部署快速检查清单

使用本清单确保部署配置正确。

## 📋 部署前检查

### 代码准备

- [ ] 代码已推送到 GitHub
- [ ] `render.yaml` 文件存在于项目根目录
- [ ] `client/public/_redirects` 文件存在且内容正确
- [ ] `server/src/index.js` 包含 `/api/health` 健康检查端点
- [ ] `.gitignore` 文件正确配置（不包含 `.env` 文件）

### 数据库准备

- [ ] MongoDB Atlas 账户已创建
- [ ] 免费集群已创建（M0, 512MB）
- [ ] 数据库用户已创建
- [ ] 网络访问设置为 `0.0.0.0/0`
- [ ] 连接字符串已获取并测试

### Render 账户

- [ ] Render 账户已注册
- [ ] GitHub 账户已连接

## 🚀 部署步骤

### 使用 Blueprint（推荐）

- [ ] 在 Render 点击 "New +" → "Blueprint"
- [ ] 选择 GitHub 仓库
- [ ] Render 自动检测 `render.yaml`
- [ ] 点击 "Apply"
- [ ] 等待服务创建完成

### 配置后端环境变量

在 `daily-ledger-api` 服务中设置：

- [ ] `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/daily-ledger?retryWrites=true&w=majority`
  - 替换 username 和 password
  - 确保包含数据库名称 `daily-ledger`
- [ ] `JWT_SECRET` 已自动生成（或手动设置 32+ 字符）
- [ ] `JWT_EXPIRE` = `7d`
- [ ] `CORS_ORIGIN` 已自动设置为前端 URL
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`

### 配置前端环境变量（可选）

在 `daily-ledger-client` 服务中：

- [ ] `REACT_APP_API_URL` 已自动设置为后端 URL + `/api`

### 触发部署

- [ ] 保存环境变量
- [ ] 点击 "Manual Deploy" → "Deploy latest commit"（如果需要）
- [ ] 等待部署完成（3-5 分钟）

## ✅ 部署后验证

### 后端验证

- [ ] 访问 `https://daily-ledger-api.onrender.com/api/health`
- [ ] 返回 `{"status": "ok", "message": "Daily Ledger API is running"}`
- [ ] 检查 Render Dashboard 日志，无错误信息
- [ ] 数据库连接成功（日志显示 "✅ Application connected to MongoDB"）

### 前端验证

- [ ] 访问 `https://daily-ledger-client.onrender.com`
- [ ] 页面正常加载，无空白
- [ ] 语言切换功能正常
- [ ] 能够注册新用户
- [ ] 能够登录
- [ ] Dashboard 显示正常

### 功能测试

- [ ] 创建新分类
- [ ] 创建新标签
- [ ] 添加交易（收入和支出）
- [ ] 编辑交易
- [ ] 删除交易
- [ ] 筛选功能正常
- [ ] 统计页面显示图表
- [ ] 个人资料页面正常
- [ ] 修改密码功能正常
- [ ] 登出功能正常

### 浏览器检查

- [ ] 打开浏览器开发者工具
- [ ] Console 无错误信息
- [ ] Network 标签显示 API 请求成功（状态码 200/201）
- [ ] 无 CORS 错误

## 🐛 常见问题排查

### 如果后端无法启动：

- [ ] 检查 Render Dashboard 日志
- [ ] 验证 `MONGODB_URI` 格式正确
- [ ] 确认 MongoDB Atlas IP 白名单包含 `0.0.0.0/0`
- [ ] 检查数据库用户名密码是否正确
- [ ] 验证所有必需的环境变量都已设置

### 如果前端显示空白页：

- [ ] 检查浏览器控制台错误
- [ ] 验证 `_redirects` 文件在 build 目录
- [ ] 检查 API URL 是否正确
- [ ] 确认后端服务正在运行
- [ ] 清除浏览器缓存重试

### 如果出现 CORS 错误：

- [ ] 验证 `CORS_ORIGIN` 设置为前端完整 URL（包括 https://）
- [ ] 不要有尾随斜杠
- [ ] 重启后端服务使配置生效
- [ ] 检查浏览器控制台的具体 CORS 错误信息

### 如果 API 请求失败：

- [ ] 检查前端 `REACT_APP_API_URL` 是否正确
- [ ] 验证后端健康检查端点可访问
- [ ] 查看浏览器 Network 标签的请求详情
- [ ] 检查后端日志是否有错误

### 如果登录/注册失败：

- [ ] 检查 MongoDB 连接
- [ ] 验证 `JWT_SECRET` 已设置且长度足够
- [ ] 查看后端日志的具体错误
- [ ] 确认请求到达后端（检查 Network 标签）

## 🔄 更新部署

### 代码更新后：

- [ ] 推送代码到 GitHub main 分支
- [ ] Render 自动检测更新并重新部署
- [ ] 在 Dashboard 查看部署进度
- [ ] 部署完成后重新测试功能

### 环境变量更新后：

- [ ] 在 Render Dashboard 修改环境变量
- [ ] 点击 "Manual Deploy" 触发重新部署
- [ ] 或者等待下次代码推送时自动部署

## 📊 监控

### 定期检查：

- [ ] Render Dashboard 服务状态
- [ ] 查看错误日志
- [ ] 监控 MongoDB Atlas 使用量
- [ ] 检查 Render 免费额度使用情况

### 保持服务活跃（可选）：

- [ ] 注册 [UptimeRobot](https://uptimerobot.com)
- [ ] 添加监控：`https://daily-ledger-api.onrender.com/api/health`
- [ ] 设置每 5 分钟检查一次
- [ ] 配置故障通知（Email/Slack）

## 🎯 性能优化（可选）

- [ ] 添加 MongoDB 索引优化查询
- [ ] 启用 Express compression
- [ ] 考虑升级到 Render 付费计划（避免休眠）
- [ ] 使用 Redis 缓存（如需要）

## 🔒 安全检查

- [ ] `JWT_SECRET` 是强密钥（32+ 字符）
- [ ] MongoDB 使用强密码
- [ ] 未在代码中硬编码敏感信息
- [ ] `.env` 文件未提交到 Git
- [ ] HTTPS 已启用（Render 自动提供）
- [ ] 定期更新依赖包

## 📝 文档

- [ ] 更新 README.md 包含部署信息
- [ ] 记录实际的部署 URL
- [ ] 保存 MongoDB 连接字符串（安全存储）
- [ ] 记录重要的环境变量设置

## ✨ 完成！

- [ ] 所有检查项已完成
- [ ] 应用正常运行
- [ ] 已分享给用户/团队

---

**部署时间**: ******\_\_\_******  
**后端 URL**: ******\_\_\_******  
**前端 URL**: ******\_\_\_******  
**MongoDB Cluster**: ******\_\_\_******

**备注**:

---

---

---
