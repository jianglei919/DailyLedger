/**
 * 标签控制器 (Label Controller)
 * 处理交易标签的增删改查业务逻辑
 * 标签用于对交易进行更细粒度的多维度分类管理
 */

import Label from '../models/Label.js';

/**
 * 获取标签列表
 * @route GET /api/labels
 * @returns {Array} 200 - 标签数组，按创建时间降序排列
 */
export const getLabels = async (req, res) => {
  try {
    const userId = req.user._id;  // 只查询当前用户的标签
    
    // 查询并按创建时间降序排列（最新的在前）
    const labels = await Label.find({ userId }).sort({ createdAt: -1 });
    res.json(labels);
  } catch (error) {
    console.error('Get labels error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 创建新标签
 * @route POST /api/labels
 * @param {Object} req.body - { name, color }
 * @returns {Object} 201 - 创建的标签对象
 */
export const createLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user._id;

    // 必填字段验证
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // 创建标签
    // 注意：Schema 中定义了唯一索引（userId + name）
    // 如果标签名重复，会抛出异常
    const label = await Label.create({ name, color, userId });
    res.status(201).json(label);
  } catch (error) {
    console.error('Create label error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 更新标签
 * @route PUT /api/labels/:id
 * @param {String} req.params.id - 标签 ID
 * @param {Object} req.body - { name, color, isActive }
 * @returns {Object} 200 - 更新后的标签对象
 */
export const updateLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, isActive } = req.body;
    const userId = req.user._id;

    // 查找并更新标签（必须属于当前用户）
    // isActive 字段用于软删除，设置为 false 可以隐藏标签而不删除
    const label = await Label.findOneAndUpdate(
      { _id: id, userId },
      { name, color, isActive },
      { new: true, runValidators: true }
    );

    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json(label);
  } catch (error) {
    console.error('Update label error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 删除标签
 * @route DELETE /api/labels/:id
 * @param {String} req.params.id - 标签 ID
 * @returns {Object} 200 - { message: 'Label deleted successfully' }
 */
export const deleteLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 查找并删除标签（必须属于当前用户）
    // 注意：删除标签后，使用该标签的交易仍然存在，但 labelId 字段将变为 null
    const label = await Label.findOneAndDelete({ _id: id, userId });
    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json({ message: 'Label deleted successfully' });
  } catch (error) {
    console.error('Delete label error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
