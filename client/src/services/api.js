/**
 * API 服务层
 * 封装所有后端 API 请求
 * 使用 axios 处理 HTTP 请求，自动添加认证 Token
 */

import axios from 'axios';

// API 基础 URL，优先使用环境变量
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'  // 默认请求头
  }
});

/**
 * 请求拦截器 - 自动添加 JWT Token
 * 在每个请求发送前，从 localStorage 读取 token 并添加到请求头
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // 添加 Bearer Token 到 Authorization 请求头
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 用户认证 API
 * 包括：注册、登录、个人资料、修改密码
 */
export const authApi = {
  register: (data) => api.post('/users/register', data),      // 注册新用户
  login: (data) => api.post('/users/login', data),         // 用户登录
  getProfile: () => api.get('/users/profile'),           // 获取个人资料
  updateProfile: (data) => api.put('/users/profile', data),    // 更新个人资料
  changePassword: (data) => api.put('/users/change-password', data) // 修改密码
};

/**
 * 交易 API
 * 包括：查询、创建、更新、删除交易
 */
export const transactionApi = {
  getTransactions: (params) => api.get('/transactions', { params }), // 获取交易列表（支持筛选、分页）
  createTransaction: (data) => api.post('/transactions', data),    // 创建新交易
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data), // 更新交易
  deleteTransaction: (id) => api.delete(`/transactions/${id}`)     // 删除交易
};

/**
 * 分类 API
 * 包括：查询、创建、更新、删除分类
 */
export const categoryApi = {
  getCategories: (params) => api.get('/categories', { params }),  // 获取分类列表
  createCategory: (data) => api.post('/categories', data),     // 创建新分类
  updateCategory: (id, data) => api.put(`/categories/${id}`, data), // 更新分类
  deleteCategory: (id) => api.delete(`/categories/${id}`)     // 删除分类
};

/**
 * 标签 API
 * 包括：查询、创建、更新、删除标签
 */
export const labelApi = {
  getLabels: () => api.get('/labels'),             // 获取标签列表
  createLabel: (data) => api.post('/labels', data),      // 创建新标签
  updateLabel: (id, data) => api.put(`/labels/${id}`, data), // 更新标签
  deleteLabel: (id) => api.delete(`/labels/${id}`)      // 删除标签
};

// 导出默认 axios 实例，供其他自定义请求使用
export default api;
