# 🚀 Render 部署快速指南

## 一键部署（推荐）

### 1. 准备工作

```bash
# 确保代码在 GitHub
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. 部署步骤

1. **登录 Render**
   - 访问 [render.com](https://render.com)
   - 使用 GitHub 账号登录

2. **使用 Blueprint**
   - 点击 "New +" → "Blueprint"
   - 选择 GitHub 仓库：`DailyLedger`
   - Render 自动检测 `render.yaml`
   - 点击 "Apply"

3. **配置 MongoDB**
   - 在 `daily-ledger-api` 服务中
   - 进入 "Environment" 标签
   - 添加环境变量：
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/daily-ledger?retryWrites=true&w=majority
     ```

4. **等待部署**
   - 后端：3-5 分钟
   - 前端：2-4 分钟

### 3. 获取 URLs

部署完成后，记录以下 URLs：

- **后端 API**: `https://daily-ledger-api.onrender.com`
- **前端网站**: `https://daily-ledger.onrender.com`

### 4. 验证

访问健康检查：

```
https://daily-ledger-api.onrender.com/api/health
```

应该返回：

```json
{
  "status": "ok",
  "message": "Spend Harbor API is running"
}
```

## MongoDB Atlas 设置

如果还没有 MongoDB：

1. 访问 [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群（M0, 512MB）
3. 创建数据库用户
4. 网络访问设置为 `0.0.0.0/0`
5. 获取连接字符串

## 环境变量

### 后端必需变量

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=自动生成或手动设置
JWT_EXPIRE=7d
CORS_ORIGIN=自动从前端服务获取
```

### 前端变量（可选）

```env
REACT_APP_API_URL=自动从后端服务获取
```

## 重要提示

⚠️ **免费计划限制**

- 服务 15 分钟不活动后休眠
- 首次访问需要 30-60 秒启动
- 每月 750 小时免费（约 31 天）

💡 **解决休眠**

- 升级到 Starter 计划（$7/月）
- 或使用 UptimeRobot 每 5 分钟 ping

✅ **最佳实践**

- 推送到 main 分支自动部署
- 在 Dashboard 查看日志
- 定期检查服务状态

## 文档链接

- 📖 [完整部署指南](./RENDER_DEPLOYMENT.md)
- ✅ [部署检查清单](./DEPLOYMENT_CHECKLIST.md)
- 📁 [项目结构说明](./PROJECT_STRUCTURE.md)

## 常见问题

**Q: CORS 错误怎么办？**
A: 检查 `CORS_ORIGIN` 是否设置为前端完整 URL（包括 https://）

**Q: MongoDB 连接失败？**
A: 确认 IP 白名单设置为 `0.0.0.0/0`，连接字符串格式正确

**Q: 前端空白页？**
A: 检查浏览器控制台错误，确认 `_redirects` 文件存在

## 需要帮助？

- 查看 [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) 详细文档
- 检查 Render Dashboard 日志
- 提交 GitHub Issue

---

**祝部署顺利！** 🎉
