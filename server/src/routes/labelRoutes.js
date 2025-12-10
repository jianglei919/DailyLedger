/**
 * 标签路由 (Label Routes)
 * 处理交易标签相关的路由
 * 所有路由都需要认证
 */

import express from 'express';
import { 
  getLabels,    // 获取标签列表
  createLabel,  // 创建新标签
  updateLabel,  // 更新标签
  deleteLabel   // 删除标签
} from '../controllers/labelController.js';
import { protect } from '../middleware/auth.js';  // JWT 认证中间件

const router = express.Router();

// 全局中间件：所有标签路由都需要认证
router.use(protect);

// /api/labels
router.route('/')
  .get(getLabels)    // GET - 获取标签列表
  .post(createLabel);  // POST - 创建新标签

// /api/labels/:id
router.route('/:id')
  .put(updateLabel)   // PUT - 更新指定标签
  .delete(deleteLabel); // DELETE - 删除指定标签

export default router;
