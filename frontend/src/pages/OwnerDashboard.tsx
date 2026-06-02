import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import {
  Building2, Calendar as CalendarIcon, Clock,
  Settings, LayoutDashboard, Plus, Pencil,
  ChevronDown, CheckCircle, XCircle, Search,
  DollarSign, Users, Sparkles, LogOut, Info, AlertTriangle, X, Edit3, Trash2,
  MessageSquare, Send, Ban, Filter, ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { format, startOfWeek, addDays, isSameMonth, isSameDay, startOfMonth, endOfMonth, endOfWeek, subMonths, addMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [halls, setHalls] = useState<any[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'pending' | 'halls' | 'settings' | 'chat'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [analytics, setAnalytics] = useState<any>({ chartData: [] });
  const [bookings, setBookings] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', password: '', avatarUrl: '' });
  
  // Chart Visual Mode
  const [chartMode, setChartMode] = useState<'payments' | 'userCount'>('payments');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Add / Edit Hall Modal States
  const [showHallModal, setShowHallModal] = useState(false);
  const [editingHall, setEditingHall] = useState<any>(null);
  const [savingHall, setSavingHall] = useState(false);
  const [hallForm, setHallForm] = useState({
    name: '',
    district: 'Yunusobod',
    address: '',
    capacity: 200,
    pricePerSeat: 150000,
    phone: '',
    images: ['', '', ''],
    images360: [false, false, false],
    services: [
      { name: 'VIP Catering', price: 5000000, type: 'FOOD' },
      { name: 'Jonli Orkestr', price: 3000000, type: 'MUSIC' },
      { name: 'Chiroyli Dekoratsiya', price: 4000000, type: 'DECOR' }
    ]
  });

  // Edit Booking Modal States
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [editSeats, setEditSeats] = useState(100);
  const [editDate, setEditDate] = useState('');
  const [editServices, setEditServices] = useState<string[]>([]);
  const [savingBooking, setSavingBooking] = useState(false);

  // Reject / Cancel modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; bookingId: string | null; type: 'reject' | 'cancel' }>({ open: false, bookingId: null, type: 'reject' });
  const [rejectReason, setRejectReason] = useState('');

  // Hall saved success banner
  const [hallSavedPending, setHallSavedPending] = useState(false);

  // Chat State
  const [chatContacts, setChatContacts] = useState<any[]>([]);
  const [chatActiveContact, setChatActiveContact] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatNewMessage, setChatNewMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedHallId) {
      fetchHallData(selectedHallId);
    }
  }, [selectedHallId]);

  useEffect(() => {
    if (activeTab === 'chat') fetchChatContacts();
  }, [activeTab]);

  useEffect(() => {
    if (!chatActiveContact) return;
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, [chatActiveContact]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchInitialData = async () => {
    try {
      const hallsRes = await api.get(`/halls?ownerId=${user?.id}`);
      setHalls(hallsRes.data);
      if (hallsRes.data.length > 0) {
        setSelectedHallId(hallsRes.data[0].id);
      }
      if (user) {
        setProfileForm({
           firstName: user.firstName,
           lastName: user.lastName,
           password: '',
           avatarUrl: user.avatarUrl || ''
        });
      }
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    }
    setLoading(false);
  };

  const fetchHallData = async (hallId: string) => {
    try {
      const [analyticsRes, bookingsRes] = await Promise.all([
        api.get(`/analytics/owner/${hallId}`),
        api.get(`/bookings?hallId=${hallId}`)
      ]);
      setAnalytics(analyticsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveBooking = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/approve`);
      toast.success('✅ Bron muvaffaqiyatli tasdiqlandi! Taqvimda ko\'rinadi.');
      fetchHallData(selectedHallId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const openRejectModal = (id: string, type: 'reject' | 'cancel' = 'reject') => {
    setRejectReason('');
    setRejectModal({ open: true, bookingId: id, type });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.bookingId) return;
    try {
      if (rejectModal.type === 'reject') {
        await api.patch(`/bookings/${rejectModal.bookingId}/reject`, { reason: rejectReason });
        toast.success('Bron rad etildi. Foydalanuvchiga depozit qaytarildi.');
      } else {
        await api.patch(`/bookings/${rejectModal.bookingId}/cancel`, { reason: rejectReason });
        toast.success('Bron bekor qilindi. Foydalanuvchiga depozit qaytarildi.');
      }
      setRejectModal({ open: false, bookingId: null, type: 'reject' });
      setRejectReason('');
      fetchHallData(selectedHallId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // Chat functions
  const fetchChatContacts = async () => {
    try {
      const res = await api.get('/messages/contacts');
      setChatContacts(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchChatMessages = async () => {
    if (!chatActiveContact) return;
    try {
      const res = await api.get(`/messages?otherUserId=${chatActiveContact.id}`);
      setChatMessages(res.data);
    } catch (error) { console.error(error); }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatNewMessage.trim() || !chatActiveContact) return;
    try {
      const res = await api.post('/messages', { receiverId: chatActiveContact.id, content: chatNewMessage });
      setChatMessages(prev => [...prev, res.data]);
      setChatNewMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xabar yuborishda xatolik');
    }
  };

  const handleBlockChatUser = async (userId: string, userName: string) => {
    if (!window.confirm(`${userName}ni bloklamoqchimisiz? Bu foydalanuvchi siz bilan chat qila olmaydi.`)) return;
    try {
      await api.post(`/messages/block/${userId}`);
      toast.success(`${userName} bloklandi`);
      setChatActiveContact(null);
      fetchChatContacts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { 
        firstName: profileForm.firstName, 
        lastName: profileForm.lastName,
        avatarUrl: profileForm.avatarUrl 
      };
      if (profileForm.password) payload.password = profileForm.password;
      
      await api.put('/users/profile', payload);
      toast.success('Profil muvaffaqiyatli yangilandi');
      setProfileForm(prev => ({ ...prev, password: '' }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // Open Add Hall
  const openAddHallModal = () => {
    setEditingHall(null);
    setHallForm({
      name: '',
      district: 'Yunusobod',
      address: '',
      capacity: 200,
      pricePerSeat: 150000,
      phone: '',
      images: ['', '', ''],
      images360: [false, false, false],
      services: [
        { name: 'VIP Catering', price: 5000000, type: 'FOOD' },
        { name: 'Jonli Orkestr', price: 3000000, type: 'MUSIC' },
        { name: 'Chiroyli Dekoratsiya', price: 4000000, type: 'DECOR' }
      ]
    });
    setShowHallModal(true);
  };

  // Open Edit Hall
  const openEditHallModal = (hall: any) => {
    setEditingHall(hall);
    setHallForm({
      name: hall.name,
      district: hall.district,
      address: hall.address,
      capacity: hall.capacity,
      pricePerSeat: hall.pricePerSeat,
      phone: hall.phone || '',
      images: [
        hall.images?.[0]?.url || '',
        hall.images?.[1]?.url || '',
        hall.images?.[2]?.url || ''
      ],
      images360: [
        hall.images?.[0]?.is360 || false,
        hall.images?.[1]?.is360 || false,
        hall.images?.[2]?.is360 || false
      ],
      services: hall.services?.map((s: any) => ({
        name: s.name,
        price: s.price,
        type: s.type
      })) || [
        { name: 'VIP Catering', price: 5000000, type: 'FOOD' },
        { name: 'Jonli Orkestr', price: 3000000, type: 'MUSIC' },
        { name: 'Chiroyli Dekoratsiya', price: 4000000, type: 'DECOR' }
      ]
    });
    setShowHallModal(true);
  };

  // Add Service Field
  const addServiceField = () => {
    setHallForm({
      ...hallForm,
      services: [...hallForm.services, { name: '', price: 0, type: 'FOOD' }]
    });
  };

  // Remove Service Field
  const removeServiceField = (index: number) => {
    const newServices = [...hallForm.services];
    newServices.splice(index, 1);
    setHallForm({ ...hallForm, services: newServices });
  };

  // Save Hall
  const handleSaveHall = async () => {
    if (!hallForm.name || !hallForm.address || !hallForm.phone) {
      toast.error('Iltimos, barcha zaruriy maydonlarni to\'ldiring');
      return;
    }

    setSavingHall(true);
    try {
      const activeImages = hallForm.images
        .map((url, index) => ({ url, is360: hallForm.images360[index] }))
        .filter(img => img.url.trim() !== '');

      const payload = {
        name: hallForm.name,
        district: hallForm.district,
        address: hallForm.address,
        capacity: hallForm.capacity,
        pricePerSeat: hallForm.pricePerSeat,
        phone: hallForm.phone,
        images: activeImages,
        services: hallForm.services.filter(s => s.name.trim() !== '')
      };

      if (editingHall) {
        await api.put(`/halls/${editingHall.id}`, payload);
        toast.success("To'yxona tahrirlandi! Admin tasdiqlashini kuting.");
      } else {
        await api.post('/halls', payload);
        toast.success("To'yxona yaratildi! Admin tasdiqlashini kuting.");
      }

      setShowHallModal(false);
      setHallSavedPending(true);
      setTimeout(() => setHallSavedPending(false), 8000);
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSavingHall(false);
    }
  };

  // Open Edit Booking Modal
  const openEditBookingModal = (booking: any) => {
    setEditingBooking(booking);
    setEditSeats(booking.seats);
    setEditDate(new Date(booking.date).toISOString().split('T')[0]);
    setEditServices(booking.services.map((s: any) => s.service.id));
  };

  const handleEditBookingSave = async () => {
    if (!editingBooking) return;
    setSavingBooking(true);
    try {
      await api.put(`/bookings/${editingBooking.id}`, {
        seats: editSeats,
        date: editDate,
        serviceIds: editServices
      });
      toast.success('Foydalanuvchi broni muvaffaqiyatli tahrirlandi');
      setEditingBooking(null);
      fetchHallData(selectedHallId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSavingBooking(false);
    }
  };

  const selectedHall = halls.find(h => h.id === selectedHallId);
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED' || b.status === 'UPCOMING');

  const totalRevenue = analytics.chartData?.reduce((acc: number, curr: any) => acc + curr.payments, 0) || 0;
  const totalUsers = analytics.chartData?.reduce((acc: number, curr: any) => acc + curr.userCount, 0) || 0;

  // Calendar Logic
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 bg-surface-hover rounded-md hover:bg-accent/20 text-text border-none shadow-none">&lt;</button>
        <span className="font-serif font-bold text-primary text-xl">{format(currentDate, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 bg-surface-hover rounded-md hover:bg-accent/20 text-text border-none shadow-none">&gt;</button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-bold text-text-muted text-sm uppercase tracking-wide">
          {format(addDays(startDate, i), 'EEEEEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        // Find if there's an approved booking on this day
        const dayBooking = bookings.find(b => isSameDay(new Date(b.date), cloneDay) && (b.status === 'APPROVED' || b.status === 'UPCOMING'));
        const hasPending = bookings.some(b => isSameDay(new Date(b.date), cloneDay) && b.status === 'PENDING');

        days.push(
          <div
            key={day.toString()}
            onClick={() => setSelectedDate(cloneDay)}
            className={`calendar-day cursor-pointer hover:bg-surface-hover min-h-[80px] p-2 flex flex-col justify-between ${!isCurrentMonth ? 'opacity-40' : ''} ${isSameDay(selectedDate || new Date(0), cloneDay) ? 'active ring-2 ring-accent ring-inset' : ''} ${dayBooking ? 'bg-primary/5 border-primary/20' : ''}`}
          >
            <span className="font-bold">{formattedDate}</span>
            <div className="flex flex-col gap-1 mt-auto">
               {dayBooking && (
                 <div className="bg-success text-white text-[10px] font-bold px-1 py-0.5 rounded truncate" title={dayBooking.user.firstName}>
                    {dayBooking.user.firstName}
                 </div>
               )}
               {!dayBooking && hasPending && (
                 <div className="bg-warning text-white text-[10px] font-bold px-1 py-0.5 rounded truncate">
                    KUTMOQDA
                 </div>
               )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mt-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-border rounded-lg bg-surface p-2">{rows}</div>;
  };

  const getSelectedDateBooking = () => {
    if (!selectedDate) return null;
    return bookings.find(b => isSameDay(new Date(b.date), selectedDate) && b.status !== 'CANCELLED');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="text-accent">
            <Sparkles size={20} />
          </div>
          <span>Ega Panel</span>
        </div>

        {/* Multi-Hall Select */}
        <div className="mb-6 bg-surface-hover p-4 rounded-xl border border-border">
           <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Aktiv To'yxona</label>
           <div className="relative">
              <select 
                 value={selectedHallId} 
                 onChange={(e) => setSelectedHallId(e.target.value)}
                 className="w-full appearance-none bg-surface border border-border text-primary font-bold p-3 rounded-md focus:border-accent outline-none shadow-sm cursor-pointer pr-10"
              >
                 {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
           </div>
           {selectedHall?.status === 'PENDING' && (
              <div className="mt-3 flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 p-2 rounded-md">
                 <AlertTriangle size={14} /> Tasdiqlash kutilmoqda (Pending)
              </div>
           )}
        </div>

        <div className="sidebar-nav">
          {[
            { id: 'dashboard', label: 'Tahlillar', icon: LayoutDashboard },
            { id: 'calendar', label: 'Taqvim', icon: CalendarIcon },
            { id: 'pending', label: 'So\'rovlar', icon: Clock, count: pendingBookings.length },
            { id: 'halls', label: 'To\'yxonalarim', icon: Building2 },
            { id: 'chat', label: 'Mijozlar Chati', icon: MessageSquare },
            { id: 'settings', label: 'Sozlamalar', icon: Settings }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={activeTab === item.id ? 'active' : ''}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-warning text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 text-error hover:bg-error/10 hover:text-error bg-transparent border-none shadow-none justify-start px-4 py-3 rounded-md font-semibold transition-colors">
            <LogOut size={18} /> Chiqish
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
         <header className="dashboard-header flex justify-between items-center mb-8 pb-4 border-b border-border">
            <div className="flex flex-col">
              <h1 className="text-3xl font-serif text-primary m-0 pb-0 border-none">{selectedHall?.name || 'Boshqaruv Paneli'}</h1>
              <span className="text-text-muted text-sm">{selectedHall?.district ? `${selectedHall.district} tumani` : ''}</span>
            </div>
            {hallSavedPending && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-warning/10 border border-warning/30 px-4 py-2 rounded-xl text-sm"
              >
                <Clock size={16} className="text-warning" />
                <span className="font-bold text-warning">Kutulmoqda — Admin tasdiqlayapti</span>
              </motion.div>
            )}
         </header>

         {activeTab === 'dashboard' && (
            <div className="animate-fade-in flex flex-col gap-8">
               <div className="stats-grid">
                  <div className="stat-card flex items-center gap-4">
                     <div 
                       className="w-14 h-14 rounded-full flex items-center justify-center"
                       style={{ color: 'var(--success)', backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)' }}
                     >
                       <DollarSign size={28} />
                     </div>
                     <div className="flex flex-col">
                        <p className="text-2xl font-bold text-primary m-0 leading-none">{totalRevenue.toLocaleString()} <span className="text-sm text-text-muted font-normal">UZS</span></p>
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider mt-2 m-0">Umumiy Daromad</p>
                     </div>
                  </div>
                  <div className="stat-card flex items-center gap-4">
                     <div 
                       className="w-14 h-14 rounded-full flex items-center justify-center"
                       style={{ color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
                     >
                       <Users size={28} />
                     </div>
                     <div className="flex flex-col">
                        <p className="text-2xl font-bold text-primary m-0 leading-none">{totalUsers} <span className="text-sm text-text-muted font-normal">ta</span></p>
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider mt-2 m-0">Band Qilgan Mijozlar</p>
                     </div>
                  </div>
                  <div className="stat-card flex items-center gap-4">
                     <div 
                       className="w-14 h-14 rounded-full flex items-center justify-center"
                       style={{ color: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
                     >
                       <CalendarIcon size={28} />
                     </div>
                     <div className="flex flex-col">
                        <p className="text-2xl font-bold text-primary m-0 leading-none">{approvedBookings.length} <span className="text-sm text-text-muted font-normal">ta</span></p>
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider mt-2 m-0">Tasdiqlangan Tadbirlar</p>
                     </div>
                  </div>
               </div>

               {/* Analytics Chart with Exclusive Mode Toggles */}
               <div className="card">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-serif text-primary m-0 border-none pb-0">Dashboard Grafiklar (Ega uchun eksklyuziv)</h3>
                     <div className="flex bg-surface-hover p-1 rounded-md border border-border">
                       <button 
                         onClick={() => setChartMode('payments')}
                         className={`py-1.5 px-4 text-sm font-bold rounded shadow-none border-none ${chartMode === 'payments' ? 'bg-surface shadow text-primary' : 'bg-transparent text-text-muted'}`}
                       >
                         Daromad
                       </button>
                       <button 
                         onClick={() => setChartMode('userCount')}
                         className={`py-1.5 px-4 text-sm font-bold rounded shadow-none border-none ${chartMode === 'userCount' ? 'bg-surface shadow text-primary' : 'bg-transparent text-text-muted'}`}
                       >
                         Mijozlar
                       </button>
                     </div>
                  </div>

                  <div style={{ minHeight: '400px', width: '100%' }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.chartData}>
                           <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor={chartMode === 'payments' ? '#10b981' : '#3b82f6'} stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor={chartMode === 'payments' ? '#10b981' : '#3b82f6'} stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                           <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                           <Area type="monotone" dataKey={chartMode} stroke={chartMode === 'payments' ? '#10b981' : '#3b82f6'} strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8 animate-fade-in">
               <div className="flex flex-col w-full">
                  {renderHeader()}
                  {renderDays()}
                  {renderCells()}
               </div>
               <div className="card bg-surface flex flex-col h-fit sticky top-24">
                  <h3 className="text-xl font-serif text-primary border-b border-border pb-4 mb-4 mt-0">
                     {selectedDate ? format(selectedDate, 'dd MMMM, yyyy') : 'Sanani tanlang'}
                  </h3>
                  
                  {(() => {
                     const b = getSelectedDateBooking();
                     if (!b) return <div className="py-10 text-center text-text-muted flex flex-col items-center gap-3"><CalendarIcon size={48} className="opacity-20" /><p className="m-0 font-bold">Bo'sh kun. Hech qanday bandlik yo'q.</p></div>;
                     
                     return (
                        <div className="flex flex-col gap-6">
                           <div className="flex justify-between items-center">
                              <p className="text-sm font-bold text-text-muted uppercase m-0">Status</p>
                              <span className={`badge-${b.status.toLowerCase() === 'approved' ? 'approved' : 'pending'}`}>{b.status}</span>
                           </div>
                           
                           <div className="bg-surface-hover p-4 rounded-xl border border-border">
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 m-0">Mijoz (Foydalanuvchi)</p>
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-lg">
                                    {b.user.firstName[0]}
                                 </div>
                                 <div className="flex flex-col">
                                    <p className="font-bold text-primary m-0 leading-tight mb-1">{b.user.firstName} {b.user.lastName}</p>
                                    <p className="text-sm text-text-muted m-0">{b.user.phone}</p>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col gap-3">
                              <p className="text-xs font-bold text-text-muted uppercase tracking-wider m-0">Tafsilotlar</p>
                              <div className="grid grid-cols-2 gap-3">
                                 <div className="bg-surface p-3 rounded-lg border border-border flex flex-col gap-1">
                                    <p className="text-xs text-text-muted m-0">Odam soni</p>
                                    <p className="font-bold text-primary m-0">{b.seats} ta</p>
                                 </div>
                                 <div className="bg-surface p-3 rounded-lg border border-border flex flex-col gap-1">
                                    <p className="text-xs text-text-muted m-0">Umumiy Summa</p>
                                    <p className="font-bold text-success m-0">{b.totalPrice.toLocaleString()} UZS</p>
                                 </div>
                              </div>
                           </div>

                           {b.services && b.services.length > 0 && (
                              <div className="flex flex-col gap-2">
                                 <p className="text-xs font-bold text-text-muted uppercase tracking-wider m-0 mb-1">Qo'shimcha Xizmatlar</p>
                                 <ul className="m-0 p-0 list-none flex flex-col gap-2">
                                    {b.services.map((s: any) => (
                                       <li key={s.id} className="flex justify-between items-center text-sm p-2 bg-surface-hover rounded border border-border/50">
                                          <span className="text-text font-bold">{s.service.name}</span>
                                          <span className="text-success font-bold">+{s.service.price.toLocaleString()}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           )}
                           
                           {/* Actions for the Owner inside Calendar details */}
                           <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                             {b.status === 'PENDING' && (
                               <div className="flex gap-2">
                                 <button onClick={() => handleApproveBooking(b.id)} className="flex-1 bg-success text-white border-none shadow hover:bg-emerald-600">✅ Tasdiqlash</button>
                                 <button onClick={() => openRejectModal(b.id, 'reject')} className="flex-1 bg-surface border border-error text-error hover:bg-error/10 shadow-none">❌ Rad etish</button>
                               </div>
                             )}
                             {b.status !== 'CANCELLED' && b.status !== 'REJECTED' && (
                               <div className="flex gap-2">
                                 <button onClick={() => openEditBookingModal(b)} className="flex-1 btn-outline bg-surface shadow-none py-2 text-sm"><Edit3 size={16} /> Tahrirlash</button>
                                 <button onClick={() => openRejectModal(b.id, 'cancel')} className="flex-1 bg-surface border border-border text-text-muted hover:bg-surface-hover shadow-none py-2 text-sm">Bekor qilish</button>
                               </div>
                             )}
                           </div>
                        </div>
                     );
                  })()}
               </div>
            </div>
         )}

         {activeTab === 'pending' && (
            <div className="animate-fade-in flex flex-col gap-6">
               <h2 className="text-3xl font-serif text-primary m-0 pb-0 border-none">Kutilayotgan Bronlar</h2>
               {pendingBookings.length === 0 ? (
                  <div className="card text-center p-16 text-text-muted flex flex-col items-center gap-4">
                     <Clock size={48} className="opacity-20" />
                     <p className="font-bold text-lg m-0">Hozircha yangi so'rovlar yo'q.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     {pendingBookings.map(b => (
                        <div key={b.id} className="card p-0 flex flex-col border-l-4 border-l-warning">
                           <div className="p-5 flex gap-4 items-start">
                              <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center shrink-0 mt-1">
                                 <CalendarIcon size={24} />
                              </div>
                              <div className="flex flex-col gap-1 w-full">
                                 <p className="font-bold text-primary text-lg m-0">{format(new Date(b.date), 'dd MMMM, yyyy')}</p>
                                 <p className="text-sm text-text-muted m-0">{b.user.firstName} {b.user.lastName} • {b.user.phone}</p>
                                 <div className="flex justify-between items-center mt-2 bg-surface-hover p-2 rounded border border-border/50">
                                    <span className="font-bold text-success">{b.totalPrice.toLocaleString()} UZS</span>
                                    <span className="text-sm font-bold">{b.seats} kishi</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex border-t border-border bg-surface-hover mt-auto">
                              <button onClick={() => handleApproveBooking(b.id)} className="flex-1 py-3 text-success font-bold hover:bg-success/10 transition-colors border-none bg-transparent shadow-none rounded-none border-r border-border">✅ Tasdiqlash</button>
                              <button onClick={() => openRejectModal(b.id, 'reject')} className="flex-1 py-3 text-error font-bold hover:bg-error/10 transition-colors border-none bg-transparent shadow-none rounded-none">❌ Rad etish</button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

         {/* ══════════════ CHAT TAB ══════════════ */}
         {activeTab === 'chat' && (
            <div className="flex flex-col gap-4 animate-fade-in" style={{ height: 'calc(100vh - 160px)' }}>
              <h2 className="text-3xl font-serif text-primary m-0 border-none pb-0 shrink-0">Mijozlar Bilan Chat</h2>
              <div className="flex gap-4 flex-1 min-h-0">

                {/* Contacts Sidebar */}
                <div className="w-72 shrink-0 flex flex-col bg-surface border border-border rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-border shrink-0">
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      <input
                        type="text"
                        value={chatSearch}
                        onChange={e => setChatSearch(e.target.value)}
                        placeholder="Ism bo'yicha qidirish..."
                        className="w-full bg-surface-hover border border-border rounded-lg text-sm outline-none focus:border-accent text-text"
                        style={{ paddingLeft: '2rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {chatContacts.filter(c =>
                      (c.firstName + ' ' + c.lastName).toLowerCase().includes(chatSearch.toLowerCase())
                    ).map(contact => (
                      <button
                        key={contact.id}
                        onClick={() => setChatActiveContact(contact)}
                        className={`chat-contact-btn ${chatActiveContact?.id === contact.id ? 'selected' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 text-white text-sm"
                          style={{ background: 'var(--primary)', minWidth: '2.5rem' }}>
                          {contact.avatarUrl
                            ? <img src={contact.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (contact.firstName?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <p className="font-bold text-sm truncate m-0" style={{ color: 'var(--text)' }}>
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-xs truncate m-0" style={{ color: 'var(--text-muted)' }}>
                            {contact.role === 'ADMIN' ? 'Administrator' : `Mijoz${contact.phone ? ` · ${contact.phone}` : ''}`}
                          </p>
                        </div>
                        {contact.unreadCount > 0 && (
                          <span className="text-xs font-bold text-white rounded-full px-1.5 shrink-0"
                            style={{ background: 'var(--primary)', minWidth: '1.25rem', textAlign: 'center' }}>
                            {contact.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                    {chatContacts.length === 0 && (
                      <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                        <p className="text-sm font-medium m-0">Sizning to'yxonangizni bron qilgan mijozlar bu yerda ko'rinadi</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                {chatActiveContact ? (
                  <div className="flex-1 flex flex-col overflow-hidden min-h-0" style={{ background: 'var(--surface)' }}>
                    <div className="p-4 border-b border-border flex items-center justify-between bg-surface-hover shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden text-sm">
                          {chatActiveContact.avatarUrl
                            ? <img src={chatActiveContact.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : <span>{chatActiveContact.firstName?.[0]}</span>}
                        </div>
                        <div>
                          <p className="font-bold text-primary m-0 leading-none mb-1">
                            {chatActiveContact.firstName} {chatActiveContact.lastName}
                          </p>
                          <p className="text-xs text-text-muted m-0">
                            {chatActiveContact.role === 'ADMIN' ? 'Administrator' : `Mijoz • ${chatActiveContact.phone || ''}`}
                          </p>
                        </div>
                      </div>
                      {chatActiveContact.role === 'USER' && (
                        <button
                          onClick={() => handleBlockChatUser(chatActiveContact.id, chatActiveContact.firstName)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error hover:bg-error/10 rounded-md border border-error/20 bg-transparent shadow-none"
                        >
                          <Ban size={14} /> Bloklash
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0" style={{ background: 'var(--background)' }}>
                      {chatMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
                          <MessageSquare size={40} className="opacity-20" />
                          <p className="font-bold m-0">Muloqotni boshlang!</p>
                        </div>
                      ) : chatMessages.map((msg, idx) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                          <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm
                              ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-surface text-text border border-border rounded-bl-sm'}`}>
                              <p className="text-sm m-0">{msg.content}</p>
                              <p className={`text-xs mt-1 m-0 ${isMine ? 'text-white/60' : 'text-text-muted'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-border bg-surface shrink-0">
                      <form onSubmit={sendChatMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={chatNewMessage}
                          onChange={e => setChatNewMessage(e.target.value)}
                          placeholder="Xabaringizni yozing..."
                          className="flex-1 px-4 py-2.5 bg-surface-hover border border-border rounded-full text-sm focus:border-accent outline-none text-text"
                        />
                        <button
                          type="submit"
                          disabled={!chatNewMessage.trim()}
                          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center border-none shadow hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-surface border border-border rounded-xl text-text-muted">
                    <MessageSquare size={48} className="opacity-20 mb-4" />
                    <h3 className="text-xl font-serif text-primary mb-2 m-0">Mijozlar Chati</h3>
                    <p className="text-sm m-0">Chap tomondagi ro'yxatdan mijozni tanlang</p>
                  </div>
                )}
              </div>
            </div>
         )}

         {activeTab === 'settings' && (
            <div className="card max-w-2xl animate-fade-in">
               <h2 className="text-2xl font-serif text-primary mb-6 m-0 pb-0 border-none">Profil Sozlamalari</h2>
               <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 mt-4">
                  <div className="grid grid-cols-2 gap-5">
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-primary uppercase">Ism</label>
                        <input type="text" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} required className="p-3 border border-border rounded-md bg-surface" />
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-primary uppercase">Familiya</label>
                        <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} required className="p-3 border border-border rounded-md bg-surface" />
                     </div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-bold text-primary uppercase">Avatar URL</label>
                     <input type="text" value={profileForm.avatarUrl} onChange={e => setProfileForm({...profileForm, avatarUrl: e.target.value})} placeholder="https://..." className="p-3 border border-border rounded-md bg-surface" />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-bold text-primary uppercase">Yangi Parol</label>
                     <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} placeholder="O'zgartirish uchun kiriting..." className="p-3 border border-border rounded-md bg-surface" />
                  </div>
                  <button type="submit" className="mt-4 self-start">
                     Saqlash
                  </button>
                </form>
            </div>
         )}
         
         {activeTab === 'halls' && (
            <div className="animate-fade-in flex flex-col gap-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-serif text-primary m-0 pb-0 border-none">Mening To'yxonalarim</h2>
                  <button 
                    onClick={openAddHallModal}
                    className="btn-primary"
                  >
                     <Plus size={18} /> Yangi Qo'shish
                  </button>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {halls.map(hall => (
                     <div key={hall.id} className="venue-card relative">
                        {hall.status === 'PENDING' && (
                           <div className="absolute top-4 left-4 z-20 bg-warning text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-lg">
                              Kutilmoqda
                           </div>
                        )}
                        <div className="venue-card-media h-48">
                           {hall.images && hall.images[0] ? (
                              <img src={hall.images[0].url} alt={hall.name} />
                           ) : (
                              <div className="w-full h-full bg-surface-hover flex items-center justify-center text-primary/30">
                                 <Building2 size={64} />
                              </div>
                           )}
                        </div>
                        <div className="venue-card-body p-5">
                           <div className="flex flex-col gap-1">
                              <h3 className="text-xl font-bold text-primary m-0">{hall.name}</h3>
                              <p className="text-sm text-text-muted m-0 truncate">{hall.address}</p>
                              <div className="flex gap-2 mt-2">
                                 <span className="text-xs font-bold bg-surface-hover border border-border px-2 py-1 rounded text-primary">{hall.district}</span>
                                 <span className="text-xs font-bold bg-surface-hover border border-border px-2 py-1 rounded text-primary">{hall.capacity} sig'im</span>
                              </div>
                           </div>
                           <div className="mt-4 pt-4 border-t border-border flex justify-end">
                              <button 
                                onClick={() => openEditHallModal(hall)}
                                className="btn-outline text-sm py-2 px-4 shadow-none"
                              >
                                 <Pencil size={16} /> Tahrirlash
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
                  {halls.length === 0 && (
                     <div className="col-span-full card p-16 text-center text-text-muted flex flex-col items-center gap-4">
                        <Building2 size={48} className="opacity-20" />
                        <p className="font-bold text-lg m-0">Sizda hali to'yxonalar mavjud emas.</p>
                        <button onClick={openAddHallModal}>Yangi To'yxona Qo'shish</button>
                     </div>
                  )}
               </div>
            </div>
         )}
      </main>

      {/* Add / Edit Hall Modal */}
      <AnimatePresence>
        {showHallModal && (
          <div className="fixed-overlay z-[70]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface relative border border-border rounded-xl p-8 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowHallModal(false)}
                className="absolute top-4 right-4 p-2 bg-surface-hover rounded-full hover:text-primary transition-colors border-none shadow-none"
              >
                <X size={20} />
              </button>

              <h3 className="text-2xl font-serif text-primary m-0 mb-6 flex items-center gap-3 border-b border-border pb-4">
                <Building2 className="text-accent" />
                {editingHall ? "To'yxonani tahrirlash" : "Yangi to'yxona qo'shish"}
              </h3>

              <div className="flex flex-col gap-6">
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary">To'yxona Nomi *</label>
                    <input 
                      type="text" value={hallForm.name} onChange={e => setHallForm({...hallForm, name: e.target.value})}
                      className="p-3 border border-border rounded bg-surface"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary">Tuman *</label>
                    <select 
                      value={hallForm.district} onChange={e => setHallForm({...hallForm, district: e.target.value})}
                      className="p-3 border border-border rounded bg-surface outline-none focus:border-accent"
                    >
                      {["Yunusobod", "Mirobod", "Chilonzor", "Mirzo Ulug'bek", "Shayxontohur", "Uchtepa", "Yashnobod", "Olmazor", "Sergeli", "Yakkasaroy", "Bektemir", "Yangihayot"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary">Manzil *</label>
                  <input 
                    type="text" value={hallForm.address} onChange={e => setHallForm({...hallForm, address: e.target.value})}
                    className="p-3 border border-border rounded bg-surface"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary">Sig'im (Odam) *</label>
                    <input 
                      type="number" value={hallForm.capacity} onChange={e => setHallForm({...hallForm, capacity: parseInt(e.target.value) || 0})}
                      className="p-3 border border-border rounded bg-surface"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary">O'rindiq Narxi (UZS) *</label>
                    <input 
                      type="number" value={hallForm.pricePerSeat} onChange={e => setHallForm({...hallForm, pricePerSeat: parseFloat(e.target.value) || 0})}
                      className="p-3 border border-border rounded bg-surface"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-primary">Telefon *</label>
                    <input 
                      type="text" value={hallForm.phone} onChange={e => setHallForm({...hallForm, phone: e.target.value})}
                      placeholder="+998901234567"
                      className="p-3 border border-border rounded bg-surface"
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div className="flex flex-col gap-3 bg-surface-hover p-5 rounded-xl border border-border">
                  <label className="text-primary mb-1 border-b border-border/50 pb-2 text-sm font-bold">To'yxona Rasmlari (Maksimum 3 ta)</label>
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-center">
                      <input 
                        type="text" value={hallForm.images[idx]} 
                        onChange={e => {
                          const newImgs = [...hallForm.images];
                          newImgs[idx] = e.target.value;
                          setHallForm({...hallForm, images: newImgs});
                        }}
                        placeholder={`Rasm URL #${idx + 1}`}
                        className="flex-1 p-3 border border-border rounded bg-surface"
                      />
                      <label className="flex items-center gap-2 min-w-[120px] m-0 text-sm font-bold cursor-pointer normal-case">
                        <input 
                          type="checkbox" checked={hallForm.images360[idx]}
                          onChange={e => {
                            const new360 = [...hallForm.images360];
                            new360[idx] = e.target.checked;
                            setHallForm({...hallForm, images360: new360});
                          }}
                          className="w-5 h-5 accent-primary"
                        />
                        360° Rasm
                      </label>
                    </div>
                  ))}
                </div>

                {/* Services Section */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-border pb-2 mb-2">
                    <label className="m-0 text-primary text-sm font-bold">Xizmatlar ro'yxati</label>
                    <button 
                      type="button" onClick={addServiceField}
                      className="btn-outline py-1.5 px-4 text-xs shadow-none"
                    >
                      + Xizmat Qo'shish
                    </button>
                  </div>
                  {hallForm.services.map((service, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-center p-3 bg-surface-hover rounded-lg border border-border">
                      <input 
                        type="text" value={service.name} 
                        onChange={e => {
                          const newSvs = [...hallForm.services];
                          newSvs[idx].name = e.target.value;
                          setHallForm({...hallForm, services: newSvs});
                        }}
                        placeholder="Xizmat nomi"
                        className="flex-1 p-3 border border-border rounded bg-surface"
                      />
                      <input 
                        type="number" value={service.price} 
                        onChange={e => {
                          const newSvs = [...hallForm.services];
                          newSvs[idx].price = parseFloat(e.target.value) || 0;
                          setHallForm({...hallForm, services: newSvs});
                        }}
                        placeholder="Narxi (UZS)"
                        className="w-full md:w-40 p-3 border border-border rounded bg-surface"
                      />
                      <button 
                        type="button" onClick={() => removeServiceField(idx)}
                        className="p-3 bg-error/10 text-error hover:bg-error/20 rounded-md border-none shadow-none w-full md:w-auto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-border">
                  <button 
                    type="button" onClick={() => setShowHallModal(false)}
                    className="btn-outline"
                  >
                    Bekor qilish
                  </button>
                  <button 
                    onClick={handleSaveHall}
                    disabled={savingHall}
                  >
                    {savingHall ? 'Saqlanmoqda...' : (editingHall ? "Saqlash" : "Yaratish")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ Reject / Cancel Booking Modal ═══ */}
      <AnimatePresence>
        {rejectModal.open && (
          <div className="fixed-overlay z-[90]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface relative border border-border rounded-xl p-8 shadow-2xl max-w-md w-full"
            >
              <button
                onClick={() => setRejectModal({ open: false, bookingId: null, type: 'reject' })}
                className="absolute top-4 right-4 p-2 bg-surface-hover rounded-full hover:text-primary transition-colors border-none shadow-none"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-serif text-primary m-0 mb-6 flex items-center gap-3 border-b border-border pb-4">
                <XCircle className="text-error" size={24} />
                {rejectModal.type === 'reject' ? 'Bronni Rad Etish' : 'Bronni Bekor Qilish'}
              </h3>
              <div className="flex flex-col gap-5">
                <p className="text-text-muted text-sm m-0">
                  {rejectModal.type === 'reject'
                    ? 'Foydalanuvchining broni rad etiladi. Depozit (20%) qaytariladi.'
                    : 'Bron bekor qilinadi. Depozit (20%) qaytariladi.'}
                </p>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary">Sabab (ixtiyoriy)</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder={rejectModal.type === 'reject' ? 'Rad etish sababini yozing...' : 'Bekor qilish sababini yozing...'}
                    rows={3}
                    className="p-3 border border-border rounded-lg bg-surface text-text resize-none outline-none focus:border-accent w-full"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setRejectModal({ open: false, bookingId: null, type: 'reject' })}
                    className="btn-outline"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleConfirmReject}
                    className="bg-error text-white border-none px-6 py-2 rounded-lg font-bold hover:bg-red-600 shadow"
                  >
                    {rejectModal.type === 'reject' ? 'Rad Etish' : 'Bekor Qilish'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Booking Modal */}
      <AnimatePresence>
        {editingBooking && (
          <div className="fixed-overlay z-[80]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface relative border border-border rounded-xl p-8 shadow-2xl max-w-md w-full"
            >
              <button 
                onClick={() => setEditingBooking(null)}
                className="absolute top-4 right-4 p-2 bg-surface-hover rounded-full hover:text-primary transition-colors border-none shadow-none"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-serif text-primary m-0 mb-6 flex items-center gap-3 border-b border-border pb-4">
                <Edit3 className="text-accent" />
                Bronni Tahrirlash
              </h3>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary">Tadbir sanasi</label>
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="p-3 border border-border rounded bg-surface w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary">Odam soni</label>
                  <input type="number" value={editSeats} onChange={e => setEditSeats(parseInt(e.target.value) || 0)} className="p-3 border border-border rounded bg-surface w-full" />
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-sm font-bold text-primary">Qo'shimcha Xizmatlar</label>
                  <div className="flex flex-col gap-2 bg-surface-hover p-4 rounded border border-border max-h-48 overflow-y-auto">
                    {selectedHall?.services?.map((svc: any) => (
                      <label key={svc.id} className="flex items-center gap-3 m-0 cursor-pointer p-2 hover:bg-surface rounded">
                        <input 
                          type="checkbox" 
                          checked={editServices.includes(svc.id)}
                          onChange={e => {
                            if (e.target.checked) setEditServices([...editServices, svc.id]);
                            else setEditServices(editServices.filter(id => id !== svc.id));
                          }}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text">{svc.name}</span>
                          <span className="text-xs text-text-muted">{svc.price.toLocaleString()} UZS</span>
                        </div>
                      </label>
                    ))}
                    {(!selectedHall?.services || selectedHall.services.length === 0) && (
                      <p className="text-sm text-text-muted m-0 italic">To'yxonaga tegishli xizmatlar mavjud emas.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                  <button onClick={() => setEditingBooking(null)} className="btn-outline">Bekor qilish</button>
                  <button onClick={handleEditBookingSave} disabled={savingBooking}>
                    {savingBooking ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OwnerDashboard;
