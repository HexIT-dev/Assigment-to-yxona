import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Lock, ArrowRight, Sparkles, User, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';

const Login: React.FC = () => {
  const { t } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.user);
      toast.success(t('login_success'));
      const role = res.data.user.role;
      if (role === 'OWNER') navigate('/owner');
      else if (role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (error) {
      toast.error(t('login_error'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      {/* Background Decor */}
      <div className="auth-bg-glow-1"></div>
      <div className="auth-bg-glow-2"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        {/* Left Side - Visual Branding */}
        <div className="auth-branding">
           <div className="auth-brand-logo"></div>
           <div className="auth-brand-content">
              <Link to="/" className="nav-logo text-white shadow-none">
                <div className="nav-logo-icon text-accent">
                  <Sparkles size={24} />
                </div>
                <span style={{ color: '#ffffff' }}>Elegance</span>
              </Link>

              <div className="auth-brand-main">
                 <h2>
                   {t('hero_title')} <br /> <span className="gold-gradient-text">{t('hero_title2')}</span> <br /> {t('hero_title3')}
                 </h2>
                 <p>{t('hero_sub')}</p>
              </div>

              <div className="auth-brand-stats">
                 <div className="auth-brand-stat-item">
                    <p className="stat-value">12K</p>
                    <p className="stat-label">{t('events')}</p>
                 </div>
                 <div className="auth-brand-stat-divider"></div>
                 <div className="auth-brand-stat-item">
                    <p className="stat-value">500+</p>
                    <p className="stat-label">{t('venues')}</p>
                 </div>
              </div>
           </div>
           
           {/* Abstract Circle Decor */}
           <div className="auth-abstract-circle"></div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
               <div className="auth-protocol-badge">
                  <ShieldCheck size={16} />
                  <span>{t('secure')}</span>
               </div>
               <h3>{t('login_title')}</h3>
               <p>{t('login_subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form-fields">
                <div className="auth-form-group">
                  <label>{t('username')}</label>
                  <div className="auth-input-wrapper">
                    <User size={20} className="auth-input-icon" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="auth-form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label style={{ margin: 0 }}>{t('password')}</label>
                    <a href="#" className="auth-link">{t('forgot')}</a>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={20} className="auth-input-icon" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white border-none rounded-md font-bold mt-6 shadow hover:bg-primary-hover"
              >
                {loading ? t('login_loading') : t('login_btn')}
                <ArrowRight size={24} />
              </button>
            </form>

            <div className="auth-form-footer">
              <p>
                {t('no_account')} <Link to="/register" className="auth-link">{t('register_link')}</Link>
              </p>
              <p>
                {t('admin_account')} <Link to="/admin-login" className="auth-link">{t('admin_login')}</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
