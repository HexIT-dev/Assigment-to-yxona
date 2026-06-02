import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang, type Lang } from '../context/LanguageContext';
import {
  LogOut, MessageSquare, Globe,
  Sun, Moon, Menu, X, ChevronDown,
  Sparkles, LayoutDashboard, CalendarHeart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isPanelPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner');
  const isAuthPage = ['/login', '/register', '/admin-login', '/verify-otp'].includes(location.pathname);
  
  if (isAuthPage || isPanelPage) return null;

  const languages: { code: Lang; label: string }[] = [
    { code: 'uz', label: "O'Z" },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <nav>
      <div className="nav-wrapper">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Sparkles size={20} />
          </div>
          <span className="nav-logo-text">
            Elegance
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-desktop-menu">
          <Link to="/">{t('discover')}</Link>
          <div className="nav-divider"></div>

          {/* Lang Switcher */}
          <div className="nav-lang-selector">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="btn-nav"
            >
              <Globe size={14} />
              <span>{languages.find(l => l.code === lang)?.label}</span>
              <ChevronDown size={12} />
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="nav-lang-dropdown"
                >
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setIsLangOpen(false); }}
                      className={`lang-option ${lang === l.code ? 'active' : ''}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-nav-icon"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="nav-user-actions flex items-center gap-4">
              {user.role === 'USER' && (
                <Link
                  to="/my-bookings"
                  className="btn-nav flex items-center gap-2"
                >
                  <CalendarHeart size={18} />
                  <span>{t('myBookings')}</span>
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="btn-nav flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  <span>{t('adminPanel')}</span>

                </Link>
              )}
              {user.role === 'OWNER' && (
                <Link
                  to="/owner"
                  className="btn-nav flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  <span>{t('myPanel')}</span>
                </Link>
              )}

              <Link to="/chat" className="btn-nav-icon relative">
                <MessageSquare size={20} />
                <span className="chat-indicator"></span>
              </Link>

              <div className="nav-profile-summary flex items-center gap-2">
                <div className="nav-profile-avatar w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {user.firstName?.charAt(0).toUpperCase()}
                </div>
                <div className="nav-profile-details text-left">
                  <p className="m-0 text-[10px] text-text-muted font-bold uppercase tracking-wider">{user.role}</p>
                  <p className="m-0 text-xs font-bold text-primary">{user.firstName}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-nav-icon"
                title={t('logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons flex items-center gap-3">
              <Link to="/login" className="btn-nav">{t('signIn')}</Link>
              <Link to="/register" className="btn-nav btn-primary text-white" style={{ padding: '0.5rem 1.2rem' }}>{t('register')}</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="nav-mobile-btn">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface border-t border-border mt-3 rounded-xl overflow-hidden shadow-lg"
          >
            <div className="flex flex-col p-4 gap-3 text-left">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-text-muted hover:text-primary font-semibold py-2 no-underline">{t('discover')}</Link>
              {user ? (
                <>
                  <div className="h-px bg-border my-1"></div>
                  {user.role === 'USER' && (
                    <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)} className="text-text-muted hover:text-primary font-semibold py-2 flex items-center gap-2 no-underline">
                      <CalendarHeart size={18} /> {t('myBookings')}
                    </Link>
                  )}
                  <Link to="/chat" onClick={() => setIsMenuOpen(false)} className="text-text-muted hover:text-primary font-semibold py-2 flex items-center gap-2 no-underline">
                    <MessageSquare size={18} /> {t('messages')}
                  </Link>
                  {user.role === 'OWNER' && (
                    <Link to="/owner" onClick={() => setIsMenuOpen(false)} className="text-text-muted hover:text-primary font-semibold py-2 flex items-center gap-2 no-underline">
                      <LayoutDashboard size={18} /> {t('myPanel')}
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-text-muted hover:text-primary font-semibold py-2 flex items-center gap-2 no-underline">
                      <LayoutDashboard size={18} /> {t('adminPanel')}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-error hover:bg-error/10 font-semibold py-2 flex items-center gap-2 bg-transparent border-none shadow-none text-left w-full justify-start cursor-pointer">
                    <LogOut size={18} /> {t('logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-nav text-center no-underline">{t('signIn')}</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-nav btn-primary text-white text-center no-underline" style={{ padding: '0.6rem 1.2rem' }}>{t('register')}</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
