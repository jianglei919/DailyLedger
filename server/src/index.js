/**
 * Daily Ledger 后端服务器入口文件
 * 负责启动 Express 服务器，配置中间件，连接数据库，注册路由
 */

import express from 'express';
import cors from 'cors';
import './config/env.js';  // 加载环境变量配置
import { connectMongoDB } from './config/mongodb.js';

// 导入路由模块
import userRoutes from './routes/userRoutes.js';        // 用户相关路由
import transactionRoutes from './routes/transactionRoutes.js';  // 交易相关路由
import categoryRoutes from './routes/categoryRoutes.js';     // 分类相关路由
import labelRoutes from './routes/labelRoutes.js';        // 标签相关路由

// 创建 Express 应用实例
const app = express();
const PORT = process.env.PORT || 5000;  // 服务器端口，默认 5000

// 配置中间件
// CORS 配置 - 允许跨域请求
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',  // 允许的前端域名
  credentials: true,  // 允许携带凭证（cookies）
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // 允许的 HTTP 方法
  allowedHeaders: ['Content-Type', 'Authorization']  // 允许的请求头
};
app.use(cors(corsOptions));  // 应用 CORS 中间件
app.use(express.json());  // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true }));  // 解析 URL 编码的请求体

// 初始化数据库连接
try {
  await connectMongoDB();  // 连接到 MongoDB
  console.log('✅ Application connected to MongoDB');
} catch (error) {
  console.error('❌ Failed to initialize MongoDB:', error.message);
  process.exit(1);  // 数据库连接失败则退出进程
}

// API 路由配置
// 健康检查端点 - 用于检测服务是否正常运行
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Daily Ledger API is running' });
});

// 注册各模块的路由
app.use('/api/users', userRoutes);         // 用户管理：注册、登录、个人资料
app.use('/api/transactions', transactionRoutes);  // 交易管理：增删改查
app.use('/api/categories', categoryRoutes);    // 分类管理：增删改查
app.use('/api/labels', labelRoutes);        // 标签管理：增删改查

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!' 
  });
});

// 404 处理器 - 捕获所有未匹配的路由
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Daily Ledger API server is running on port ${PORT}`);
});
