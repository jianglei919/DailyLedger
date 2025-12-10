/**
 * 应用导航栏组件 (Application Navbar)
 * 显示应用名称、路由链接、用户信息和语言切换
 * 兼容 PC 端和移动端显示
 */

import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * 应用导航栏组件
 * 提供路由导航、用户模块和语言切换功能
 */
const AppNavbar = () => {
  // 认证信息：用户数据、登出函数
  const { user, logout } = useContext(AuthContext);
  
  // i18n 实例：管理语言变化、翻译函数 t()
  const { i18n, t } = useTranslation();
  
  // 路由导航、当前位置
  const navigate = useNavigate();
  const location = useLocation();
  
  // 组件状态：侧边栏显示、当前语言
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentSidebarLang, setCurrentSidebarLang] = useState(() => localStorage.getItem('language') || 'en');
  const languageMenuRef = useRef(null);

  // 描述1：监听推开语言菜单的点击事件
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        // 已传递给 LanguageSwitcher 组件处理
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 描述2：当 i18n 语言变化时，同步侧边栏状态
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentSidebarLang(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  // 检查当前路由是否活跃
  const isActive = (path) => location.pathname.startsWith(path);

  // 获取用户活动代码（首字）
  const getInitials = () => {
    const source = user?.username || user?.email || '';
    return source
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // 处理用户登出
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowSidebar(false);
  };

  // 处理导航点击，关闭PC端侧边栏
  const handleNavClick = () => {
    setShowSidebar(false);
  };

  // 处理侧边栏语言切换
  const handleSidebarLanguageChange = async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
      setCurrentSidebarLang(lang);
    } catch (err) {
      console.error('Error changing language:', err);
    }
  };

  return (
    <>
      <Navbar expand="lg" sticky="top" className="app-navbar">
        <Container fluid className="app-navbar__container">
          <Navbar.Brand
            as={Link}
            to={user ? '/dashboard' : '/login'}
            className="app-navbar__brand"
          >
            <span className="app-navbar__brand-icon">📊</span>
            {t('navbar.appName')}
          </Navbar.Brand>

          {/* Desktop Navigation */}
          <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex">
            <Nav className="me-auto">
              {user && (
                <>
                  <Nav.Link
                    as={Link}
                    to="/dashboard"
                    active={isActive('/dashboard')}
                    className="app-navbar__link"
                  >
                    {t('navbar.dashboard')}
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/statistics"
                    active={isActive('/statistics')}
                    className="app-navbar__link"
                  >
                    {t('navbar.statistics')}
                  </Nav.Link>
                </>
              )}
            </Nav>

            {/* Language Switcher - Outside Nav to avoid Bootstrap overflow issues */}
            <LanguageSwitcher />

            <Nav className="align-items-center gap-2">
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="app-navbar__user-link"
                    title="Go to Profile"
                  >
                    <div className="app-navbar__user">
                      <span className="app-navbar__avatar">{getInitials()}</span>
                      <span className="app-navbar__username">{user.username || user.email}</span>
                    </div>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    className="app-navbar__logout-btn"
                    title="Logout"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link
                    as={Link}
                    to="/login"
                    active={isActive('/login')}
                    className="app-navbar__link"
                  >
                    {t('navbar.login')}
                  </Nav.Link>
                  <Button
                    as={Link}
                    to="/register"
                    className="app-navbar__btn-register"
                  >
                    <span className="app-navbar__btn-register-icon">✨</span>
                    {t('navbar.register')}
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>

          {/* Mobile Hamburger Menu */}
          <Button
            className="app-navbar__hamburger d-lg-none"
            onClick={() => setShowSidebar(!showSidebar)}
            aria-label="Toggle navigation"
          >
            <span className={`app-navbar__hamburger-line ${showSidebar ? 'active' : ''}`}></span>
            <span className={`app-navbar__hamburger-line ${showSidebar ? 'active' : ''}`}></span>
            <span className={`app-navbar__hamburger-line ${showSidebar ? 'active' : ''}`}></span>
          </Button>
        </Container>
      </Navbar>

      {/* Mobile Sidebar */}
      <div className={`app-navbar__sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="app-navbar__sidebar-content">
          <button
            className="app-navbar__sidebar-close"
            onClick={() => setShowSidebar(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
          
          <nav className="app-navbar__sidebar-nav">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`app-navbar__sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  📊 {t('navbar.dashboard')}
                </Link>
                <Link
                  to="/statistics"
                  className={`app-navbar__sidebar-link ${isActive('/statistics') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  📈 {t('navbar.statistics')}
                </Link>
                <Link
                  to="/profile"
                  className="app-navbar__sidebar-link"
                  onClick={handleNavClick}
                >
                  👤 {t('navbar.profile')}
                </Link>
                
                {/* Language Switcher in Sidebar */}
                <div className="app-navbar__sidebar-divider"></div>
                <div className="app-navbar__sidebar-language">
                  <span className="app-navbar__sidebar-language-label">🌐 Language</span>
                  <div className="app-navbar__sidebar-language-options">
                    <button
                      className={`app-navbar__sidebar-language-btn ${currentSidebarLang === 'en' ? 'active' : ''}`}
                      onClick={() => {
                        handleSidebarLanguageChange('en');
                        handleNavClick();
                      }}
                    >
                      English
                    </button>
                    <button
                      className={`app-navbar__sidebar-language-btn ${currentSidebarLang === 'zh' ? 'active' : ''}`}
                      onClick={() => {
                        handleSidebarLanguageChange('zh');
                        handleNavClick();
                      }}
                    >
                      中文
                    </button>
                  </div>
                </div>
                <div className="app-navbar__sidebar-divider"></div>

                <button
                  className="app-navbar__sidebar-link app-navbar__sidebar-logout"
                  onClick={handleLogout}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`app-navbar__sidebar-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  🔐 {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="app-navbar__sidebar-link app-navbar__sidebar-register"
                  onClick={handleNavClick}
                >
                  ✨ {t('navbar.register')}
                </Link>
                
                {/* Language Switcher for non-authenticated users */}
                <div className="app-navbar__sidebar-divider"></div>
                <div className="app-navbar__sidebar-language">
                  <span className="app-navbar__sidebar-language-label">🌐 {t('navbar.language')}</span>
                  <div className="app-navbar__sidebar-language-options">
                    <button
                      className={`app-navbar__sidebar-language-btn ${currentSidebarLang === 'en' ? 'active' : ''}`}
                      onClick={() => {
                        handleSidebarLanguageChange('en');
                      }}
                    >
                      English
                    </button>
                    <button
                      className={`app-navbar__sidebar-language-btn ${currentSidebarLang === 'zh' ? 'active' : ''}`}
                      onClick={() => {
                        handleSidebarLanguageChange('zh');
                      }}
                    >
                      中文
                    </button>
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="app-navbar__overlay"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}
    </>
  );
};

export default AppNavbar;
