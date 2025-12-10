/**
 * 交易模型
 * 存储用户的收入和支出记录
 */

import mongoose from 'mongoose';

// 交易 Schema 定义
const transactionSchema = new mongoose.Schema(
  {
    // 交易日期
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now  // 默认为当前日期
    },
    // 交易金额
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']  // 金额必须为正数
    },
    // 交易类型：支出或收入
    type: {
      type: String,
      enum: ['Expenses', 'Income'],  // 只允许这两个值
      required: [true, 'Type is required']
    },
    // 关联的分类 ID
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',  // 关联到 Category 模型
      required: true
    },
    // 交易描述
    description: {
      type: String,
      trim: true  // 自动去除首尾空格
    },
    // 关联的标签 ID（可选）
    labelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Label'  // 关联到 Label 模型
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
 * 复合索引 - 优化常用查询性能
 * 1表示升序，-1表示降序
 */
// 按用户和日期查询
transactionSchema.index({ userId: 1, date: -1 });
// 按用户、类型和日期查询
transactionSchema.index({ userId: 1, type: 1, date: -1 });
// 按用户、分类和日期查询
transactionSchema.index({ userId: 1, categoryId: 1, date: -1 });
// 按用户、标签和日期查询
transactionSchema.index({ userId: 1, labelId: 1, date: -1 });

// 导出交易模型
export default mongoose.model('Transaction', transactionSchema);
