import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, ArrowRight, ChevronLeft, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';

const VerifyOTP: React.FC = () => {
  const { t } = useLang();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success(t('otp_success'));
      navigate('/login');
    } catch (error) {
      toast.error(t('otp_error'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      {/* Background Decor */}
      <div className="auth-bg-glow-1"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card-mini bg-surface border border-border rounded-xl p-8 shadow-2xl max-w-md w-full relative"
      >
        <button 
          onClick={() => navigate('/register')}
          className="btn-back flex items-center gap-2 mb-6 text-text-muted hover:text-primary bg-transparent border-none shadow-none p-0 text-sm font-semibold cursor-pointer"
        >
          <div className="btn-back-icon p-1 bg-surface-hover rounded-full border border-border flex items-center justify-center">
             <ChevronLeft size={16} />
          </div>
          {t('back_register')}
        </button>

        <div className="auth-form-wrapper">
          <div className="auth-form-header text-center flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={40} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-serif text-primary m-0 mb-1">{t('otp_title')}</h1>
              <p className="text-sm text-text-muted m-0">{t('otp_subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form mt-6">
            <div className="auth-form-group flex flex-col gap-2 mb-4">
               <label className="text-xs font-bold text-primary uppercase text-center block">{t('otp_label')}</label>
               <input
                 type="text"
                 maxLength={6}
                 placeholder="000000"
                 className="p-4 text-center font-mono text-2xl tracking-widest border border-border rounded-md bg-surface"
                 value={otp}
                 onChange={(e) => setOtp(e.target.value)}
                 required
               />
               <p className="text-xs text-text-muted text-center mt-2 m-0">{t('otp_sent')} {email}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white border-none rounded-md font-bold mt-4 shadow hover:bg-primary-hover"
            >
              {loading ? t('verify_loading') : t('verify_btn')}
              <ArrowRight size={24} />
            </button>
          </form>

          <div className="auth-form-footer mt-6 flex justify-between items-center border-t border-border pt-4">
             <button type="button" className="btn-outline py-2 px-4 text-xs shadow-none">
                <RefreshCcw size={16} /> {t('resend')}
             </button>
             <div className="auth-otp-progress flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                <div className="w-2 h-2 rounded-full bg-primary/20"></div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
