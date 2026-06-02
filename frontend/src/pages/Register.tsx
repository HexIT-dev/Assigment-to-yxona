import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Lock, ArrowRight, Sparkles, ShieldCheck, Building2, UserPlus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../context/LanguageContext';

const Register: React.FC = () => {
  const { t } = useLang();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    role: 'USER' as 'USER'
  });
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast.error(t('agree_prefix') + ' ' + t('agree_terms'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { ...formData, role: 'USER' });
      toast.success(t('reg_success_user'));
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('reg_error'));
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
        {/* Left Side - Information */}
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
                   Yangi <br /> <span className="gold-gradient-text">Boshlanish.</span>
                 </h2>
                 <p>Foydalanuvchi yoki to'yxona egasi sifatida ro'yxatdan o'ting.</p>
              </div>

              <div className="auth-brand-benefits">
                 {[
                   { icon: ShieldCheck, title: "Xavfsiz tizim", desc: "Shifrlanagan va himoyalangan" },
                   { icon: Building2, title: "500+ To'yxona", desc: "Keng tanlov va eng yaxshi narxlar" }
                 ].map((item, i) => (
                   <div key={i} className="auth-benefit-item flex gap-4 items-start mb-4">
                      <div className="auth-benefit-icon text-accent">
                         <item.icon size={24} />
                      </div>
                      <div className="auth-benefit-text text-left">
                         <p className="benefit-title font-bold m-0 text-white" style={{ fontSize: '1.05rem' }}>{item.title}</p>
                         <p className="benefit-desc m-0 text-white/70" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
               <div className="auth-protocol-badge">
                  <UserPlus size={16} />
                  <span>{t('register')}</span>
               </div>
               <h3>{t('reg_title')}</h3>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="auth-form-group">
                    <label>{t('firstName')}</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="auth-form-group">
                    <label>{t('lastName')}</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="auth-form-group">
                    <label>{t('email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="auth-form-group">
                    <label>{t('phone')}</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="auth-form-group">
                    <label>{t('username')}</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="auth-form-group">
                    <label>{t('password')}</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>


                {/* Agreement Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    required
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label htmlFor="agree" style={{ margin: 0, textTransform: 'none', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--text-muted)' }}>
                    {t('agree_prefix')}{' '}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0, textTransform: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'inline', fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      {t('agree_terms')}
                    </button>{' '}
                    {t('agree_suffix')}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white border-none rounded-md font-bold shadow hover:bg-primary-hover"
                >
                  {loading ? t('register_loading') : t('register_btn')}
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>

            {/* Terms and Conditions Modal */}
            <AnimatePresence>
              {showTerms && (
                <div className="fixed-overlay" style={{ zIndex: 100 }}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--accent)', position: 'relative' }}
                  >
                    <button onClick={() => setShowTerms(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', boxShadow: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                    
                    <h3 style={{ borderBottom: '2px double var(--accent)', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '1.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Foydalanish Shartlari va Shartnoma</h3>
                    
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                      <p><strong>1. Shartnoma maqsadi:</strong> Ushbu shartnoma Elegance Premium Booking Collective platformasi orqali to'yxonalar va tantanalar saroylarini band qilish shartlarini belgilaydi.</p>
                      <p><strong>2. Bron qilish va depozit:</strong> Har qanday band qilish to'lov summasining 20% miqdorida kafolatlangan depozit to'langanidan so'ng kuchga kiradi va to'yxona egasi tomonidan tasdiqlanishi talab etiladi.</p>
                      <p><strong>3. Bekor qilish siyosati:</strong> Tadbir sanasidan 15 kun oldin bekor qilingan bronlar uchun depozit to'liq qaytariladi. Kechroq bekor qilinsa, jarima to'lovlari ushlab qolinishi mumkin.</p>
                      <p><strong>4. To'yxona egasining huquqlari:</strong> To'yxona egasi yomon xulq-atvor yoki firgarlik shubhasi bo'lgan foydalanuvchini chatda bloklash yoki buyurtmasini bekor qilish huquqiga ega.</p>
                      <p><strong>5. Nizolarni hal qilish:</strong> Ballar nizolar platforma administratsiyasi (Admin) nazorati ostida va O'zbekiston Respublikasi qonunchiligiga muvofiq hal etiladi.</p>
                    </div>
                    
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setAgree(true); setShowTerms(false); }} style={{ padding: '0.6rem 1.5rem', textTransform: 'none' }}>
                        Roziman va Tasdiqlayman
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="auth-form-footer">
              <p>
                {t('have_account')} <Link to="/login" className="auth-link">{t('signIn')}</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
