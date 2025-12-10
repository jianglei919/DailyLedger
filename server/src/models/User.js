/**
 * 用户模型
 * 定义用户数据结构和业务逻辑
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// 用户模型 Schema 定义
const userSchema = new mongoose.Schema(
  {
    // 用户名
    username: {
      type: String,
      required: [true, 'Username is required'],  // 必填字段
      unique: true,  // 唯一索引
      trim: true,   // 自动去除首尾空格
      minlength: 3  // 最小长度 3 个字符
    },
    // 邮箱
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,      // 唯一索引
      lowercase: true,    // 自动转换为小写
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']  // 邮箱格式验证
    },
    // 密码
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,    // 最小长度 6 个字符
      select: false    // 默认查询时不返回密码字段（安全考虑）
    },
    // 用户角色
    role: {
      type: String,
      enum: ['user', 'admin'],  // 只允许这两个值
      default: 'user'       // 默认为普通用户
    },
    // 账户是否激活
    isActive: {
      type: Boolean,
      default: true  // 默认激活
    }
  },
  {
    timestamps: true  // 自动添加 createdAt 和 updatedAt 字段
  }
);

/**
 * Pre-save 钩子 - 保存前自动加密密码
 * 只有当密码字段被修改时才执行加密
 */
userSchema.pre('save', async function (next) {
  // 如果密码没有被修改，直接跳过
  if (!this.isModified('password')) return next();
  
  try {
    // 生成盐值（salt），复杂度为 10
    const salt = await bcrypt.genSalt(10);
    // 使用 bcrypt 加密密码
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * 实例方法 - 比较密码
 * @param {String} candidatePassword - 用户输入的密码
 * @returns {Boolean} 密码是否匹配
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * 实例方法 - 转换为 JSON 格式
 * 自动排除密码字段，防止密码泄露
 * @returns {Object} 不包含密码的用户对象
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;  // 删除密码字段
  return userObject;
};

// 导出用户模型
export default mongoose.model('User', userSchema);
