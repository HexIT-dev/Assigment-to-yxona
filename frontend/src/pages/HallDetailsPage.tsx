import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Users, CheckCircle2,
  ChevronLeft, ChevronRight, Star, Share2, Heart, Sparkles,
  CreditCard, Wallet, X, ArrowRight, Camera, Info
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfToday } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeSixtyViewer from '../components/ThreeSixtyViewer';

const HallDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hall, setHall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(100);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '' });

  useEffect(() => {
    fetchHall();
  }, [id]);

  const fetchHall = async () => {
    try {
      const res = await api.get(`/halls/${id}`);
      setHall(res.data);
      setGuestCount(Math.min(200, res.data.capacity));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Iltimos, avval tizimga kiring');
      navigate('/login');
      return;
    }
    if (!selectedDate) {
      toast.error('Sana tanlang');
      return;
    }
    const advancePayment = totalPrice * 0.2;
    if (user.balance < advancePayment) {
      toast.error('Hisobingizda yetarli mablag\' mavjud emas');
      return;
    }
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (cardInfo.number.length < 16) {
      toast.error('Karta raqamini to\'liq kiriting');
      return;
    }
    try {
      await api.post('/bookings', {
        hallId: id,
        date: selectedDate,
        seats: guestCount,
        serviceIds: selectedServices
      });
      toast.success('Bron muvaffaqiyatli yuborildi! Egasi tasdiqlashini kuting.');
      setShowPaymentModal(false);
      navigate('/my-bookings');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const isBooked = (date: Date) => {
    return hall?.bookings?.some((b: any) =>
      isSameDay(new Date(b.date), date) && b.status !== 'CANCELLED'
    );
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!hall) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <h2 className="text-2xl font-serif text-primary">To'yxona topilmadi</h2>
      <button onClick={() => navigate('/')} className="btn-outline">Bosh sahifaga qaytish</button>
    </div>
  );

  const totalPrice = (hall.pricePerSeat * guestCount) +
    hall.services
      .filter((s: any) => selectedServices.includes(s.id))
      .reduce((acc: number, s: any) => acc + s.price, 0);

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold border border-accent/20">
                <Sparkles size={12} />
                <span>Tasdiqlangan Toʻyxona</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2 leading-tight">{hall.name}</h1>
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <MapPin size={16} className="text-accent shrink-0" />
              <span>{hall.district} tumani</span>
              <span className="text-border">•</span>
              <span>{hall.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary shadow-none" title="Ulashish">
              <Share2 size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error shadow-none" title="Sevimlilarga qo'shish">
              <Heart size={18} />
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden h-72 md:h-96">
          <div className="md:col-span-2 relative bg-surface-hover rounded-xl overflow-hidden">
            {hall.images?.find((img: any) => img.is360) ? (
              <ThreeSixtyViewer imageUrl={hall.images.find((img: any) => img.is360).url} />
            ) : (
              <img
                src={hall.images?.[0]?.url}
                alt={hall.name}
                className="w-full h-full object-cover"
              />
            )}
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 text-white rounded-full text-xs backdrop-blur-sm">
              <Camera size={13} /> 360° Ko'rinish
            </span>
          </div>
          <div className="hidden md:flex flex-col gap-3">
            <div className="flex-1 rounded-xl overflow-hidden bg-surface-hover">
              <img
                src={hall.images?.[1]?.url || hall.images?.[0]?.url}
                alt="detail 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 rounded-xl overflow-hidden bg-surface-hover relative">
              <img
                src={hall.images?.[2]?.url || hall.images?.[0]?.url}
                alt="detail 2"
                className="w-full h-full object-cover"
              />
              {hall.images?.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{hall.images.length - 3} rasm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info & Services */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Sig'imi", val: hall.capacity + " kishi" },
              { icon: Star, label: "Reyting", val: "4.95 / 5.0" },
              { icon: Camera, label: "360° Ko'rinish", val: "Mavjud" },
              { icon: CheckCircle2, label: "Holat", val: "Tasdiqlangan" }
            ].map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-text-muted m-0">{item.label}</p>
                  <p className="text-sm font-bold text-primary m-0">{item.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {hall.description && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-serif font-bold text-primary mb-3">To'yxona haqida</h3>
              <p className="text-text leading-relaxed m-0">{hall.description}</p>
            </div>
          )}

          {/* Services */}
          {hall.services?.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-serif font-bold text-primary mb-4">Qo'shimcha xizmatlar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hall.services.map((service: any) => {
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <motion.div
                      whileHover={{ y: -2 }}
                      key={service.id}
                      onClick={() => {
                        setSelectedServices(prev =>
                          prev.includes(service.id)
                            ? prev.filter(s => s !== service.id)
                            : [...prev, service.id]
                        );
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-surface-hover hover:border-accent/50'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                        ${isSelected ? 'bg-primary text-white' : 'bg-accent/10 text-accent'}`}>
                        <Sparkles size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-muted m-0 capitalize">{service.type}</p>
                        <p className="text-sm font-bold text-primary m-0 truncate">{service.name}</p>
                        <p className="text-xs text-accent font-bold m-0">+{service.price.toLocaleString()} UZS</p>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="text-primary shrink-0" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Widget */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-2xl p-5 sticky top-24 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-primary m-0">Bron qilish</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-muted hover:text-primary shadow-none p-0"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-muted hover:text-primary shadow-none p-0"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="mb-4">
              <p className="text-center text-sm font-bold text-primary mb-2 m-0">
                {format(currentMonth, 'MMMM yyyy')}
              </p>
              <div className="grid grid-cols-7 mb-1">
                {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(d => (
                  <div key={d} className="text-center text-xs text-text-muted font-semibold py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {/* Leading empty cells for day-of-week alignment */}
                {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map(day => {
                  const booked = isBooked(day);
                  const past = isBefore(day, startOfToday());
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      disabled={booked || past}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square text-xs rounded-lg transition-all shadow-none p-0 font-medium
                        ${selected ? 'bg-primary text-white font-bold' :
                          booked ? 'bg-error/10 text-error line-through cursor-not-allowed' :
                          past ? 'text-text-muted/40 cursor-not-allowed bg-transparent' :
                          'hover:bg-primary/10 hover:text-primary text-text bg-transparent'
                        }`}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guest count slider */}
            <div className="mb-4 p-3 bg-surface-hover rounded-xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-muted">Mehmonlar soni</span>
                <span className="text-sm font-bold text-primary">{guestCount} kishi</span>
              </div>
              <input
                type="range"
                min="50"
                max={hall.capacity}
                step="10"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value))}
                className="w-full h-2 accent-primary bg-border rounded-full outline-none border-none p-0"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>50</span>
                <span>{hall.capacity}</span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Asosiy narx</span>
                <span className="text-text font-medium">{(hall.pricePerSeat * guestCount).toLocaleString()} UZS</span>
              </div>
              {hall.services.filter((s: any) => selectedServices.includes(s.id)).map((s: any) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-text-muted">{s.name}</span>
                  <span className="text-text font-medium">+{s.price.toLocaleString()} UZS</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-bold text-primary">Jami</span>
                <span className="font-bold text-primary text-lg">{totalPrice.toLocaleString()} UZS</span>
              </div>
              <p className="text-xs text-text-muted m-0">Avans (20%): {(totalPrice * 0.2).toLocaleString()} UZS</p>
            </div>

            {selectedDate && (
              <p className="text-xs text-center text-primary font-semibold mb-3 m-0">
                Tanlangan sana: {format(selectedDate, 'dd.MM.yyyy')}
              </p>
            )}

            <button
              className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover"
              onClick={handleBooking}
            >
              Bron qilish <ArrowRight size={18} />
            </button>

            <p className="text-center text-xs text-text-muted mt-3 m-0">
              <Info size={12} className="inline mr-1" />
              Bron egasi tasdiqlashini kutadi
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border-2 border-accent rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-muted hover:text-error shadow-none p-0"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
                  <CreditCard size={28} />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary m-0">To'lovni tasdiqlash</h3>
                <p className="text-sm text-text-muted mt-1 m-0">
                  Avans to'lov: <strong className="text-primary">{(totalPrice * 0.2).toLocaleString()} UZS</strong>
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">Karta raqami</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="•••• •••• •••• ••••"
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:border-accent outline-none bg-surface-hover"
                    value={cardInfo.number}
                    onChange={e => setCardInfo({ ...cardInfo, number: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">Amal qilish muddati</label>
                    <input
                      type="text"
                      placeholder="OO/YY"
                      maxLength={5}
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:border-accent outline-none bg-surface-hover"
                      value={cardInfo.expiry}
                      onChange={e => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">CVC kod</label>
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="•••"
                      className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:border-accent outline-none bg-surface-hover"
                      value={cardInfo.cvc}
                      onChange={e => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface-hover rounded-xl border border-border">
                  <div className="flex items-center gap-2">
                    <Wallet size={18} className="text-accent" />
                    <span className="text-sm font-semibold text-text">Hisob balansi</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{user?.balance.toLocaleString()} <span className="text-xs text-text-muted">UZS</span></span>
                </div>

                <button
                  onClick={confirmPayment}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover"
                >
                  Bronni tasdiqlash <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HallDetailsPage;
