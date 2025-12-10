/**
 * 认证中间件
 * 用于验证 JWT Token 和用户权限
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * 保护路由中间件 - 验证 JWT Token
 * 使用方法：router.get('/protected', protect, handler)
 * 验证通过后，会将用户信息注入到 req.user
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 从请求头中提取 Token
    // 格式：Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 检查 Token 是否存在
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 验证 Token 的有效性
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // 根据 Token 中的用户 ID 查找用户
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 将用户信息附加到请求对象上，供后续中间件和控制器使用
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Not authorized' });
  }
};

/**
 * 管理员权限中间件 - 验证用户是否为管理员
 * 必须在 protect 中间件之后使用
 * 使用方法：router.delete('/admin-only', protect, adminOnly, handler)
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();  // 用户是管理员，继续执行
  } else {
    res.status(403).json({ error: 'Admin access required' });  // 403 Forbidden
  }
};
