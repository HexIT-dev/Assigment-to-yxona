import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import heroImg from '../assets/hero.png';
import {
  Search, MapPin, Users, ArrowRight, Sparkles,
  Star, ShieldCheck, Camera, ChevronRight,
  Clock, Filter, Map, Bookmark, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../context/LanguageContext';

const LandingPage: React.FC = () => {
  const { t } = useLang();
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const res = await api.get('/halls');
      setHalls(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const filteredHalls = halls.filter(hall => 
    hall.name.toLowerCase().includes(search.toLowerCase()) &&
    (district === '' || hall.district === district)
  );

  return (
    <main>
      {/* Hero Section - Maximum Impact */}
      <section className="hero-section">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <div className="hero-badge">
            <div className="hero-badge-icon">
               <Sparkles size={14} />
            </div>
            <span className="hero-badge-text">{t('hero_badge')}</span>
          </div>

          <h1 className="hero-title">
            {t('hero_title')} <span className="gold-gradient-text">{t('hero_title2')}</span> <br />
            {t('hero_title3')}
          </h1>

          <p className="hero-description">
            {t('hero_sub')}
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary">
              {t('start_booking')} <ArrowRight size={24} />
            </Link>
            <button className="btn-outline">
              {t('gallery')}
            </button>
          </div>

          <div className="hero-stats">
             <div className="hero-stat-item">
                <p className="hero-stat-value">500+</p>
                <p className="hero-stat-label">{t('venues')}</p>
             </div>
             <div className="hero-stat-divider"></div>
             <div className="hero-stat-item">
                <p className="hero-stat-value">12k+</p>
                <p className="hero-stat-label">{t('events')}</p>
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1 }}
          className="hero-visual"
        >
          <div className="arch-frame">
            <img
              src={heroImg}
              alt="Elegant Hall"
            />
            <div className="arch-frame-overlay">
                <h2 >Versailles <br /> Palace</h2>
                <p >Oyning Eng Go'zal Joyi</p>
            </div>
          </div>
          
          {/* Floating Cards */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="hero-floating-card"
          >
             <div className="floating-card-body">
                <div className="floating-card-icon">
                   <ShieldCheck size={32} />
                </div>
                <div className="floating-card-text">
                   <p className="floating-card-title">Kafolatlangan</p>
                   <p className="floating-card-desc">Admin Tizimi Tomonidan</p>
                </div>
             </div>
          </motion.div>
        </motion.div>
        {/* Abstract Background Shapes */}
        <div className="hero-bg-glow-1"></div>
        <div className="hero-bg-glow-2"></div>
      </section>

      {/* Modern Search Bar - Bento Style */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-field">
            <Search  size={24} />
            <input
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="search-divider"></div>

          <div className="search-field">
            <MapPin  size={24} />
            <select 
              
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">Tumanlar</option>
              {["Yunusobod", "Mirobod", "Chilonzor", "Mirzo Ulug'bek", "Shayxontohur"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <button className="search-btn">
            {t('advanced_filters')}
          </button>
        </div>
      </section>

      {/* Maqsadlar va Reklamalar Bento Grid */}
      <section className="analytics-grid">
        
        {/* Loyiha Maqsadlari - Glassmorphism Card */}
        <div className="glass-card">
          <div className="card-content">
            <div className="card-badge">
              <Sparkles size={14} /> Bizning Maqsadimiz
            </div>
            <h3 className="card-title">
              Sizning Orzuingizdagi <br />
              <span className="gold-gradient-text">Kafolatlangan</span> Tantana.
            </h3>
            <p className="card-description">
              Loyiha asosi bo'yicha har bir to'yxona tizim adminlari tomonidan sinchkovlik bilan tekshiriladi va faqat tasdiqlangan, ishonchli joylar ro'yxatga olinadi. Bizning oliy maqsadimiz – to'y va marosimlarni o'tkazishda firibgarlik, sanalarning bir-biriga to'g'ri kelib qolishi va yashirin to'lovlardan butunlay xalos bo'lgan mutlaqo shaffof va oson bron qilish platformasini taqdim etishdir.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', margin: 0 }}>100%</p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Shaffoflik</p>
            </div>
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', margin: 0 }}>0%</p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Xavotir</p>
            </div>
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', margin: 0 }}>Tezkor</p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Tasdiqlash</p>
            </div>
          </div>
        </div>

        {/* Maxsus Reklama Banneri - Bento Premium */}
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="card-content">
            <div className="card-badge">
              <TrendingUp size={14} /> Maxsus Takliflar
            </div>
            <h3 className="card-title">
              Bahorgi <br />
              <span className="gold-gradient-text">15% Chegirma</span> <br />
              Mavsumi boshlandi!
            </h3>
            <p className="card-description">
              Versailles Palace saroyida may oyining oxirigacha bo'lgan barcha bronlar uchun premium menyuda 15% gacha chegirmaga ega bo'ling. Shoshiling, bo'sh sanalar soni cheklangan!
            </p>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Link to="/register" className="search-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Chegirmadan Foydalanish <ArrowRight size={16} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
            </Link>
          </div>
          {/* Decorative Blur Backgrounds */}
          <div className="card-bg-glow-1"></div>
          <div className="card-bg-glow-2"></div>
        </div>

      </section>

      {/* Featured Grid Section */}
      <section className="featured-section">
        <div className="section-wrapper">
          <div className="section-header">
            <div className="section-header-title">
               <div className="section-badge">
                  <TrendingUp size={16} /> {t('featured_badge')}
               </div>
               <h2 className="section-title">{t('featured_title')} <br /> <span className="gold-gradient-text">{t('featured_title2')}</span></h2>
               <p className="section-desc">{t('featured_desc')}</p>
            </div>
            <div className="section-header-actions">
               <button className="btn-outline">
                  <Filter size={18} /> {t('advanced_filters')}
               </button>
               <button className="btn-outline">
                  <Map size={18} /> {t('map_view')}
               </button>
            </div>
          </div>

          <div className="bento-grid">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} ></div>
                ))
              ) : filteredHalls.map((hall, idx) => (
                <motion.div
                  key={hall.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <Link to={`/halls/${hall.id}`} className="venue-card">
                    <div className="venue-card-media">
                      <img 
                        src={hall.images[0]?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'} 
                        
                        alt={hall.name}
                      />
                      <div className="venue-card-bookmark">
                        <button onClick={(e) => { e.preventDefault(); /* Bookmark logic */ }}>
                          <Bookmark size={18} />
                        </button>
                      </div>
                      <div className="venue-card-badges">
                        {hall.images.some((img: any) => img.is360) && (
                          <span className="venue-badge-360">
                            <Camera size={12} /> 360 Experience
                          </span>
                        )}
                        <span className="venue-badge-district">
                          {hall.district}
                        </span>
                      </div>
                    </div>

                    <div className="venue-card-body">
                      <div className="venue-card-header">
                        <div className="venue-card-title-group">
                          <h3 >{hall.name}</h3>
                          <div className="venue-card-location">
                             <MapPin size={12}  /> {hall.district} District
                          </div>
                        </div>
                        <div className="venue-card-rating">
                          <Star size={14} fill="currentColor" />
                          4.9
                        </div>
                      </div>

                      <div className="venue-card-divider"></div>

                      <div className="venue-card-details">
                        <div className="venue-detail-item">
                          <p>{t('capacity')}</p>
                          <div className="venue-detail-value">
                             <Users size={16}  />
                             {hall.capacity} <span >Pax</span>
                          </div>
                        </div>
                        <div className="venue-detail-item">
                          <p>{t('price_per_seat')}</p>
                          <div className="venue-detail-value">
                             <span>{hall.pricePerSeat.toLocaleString()}</span>
                             <span>/so'm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3.5rem' }}>
             <button className="search-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                {t('view_all')} <ChevronRight size={20} />
             </button>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="search-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '4rem', marginTop: '4rem' }}>
         <div style={{ width: '100%', maxWidth: '1300px', margin: '0 auto' }}>
            <div className="stats-grid">
               {[
                 { val: "24/7", labelKey: 'concierge' as const, icon: Clock },
                 { val: "100%", labelKey: 'secure' as const, icon: ShieldCheck },
                 { val: "150+", labelKey: 'partners' as const, icon: Users },
                 { val: "360°", labelKey: 'virtual_tour' as const, icon: Camera }
               ].map((item, i) => (
                 <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
                    <div style={{ color: 'var(--accent)', background: 'rgba(207, 176, 118, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <item.icon size={36} />
                    </div>
                    <div >
                       <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: 0, lineHeight: 1 }}>{item.val}</p>
                       <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t(item.labelKey)}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer - Elegant Design */}
      <footer >
        <div >
          <div >
            <div >
              <Link to="/" >
                <div >
                  <Sparkles size={24} />
                </div>
                <span >Elegance</span>
              </Link>
              <p >
                "Redefining the standard of celebratory governance in the digital age."
              </p>
            </div>
            
            <div >
               <div >
                  <p >Collective</p>
                  <ul >
                     <li><a href="#" >Directory</a></li>
                     <li><a href="#" >Partnerships</a></li>
                     <li><a href="#" >Concierge</a></li>
                  </ul>
               </div>
               <div >
                  <p >Protocol</p>
                  <ul >
                     <li><a href="#" >Security</a></li>
                     <li><a href="#" >Verification</a></li>
                     <li><a href="#" >Terms</a></li>
                  </ul>
               </div>
               <div >
                  <p >Newsletter</p>
                  <div >
                     <input type="text" placeholder="Entry Email..."  />
                     <button ><ArrowRight size={20} /></button>
                  </div>
               </div>
            </div>
          </div>
          <div >
            <p >© 2026 Elegance Premium Booking Collective. Developed by Antigravity.</p>
            <div >
              <a href="#" >Instagram</a>
              <a href="#" >Telegram</a>
              <a href="#" >LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
