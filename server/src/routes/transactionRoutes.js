/**
 * 交易路由 (Transaction Routes)
 * 处理收入和支出交易相关的路由
 * 所有路由都需要认证
 */

import express from 'express';
import {
  getTransactions,   // 获取交易列表（支持筛选和分页）
  createTransaction,  // 创建新交易
  updateTransaction,  // 更新交易
  deleteTransaction  // 删除交易
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';  // JWT 认证中间件

const router = express.Router();

// 全局中间件：所有交易路由都需要认证
router.use(protect);

// /api/transactions
router.route('/')
  .get(getTransactions)   // GET - 获取交易列表
  .post(createTransaction); // POST - 创建新交易

// /api/transactions/:id
router.route('/:id')
  .put(updateTransaction)  // PUT - 更新指定交易
  .delete(deleteTransaction); // DELETE - 删除指定交易

export default router;
