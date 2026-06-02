import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Lock, ArrowRight, ShieldCheck, User, ChevronLeft, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminLogin: React.FC = () => {
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
      if (res.data.user.role !== 'ADMIN') {
        toast.error("Siz admin emassiz. Iltimos to'g'ri hisob bilan kiring.");
        setLoading(false);
        return;
      }
      login(res.data.token, res.data.user);
      toast.success('Admin tizimga muvaffaqiyatli kirdi!');
      navigate('/admin');
    } catch (error) {
      toast.error("Login yoki parol noto'g'ri");
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
        transition={{ duration: 0.4 }}
        className="auth-card"
      >
        {/* Left Side - Visual Branding */}
        <div className="auth-branding">
          <div className="auth-brand-logo"></div>
          <div className="auth-brand-content">
            <Link to="/" className="nav-logo text-white shadow-none" style={{ textDecoration: 'none' }}>
              <div className="nav-logo-icon text-accent">
                <Sparkles size={24} />
              </div>
              <span style={{ color: '#ffffff' }}>Elegance</span>
            </Link>

            <div className="auth-brand-main">
              <h2>
                Admin <br />
                <span className="gold-gradient-text">Markazi.</span>
              </h2>
              <p>To'yxona platformasining asosiy nazorat va boshqaruv tizimi.</p>
            </div>

            <div className="auth-brand-stats">
              <div className="auth-brand-stat-item">
                <p className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={28} className="text-accent" />
                </p>
                <p className="stat-label">Xavfsiz</p>
              </div>
              <div className="auth-brand-stat-divider"></div>
              <div className="auth-brand-stat-item">
                <p className="stat-value">99.9%</p>
                <p className="stat-label">Barqarorlik</p>
              </div>
            </div>
          </div>

          {/* Abstract Circle Decor */}
          <div className="auth-abstract-circle"></div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            {/* Back link */}
            <div style={{ marginBottom: '24px' }}>
              <Link
                to="/login"
                className="auth-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ChevronLeft size={16} />
                Foydalanuvchi kirishi
              </Link>
            </div>

            <div className="auth-form-header">
              <div className="auth-protocol-badge">
                <ShieldCheck size={16} />
                <span>Admin Kirish Protokoli</span>
              </div>
              <h3>
                Admin <br /> Kirish.
              </h3>
              <p>Boshqaruv paneliga kirish uchun ma'lumotlaringizni kiriting</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form-fields">
                <div className="auth-form-group">
                  <label>Username</label>
                  <div className="auth-input-wrapper">
                    <User size={20} className="auth-input-icon" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin_username"
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label>Parol</label>
                  <div className="auth-input-wrapper">
                    <Lock size={20} className="auth-input-icon" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white border-none rounded-md font-bold mt-6 shadow hover:bg-primary-hover flex items-center justify-center gap-2"
              >
                {loading ? 'Tekshirilmoqda...' : 'Tizimga Kirish'}
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="auth-form-footer">
              <p>
                Oddiy foydalanuvchimisiz?{' '}
                <Link to="/login" className="auth-link">
                  Foydalanuvchi kirishi
                </Link>
              </p>
              <p>
                Yangi foydalanuvchi?{' '}
                <Link to="/register" className="auth-link">
                  Ro'yxatdan o'tish
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
