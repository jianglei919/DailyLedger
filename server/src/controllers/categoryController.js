/**
 * 分类控制器 (Category Controller)
 * 处理收入/支出分类的增删改查业务逻辑
 * 分类用于对交易进行粗粒度分类管理
 */

import Category from '../models/Category.js';

/**
 * 获取分类列表
 * @route GET /api/categories
 * @query {String} type - 可选，筛选类型（Expenses 或 Income）
 * @returns {Array} 200 - 分类数组，按创建时间降序排列
 */
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;   // 从查询参数获取类型筛选
    const userId = req.user._id;  // 只查询当前用户的分类

    // 构建查询条件
    const filter = { userId };
    if (type && ['Expenses', 'Income'].includes(type)) {
      filter.type = type;  // 添加类型筛选
    }

    // 查询并按创建时间降序排列（最新的在前）
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 创建新分类
 * @route POST /api/categories
 * @param {Object} req.body - { name, type, description, color, icon }
 * @returns {Object} 201 - 创建的分类对象
 */
export const createCategory = async (req, res) => {
  try {
    const { name, type, description, color, icon } = req.body;
    const userId = req.user._id;

    // 必填字段验证
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // 类型验证：必须是 Expenses（支出）或 Income（收入）
    if (!['Expenses', 'Income'].includes(type)) {
      return res.status(400).json({ error: 'Type must be Expenses or Income' });
    }

    // 创建分类
    // 注意：Schema 中定义了唯一索引（userId + type + name）
    // 如果同一类型下分类名重复，会抛出异常
    const category = await Category.create({
      name,
      type,
      description,
      color,      // 用于 UI 显示的颜色
      icon,       // 用于 UI 显示的图标
      userId
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新分类
 * @route PUT /api/categories/:id
 * @param {String} req.params.id - 分类 ID
 * @param {Object} req.body - { name, description, color, icon, type }
 * @returns {Object} 200 - 更新后的分类对象
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, type } = req.body;
    const userId = req.user._id;

    // 查找并更新分类（必须属于当前用户）
    // new: true 返回更新后的文档
    // runValidators: true 运行 Schema 验证器
    const category = await Category.findOneAndUpdate(
      { _id: id, userId },
      { name, description, color, icon, type },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 删除分类
 * @route DELETE /api/categories/:id
 * @param {String} req.params.id - 分类 ID
 * @returns {Object} 200 - { message: 'Category deleted successfully' }
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 查找并删除分类（必须属于当前用户）
    // 注意：删除分类后，使用该分类的交易仍然存在，但关联字段将变为 null
    const category = await Category.findOneAndDelete({ _id: id, userId });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
