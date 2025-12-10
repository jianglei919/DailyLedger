/**
 * Daily Ledger 前端应用主组件
 * 负责配置路由、认证上下文和全局导航
 */

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';  // 私有路由保护组件
import Navbar from './components/Navbar';        // 导航栏组件
import Login from './pages/Login';           // 登录页面
import Register from './pages/Register';        // 注册页面
import Dashboard from './pages/Dashboard';       // 仪表盘页面
import Transactions from './pages/Transactions';    // 交易列表页面
import Profile from './pages/Profile';         // 个人资料页面
import DayDetail from './pages/DayDetail';       // 单日明细页面
import Statistics from './pages/Statistics';      // 统计分析页面
import './i18n/config';  // 国际化配置
import './App.css';    // 全局样式

/**
 * 路由配置组件
 * 处理所有页面路由和认证逻辑
 */
const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  // 加载中状态 - 检查用户是否已登录
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions/day/:date"
            element={
              <PrivateRoute>
                <DayDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <PrivateRoute>
                <Statistics />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
