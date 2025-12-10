/**
 * 用户路由 (User Routes)
 * 处理用户认证和个人资料相关的路由
 */

import express from 'express';
import { 
  registerUser,     // 用户注册
  loginUser,       // 用户登录
  getUserProfile,    // 获取个人资料
  updateUserProfile,   // 更新个人资料
  changePassword     // 修改密码
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';  // JWT 认证中间件

const router = express.Router();

// POST /api/users/register - 注册新用户（公开访问）
router.post('/register', registerUser);

// POST /api/users/login - 用户登录（公开访问）
router.post('/login', loginUser);

// GET /api/users/profile - 获取当前用户资料（需要认证）
router.get('/profile', protect, getUserProfile);

// PUT /api/users/profile - 更新当前用户资料（需要认证）
router.put('/profile', protect, updateUserProfile);

// PUT /api/users/change-password - 修改当前用户密码（需要认证）
router.put('/change-password', protect, changePassword);

export default router;
