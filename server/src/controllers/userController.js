/**
 * 用户控制器
 * 处理用户注册、登录、个人资料管理、密码修改等业务逻辑
 */

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * 生成 JWT Token
 * @param {String} userId - 用户 ID
 * @returns {String} JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },  // Token 负载：用户 ID
    process.env.JWT_SECRET || 'your_jwt_secret_key',  // 密钥
    { expiresIn: process.env.JWT_EXPIRE || '7d' }  // 过期时间：默认 7 天
  );
};

/**
 * 用户注册
 * POST /api/users/register
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 验证密码匹配
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // 检查用户是否已存在（邮箱或用户名）
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already in use' });
    }

    // 创建新用户（密码会在 User 模型的 pre-save 钩子中自动加密）
    const user = await User.create({ username, email, password });

    // 返回用户信息和 Token
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)  // 生成并返回 JWT Token
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 用户登录
 * POST /api/users/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 查找用户（包含 password 字段，因为默认不返回）
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 验证密码（使用 User 模型中定义的 comparePassword 方法）
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 登录成功，返回用户信息和 Token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 获取用户个人资料
 * GET /api/users/profile
 * 需要认证
 */
export const getUserProfile = async (req, res) => {
  try {
    // req.user 由 protect 中间件注入，包含当前登录用户信息
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 返回用户信息（toJSON 方法会自动排除密码等敏感字段）
    res.json(user.toJSON());
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新用户个人资料
 * PUT /api/users/profile
 * 需要认证
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { username } = req.body;

    // 更新用户信息
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { 
        new: true,        // 返回更新后的文档
        runValidators: true  // 运行模型验证器
      }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 修改密码
 * PUT /api/users/change-password
 * 需要认证
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 验证必填字段
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 验证新密码匹配
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    // 获取用户信息（包含密码字段）
    const user = await User.findById(req.user._id).select('+password');

    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // 更新密码（会触发 pre-save 钩子自动加密）
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
