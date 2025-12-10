/**
 * 交易控制器
 * 处理交易的增删改查业务逻辑
 */

import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import Label from '../models/Label.js';

/**
 * 获取交易列表
 * GET /api/transactions
 * 需要认证
 * 支持查询参数：
 * - type: 交易类型 (Expenses/Income)
 * - categoryId: 分类 ID
 * - labelId: 标签 ID
 * - startDate: 开始日期
 * - endDate: 结束日期
 * - page: 页码（默认 1）
 * - limit: 每页数量（默认 50）
 */
export const getTransactions = async (req, res) => {
  try {
    // 提取查询参数
    const { type, categoryId, labelId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const userId = req.user._id;  // 当前登录用户 ID

    // 构建查询条件
    const filter = { userId };  // 只查询当前用户的交易
    
    // 按交易类型筛选
    if (type && ['Expenses', 'Income'].includes(type)) {
      filter.type = type;
    }
    
    // 按分类筛选
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    // 按标签筛选
    if (labelId) {
      filter.labelId = labelId;
    }
    
    // 按日期范围筛选
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);  // 大于等于开始日期
      if (endDate) filter.date.$lte = new Date(endDate);    // 小于等于结束日期
    }

    // 计算分页偏移量
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 并发执行查询和计数，提高性能
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('categoryId', 'name type color icon')  // 填充分类信息
        .populate('labelId', 'name color')         // 填充标签信息
        .sort({ date: -1 })                   // 按日期降序排列
        .skip(skip)                        // 跳过前 N 条
        .limit(parseInt(limit)),               // 限制返回数量
      Transaction.countDocuments(filter)           // 统计总数
    ]);

    // 为每个交易添加格式化的日期字符串，方便前端处理
    const transactionsWithDateString = transactions.map(tx => {
      const txObj = tx.toObject();
      const date = new Date(txObj.date);
      // 格式化为 YYYY-MM-DD 格式
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      txObj.dateString = `${year}-${month}-${day}`;
      return txObj;
    });

    // 返回交易列表和分页信息
    res.json({
      transactions: transactionsWithDateString,
      pagination: {
        current: parseInt(page),      // 当前页码
        pageSize: parseInt(limit),     // 每页数量
        total,                  // 总记录数
        totalPages: Math.ceil(total / parseInt(limit))  // 总页数
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 创建新交易
 * @route POST /api/transactions
 * @param {Object} req.body - { date, amount, type, categoryId, labelId, description }
 * @returns {Object} 201 - 创建的交易对象（包含填充的分类和标签）
 */
export const createTransaction = async (req, res) => {
  try {
    const { date, amount, type, categoryId, labelId, description } = req.body;
    const userId = req.user._id;  // 从认证中间件获取用户 ID

    // 必填字段验证
    if (!amount || !type || !categoryId) {
      return res.status(400).json({ error: 'Amount, type, and categoryId are required' });
    }

    // 类型验证：只能是 Expenses（支出）或 Income（收入）
    if (!['Expenses', 'Income'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Expenses or Income' });
    }

    // 金额验证：必须为正数
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // 验证分类是否存在且属于当前用户
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // 验证分类类型和交易类型是否一致
    if (category.type !== type) {
      return res.status(400).json({ error: 'Category type does not match transaction type' });
    }

    // 处理标签：如果提供了标签 ID，验证其存在性
    let finalLabelId = null;
    if (labelId && labelId.trim()) {
      const label = await Label.findOne({ _id: labelId, userId });
      if (!label) {
        return res.status(400).json({ error: 'Label not found' });
      }
      finalLabelId = label._id;
    }

    // 解析日期字符串（YYYY-MM-DD）并创建 UTC 时间的午夜时刻
    // 这样可以确保无论时区如何，日期都存储为当天的开始时间
    let transactionDate;
    if (date && typeof date === 'string') {
      const [year, month, day] = date.split('-');
      transactionDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0));
    } else {
      transactionDate = new Date();  // 如果未提供日期，使用当前时间
    }

    // 创建交易记录
    const transaction = await Transaction.create({
      date: transactionDate,
      amount,
      type,
      categoryId,
      labelId: finalLabelId,
      description,
      userId
    });

    // 填充关联的分类和标签信息
    await transaction.populate('categoryId', 'name type color icon');
    await transaction.populate('labelId', 'name color');

    // 为前端添加格式化的日期字符串字段
    const txObj = transaction.toObject();
    const dateObj = new Date(txObj.date);
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    txObj.dateString = `${year}-${month}-${day}`;

    res.status(201).json(txObj);
  } catch (error) {
    console.error('Create transaction error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新交易
 * @route PUT /api/transactions/:id
 * @param {String} req.params.id - 交易 ID
 * @param {Object} req.body - { date, amount, type, categoryId, labelId, description }
 * @returns {Object} 200 - 更新后的交易对象
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, type, categoryId, labelId, description } = req.body;
    const userId = req.user._id;

    // 验证交易是否存在且属于当前用户
    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // 如果提供了新的分类 ID，验证其存在性和所有权
    if (categoryId && categoryId !== transaction.categoryId.toString()) {
      const category = await Category.findOne({ _id: categoryId, userId });
      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    // 处理标签更新：只在提供了非空标签 ID 时验证
    let updateLabelId = labelId;
    if (labelId && labelId.trim()) {
      const label = await Label.findOne({ _id: labelId, userId });
      if (!label) {
        return res.status(400).json({ error: 'Label not found' });
      }
    } else {
      updateLabelId = null;  // 空字符串或 null 表示移除标签
    }

    // 解析日期字符串（YYYY-MM-DD）为 UTC 时间的午夜时刻
    let updateDate = date;
    if (date && typeof date === 'string' && date.includes('-') && !date.includes('T')) {
      const [year, month, day] = date.split('-');
      updateDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0));
    }

    // 更新交易，使用 findByIdAndUpdate
    // new: true 返回更新后的文档
    // runValidators: true 运行 Schema 定义的验证器
    const updated = await Transaction.findByIdAndUpdate(
      id,
      { date: updateDate, amount, type, categoryId, labelId: updateLabelId, description },
      { new: true, runValidators: true }
    )
      .populate('categoryId', 'name type color icon')  // 填充分类信息
      .populate('labelId', 'name color');         // 填充标签信息

    // 为前端添加格式化的日期字符串字段
    const updatedObj = updated.toObject();
    const dateObj = new Date(updatedObj.date);
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    updatedObj.dateString = `${year}-${month}-${day}`;

    res.json(updatedObj);
  } catch (error) {
    console.error('Update transaction error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 删除交易
 * @route DELETE /api/transactions/:id
 * @param {String} req.params.id - 交易 ID
 * @returns {Object} 200 - { message: 'Transaction deleted successfully' }
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 查找并删除交易（必须属于当前用户）
    // 使用 findOneAndDelete 确保只能删除自己的交易
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
