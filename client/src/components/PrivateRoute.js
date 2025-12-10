/**
 * 私有路由保护组件 (Private Route)
 * 用于保护需要认证的路由
 * 抓跟用户是否已登录，没有登录的用户会被重定向到登录页面
 */

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * 私有路由保护组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 要保护的子组件（只有登录後才会渲染）
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);  // 从认证上下文获取用户信息

  // 加载中：检查用户是否已登录
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // 如果用户已登录，渲染子组件，否则重定向到登录页面
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
