import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('language') || i18n?.language || 'en';
  });
  const containerRef = useRef(null);

  // Sync current language with i18n when it changes
  useEffect(() => {
    if (i18n) {
      const handleLanguageChanged = (lng) => {
        setCurrentLang(lng);
      };
      
      i18n.on('languageChanged', handleLanguageChanged);
      return () => {
        i18n.off('languageChanged', handleLanguageChanged);
      };
    }
  }, [i18n]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!showMenu) {
      return;
    }

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    // Add a small delay before adding the listener
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 300);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLanguageChange = (lang) => {
    if (!i18n) {
      return;
    }

    i18n.changeLanguage(lang).then(() => {
      localStorage.setItem('language', lang);
      setCurrentLang(lang);
      setShowMenu(false);
    });
  };

  return (
    <div className="language-switcher" ref={containerRef}>
      <button
        className={`language-switcher__btn ${showMenu ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        type="button"
        title={currentLang === 'zh' ? '切换语言' : 'Switch Language'}
      >
        🌐 {currentLang === 'zh' ? '中文' : 'English'} {showMenu ? '▲' : '▼'}
      </button>
      
      {showMenu && (
        <div className="language-switcher__menu" data-testid="language-menu">
          <button
            className={`language-switcher__item ${currentLang === 'en' ? 'active' : ''}`}
            data-lang="en"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLanguageChange('en');
            }}
            type="button"
          >
            English
          </button>
          <button
            className={`language-switcher__item ${currentLang === 'zh' ? 'active' : ''}`}
            data-lang="zh"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLanguageChange('zh');
            }}
            type="button"
          >
            中文
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
