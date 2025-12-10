/**
 * 标签模型
 * 存储用户自定义的交易标签，用于多维度管理交易
 * 例如：工作、生活、旅游等
 */

import mongoose from 'mongoose';

// 标签 Schema 定义
const labelSchema = new mongoose.Schema(
  {
    // 标签名称
    name: {
      type: String,
      required: [true, 'Label name is required'],
      trim: true  // 自动去除首尾空格
    },
    // 标签颜色（用于 UI 显示）
    color: {
      type: String,
      default: '#94a3b8'  // 默认灰色
    },
    // 是否激活（软删除）
    isActive: {
      type: Boolean,
      default: true
    },
    // 所属用户 ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',   // 关联到 User 模型
      required: true,
      index: true    // 创建索引以提高查询性能
    }
  },
  {
    timestamps: true  // 自动添加 createdAt 和 updatedAt 字段
  }
);

/**
 * 唯一索引 - 同一用户下，标签名称不能重复
 * 例如：用户 A 不能有两个名为“工作”的标签
 */
labelSchema.index({ userId: 1, name: 1 }, { unique: true });

// 导出标签模型
const Label = mongoose.model('Label', labelSchema);

export default Label;
