/**
 * 分类模型
 * 存储用户自定义的收入/支出分类
 */

import mongoose from 'mongoose';

// 分类 Schema 定义
const categorySchema = new mongoose.Schema(
  {
    // 分类名称
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true  // 自动去除首尾空格
    },
    // 分类类型：支出或收入
    type: {
      type: String,
      enum: ['Expenses', 'Income'],  // 只允许这两个值
      required: [true, 'Category type is required']
    },
    // 分类描述
    description: {
      type: String,
      trim: true
    },
    // 所属用户 ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',   // 关联到 User 模型
      required: true,
      index: true    // 创建索引以提高查询性能
    },
    // 是否激活（软删除）
    isActive: {
      type: Boolean,
      default: true
    },
    // 分类颜色（用于 UI 显示）
    color: {
      type: String,
      default: '#007bff'  // 默认蓝色
    },
    // 分类图标（emoji 或字符）
    icon: {
      type: String,
      default: '📁'  // 默认文件夹图标
    }
  },
  {
    timestamps: true  // 自动添加 createdAt 和 updatedAt 字段
  }
);

/**
 * 复合索引 - 优化按用户和类型查询
 */
categorySchema.index({ userId: 1, type: 1 });

/**
 * 唯一索引 - 同一用户的同一类型下，分类名称不能重复
 * 例如：用户 A 的支出分类中不能有两个“餐饮”
 */
categorySchema.index({ userId: 1, type: 1, name: 1 }, { unique: true });

// 导出分类模型
const Category = mongoose.model('Category', categorySchema);

export default Category;
