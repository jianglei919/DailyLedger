/**
 * 分类路由 (Category Routes)
 * 处理收入/支出分类相关的路由
 * 所有路由都需要认证
 */

import express from 'express';
import {
  getCategories,   // 获取分类列表（可按类型筛选）
  createCategory,  // 创建新分类
  updateCategory,  // 更新分类
  deleteCategory   // 删除分类
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';  // JWT 认证中间件

const router = express.Router();

// 全局中间件：所有分类路由都需要认证
router.use(protect);

// /api/categories
router.route('/')
  .get(getCategories)   // GET - 获取分类列表
  .post(createCategory);  // POST - 创建新分类

// /api/categories/:id
router.route('/:id')
  .put(updateCategory)   // PUT - 更新指定分类
  .delete(deleteCategory); // DELETE - 删除指定分类

export default router;
