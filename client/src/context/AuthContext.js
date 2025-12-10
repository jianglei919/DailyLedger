/**
 * 认证上下文 (Authentication Context)
 * 提供全局的用户认证状态管理
 * 包括：登录、注册、登出、用户信息等
 */

import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

// 创建认证上下文
export const AuthContext = createContext();

/**
 * 认证提供者组件
 * 包裹整个应用，使所有子组件都能访问认证状态
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // 当前登录用户
  const [loading, setLoading] = useState(true);  // 加载状态

  /**
   * 组件挂载时，从 localStorage 恢复用户登录状态
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        // 解析用户数据
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
        // 如果数据损坏，清除 localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * 登录功能
   * @param {Object} credentials - 登录凭证 { email, password }
   * @returns {Promise} 登录结果
   */
  const login = async (credentials) => {
    try {
      // 调用登录 API
      const { data } = await authApi.login(credentials);
      const { token, ...userData } = data;

      // 保存 Token 和用户信息到 localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * 注册功能
   * @param {Object} formData - 注册表单数据 { username, email, password, confirmPassword }
   * @returns {Promise} 注册结果
   */
  const register = async (formData) => {
    try {
      // 调用注册 API
      const { data } = await authApi.register(formData);
      const { token, ...userData } = data;

      // 保存 Token 和用户信息到 localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return data;
    } catch (error) {
      throw error;
    }
  };

  /**
   * 登出功能
   * 清除 localStorage 和用户状态
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
