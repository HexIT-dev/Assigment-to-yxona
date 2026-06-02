import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import {
  Building2, Users, Calendar,
  ShieldCheck, Sparkles, LayoutDashboard,
  Search, LogOut, MessageSquare,
  CheckCircle, Trash2, X, User as UserIcon, Plus, Pencil,
  Send, Filter, ArrowUpDown, BookOpen, ChevronUp, ChevronDown,
  Ban
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  format, startOfWeek, addDays, isSameMonth, isSameDay,
  startOfMonth, endOfMonth, endOfWeek, subMonths, addMonths
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'halls' | 'owners' | 'bookings' | 'settings' | 'chat'>('dashboard');

  const [halls, setHalls] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({ registrations: [], popularHalls: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Settings State
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', password: '', avatarUrl: '' });

  // Detail Modal States
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [selectedHall, setSelectedHall] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [hallBookings, setHallBookings] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activeBooking, setActiveBooking] = useState<any>(null);

  // Chart Filters
  const [regYearFilter, setRegYearFilter] = useState('2026');
  const [popularDistrictFilter, setPopularDistrictFilter] = useState('all');

  // Add/Edit Hall states
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<any>(null);
  const [hallForm, setHallForm] = useState({
    name: '',
    district: 'Yunusobod',
    address: '',
    capacity: '',
    pricePerSeat: '',
    phone: '',
    images: ['', '', ''],
    images360: [false, false, false],
    services: [] as { name: string; price: string; type: string }[],
    ownerId: ''
  });

  // Table Filters
  const [hallStatusFilter, setHallStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED'>('all');
  const [hallDistrictFilter, setHallDistrictFilter] = useState('');
  const [hallSortField, setHallSortField] = useState<'none' | 'price' | 'capacity'>('none');
  const [hallSortOrder, setHallSortOrder] = useState<'asc' | 'desc'>('asc');
  const [ownerDistrictFilter, setOwnerDistrictFilter] = useState('');

  // All Bookings tab state
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingHallFilter, setBookingHallFilter] = useState('');
  const [bookingDistrictFilter, setBookingDistrictFilter] = useState('');
  const [bookingDateOrder, setBookingDateOrder] = useState<'asc' | 'desc'>('asc');

  // Owner creation form state
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [ownerForm, setOwnerForm] = useState({ firstName: '', lastName: '', email: '', phone: '', username: '', password: '' });

  // Chat State
  const [chatContacts, setChatContacts] = useState<any[]>([]);
  const [chatActiveContact, setChatActiveContact] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatNewMessage, setChatNewMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [chatDistrictFilter, setChatDistrictFilter] = useState('');
  const [chatSortBy, setChatSortBy] = useState<'name' | 'district'>('name');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Hall Form Handlers ────────────────────────────────────────────────────

  const openAddHallModal = () => {
    setEditingHall(null);
    setHallForm({
      name: '', district: 'Yunusobod', address: '', capacity: '',
      pricePerSeat: '', phone: '', images: ['', '', ''],
      images360: [false, false, false], services: [], ownerId: ''
    });
    setIsHallModalOpen(true);
  };

  const openEditHallModal = (hall: any) => {
    setEditingHall(hall);
    const serviceList = hall.services?.map((s: any) => ({
      name: s.name, price: s.price.toString(), type: s.type
    })) || [];
    const imageList = ['', '', ''];
    const images360List = [false, false, false];
    hall.images?.forEach((img: any, idx: number) => {
      if (idx < 3) { imageList[idx] = img.url; images360List[idx] = !!img.is360; }
    });
    setHallForm({
      name: hall.name, district: hall.district, address: hall.address,
      capacity: hall.capacity.toString(), pricePerSeat: hall.pricePerSeat.toString(),
      phone: hall.phone || '', images: imageList, images360: images360List,
      services: serviceList, ownerId: hall.ownerId || ''
    });
    setIsHallModalOpen(true);
  };

  const addServiceField = () =>
    setHallForm({ ...hallForm, services: [...hallForm.services, { name: '', price: '', type: 'FOOD' }] });

  const removeServiceField = (index: number) => {
    const s = [...hallForm.services];
    s.splice(index, 1);
    setHallForm({ ...hallForm, services: s });
  };

  const handleSaveHall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mappedImages = hallForm.images
        .filter(url => url.trim() !== '')
        .map((url, idx) => ({ url, is360: hallForm.images360[idx] }));
      const payload = {
        name: hallForm.name, district: hallForm.district, address: hallForm.address,
        capacity: hallForm.capacity, pricePerSeat: hallForm.pricePerSeat,
        phone: hallForm.phone, images: mappedImages,
        services: hallForm.services.filter(s => s.name.trim() !== ''),
        ownerId: hallForm.ownerId || null
      };
      if (editingHall) {
        await api.put(`/halls/${editingHall.id}`, payload);
        toast.success("To'yxona muvaffaqiyatli yangilandi!");
      } else {
        await api.post('/halls', payload);
        toast.success("To'yxona muvaffaqiyatli qo'shildi!");
      }
      setIsHallModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (activeTab === 'chat') fetchChatContacts();
    if (activeTab === 'bookings') fetchAllBookings();
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

  // ─── API Functions ─────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hallsRes, ownersRes, analyticsRes] = await Promise.all([
        api.get('/halls?status=all'),
        api.get('/users?role=OWNER'),
        api.get('/analytics/admin')
      ]);
      setHalls(hallsRes.data);
      setOwners(ownersRes.data);
      setAnalytics(analyticsRes.data);
      if (user) {
        setProfileForm({ firstName: user.firstName, lastName: user.lastName, password: '', avatarUrl: user.avatarUrl || '' });
      }
    } catch (error) {
      toast.error("Dashboard ma'lumotlarini yuklashda xatolik");
    }
    setLoading(false);
  };

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

  const fetchAllBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await api.get('/bookings');
      setAllBookings(res.data);
    } catch (error) {
      toast.error("Bronlarni yuklashda xatolik");
    }
    setBookingsLoading(false);
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Ushbu bronni bekor qilmoqchimisiz?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Bron bekor qilindi');
      fetchAllBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik');
    }
  };

  const handleApproveBooking = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/approve`);
      toast.success('✅ Bron tasdiqlandi');
      fetchAllBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik');
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { ...ownerForm, role: 'OWNER' });
      toast.success("To'yxona egasi muvaffaqiyatli qo'shildi!");
      setIsOwnerModalOpen(false);
      setOwnerForm({ firstName: '', lastName: '', email: '', phone: '', username: '', password: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Qo'shishda xatolik");
    }
  };

  const handleApproveHall = async (id: string) => {
    try {
      await api.patch(`/halls/${id}/approve`);
      toast.success("✅ To'yxona muvaffaqiyatli tasdiqlandi! Endi foydalanuvchilarga ko'rinadi.");
      if (selectedHall?.id === id) setSelectedHall(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleRejectHall = async (id: string, hallName: string) => {
    if (!window.confirm(`"${hallName}" to'yxonasini rad etib o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`)) return;
    try {
      await api.delete(`/halls/${id}`);
      toast.success("❌ To'yxona rad etildi va o'chirildi. Egasi xabardor qilinadi.");
      setSelectedHall(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDeleteHall = async (id: string) => {
    if (!window.confirm("Haqiqatan ham ushbu to'yxonani o'chirmoqchimisiz?")) return;
    try {
      await api.delete(`/halls/${id}`);
      toast.success("To'yxona o'chirildi");
      setSelectedHall(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDeleteOwner = async (id: string) => {
    if (!window.confirm("Haqiqatan ham ushbu to'yxona egasini o'chirib tashlamoqchimisiz?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("To'yxona egasi muvaffaqiyatli o'chirildi");
      setSelectedOwner(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
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

  const openHallDetails = async (hall: any) => {
    setSelectedHall(hall);
    setActiveBooking(null);
    try {
      const res = await api.get(`/bookings?hallId=${hall.id}`);
      setHallBookings(res.data);
    } catch (error) { console.error(error); }
  };

  // ─── Computed Values ───────────────────────────────────────────────────────

  const pendingHalls = halls.filter(h => h.status === 'PENDING');
  const uniqueDistricts = Array.from(new Set(halls.map(h => h.district).filter(Boolean))) as string[];

  const filteredHalls = halls
    .filter(h => {
      const nameMatch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.district.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = hallStatusFilter === 'all' || h.status === hallStatusFilter;
      const districtMatch = !hallDistrictFilter || h.district === hallDistrictFilter;
      return nameMatch && statusMatch && districtMatch;
    })
    .sort((a, b) => {
      if (hallSortField === 'price') {
        return hallSortOrder === 'asc' ? a.pricePerSeat - b.pricePerSeat : b.pricePerSeat - a.pricePerSeat;
      }
      if (hallSortField === 'capacity') {
        return hallSortOrder === 'asc' ? a.capacity - b.capacity : b.capacity - a.capacity;
      }
      return 0;
    });

  const now = new Date();
  const filteredBookings = allBookings
    .filter(b => {
      const statusOk = bookingStatusFilter === 'all' || b.status === bookingStatusFilter ||
        (bookingStatusFilter === 'upcoming' && new Date(b.date) >= now && b.status !== 'CANCELLED') ||
        (bookingStatusFilter === 'past' && new Date(b.date) < now);
      const hallOk = !bookingHallFilter || b.hall?.name?.toLowerCase().includes(bookingHallFilter.toLowerCase());
      const districtOk = !bookingDistrictFilter || b.hall?.district === bookingDistrictFilter;
      return statusOk && hallOk && districtOk;
    })
    .sort((a, b) => {
      const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
      return bookingDateOrder === 'asc' ? da - db : db - da;
    });

  const filteredOwners = owners.filter(o => {
    const nameMatch =
      o.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const districtMatch = !ownerDistrictFilter ||
      o.halls?.some((h: any) => h.district === ownerDistrictFilter);
    return nameMatch && districtMatch;
  });

  const filteredRegistrations = analytics.registrations?.filter((r: any) =>
    r.name.includes(regYearFilter)
  ) || [];

  const filteredPopularHalls = analytics.popularHalls?.filter((h: any) => {
    if (popularDistrictFilter === 'all') return true;
    const mapped = halls.find(hall => hall.name === h.name);
    return mapped?.district?.toLowerCase() === popularDistrictFilter.toLowerCase();
  }) || [];

  const chatDistricts = Array.from(new Set(
    chatContacts.flatMap((c: any) => c.halls?.map((h: any) => h.district) || []).filter(Boolean)
  )) as string[];

  const filteredChatContacts = chatContacts
    .filter(c => {
      const nameMatch = (c.firstName + ' ' + c.lastName).toLowerCase().includes(chatSearch.toLowerCase());
      const districtMatch = !chatDistrictFilter || c.halls?.some((h: any) => h.district === chatDistrictFilter);
      return nameMatch && districtMatch;
    })
    .sort((a, b) => {
      if (chatSortBy === 'district')
        return (a.halls?.[0]?.district || '').localeCompare(b.halls?.[0]?.district || '');
      return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
    });

  const stats = [
    { label: "Jami To'yxonalar", val: halls.length, icon: Building2, color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 10%, transparent)' },
    { label: 'Tasdiq Kutilmoqda', val: pendingHalls.length, icon: Calendar, color: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning) 10%, transparent)' },
    { label: 'Hamkor Egalar', val: owners.length, icon: Users, color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
    { label: 'Tizim Barqarorligi', val: '99.9%', icon: ShieldCheck, color: 'var(--success)', bg: 'color-mix(in srgb, var(--success) 10%, transparent)' },
  ];

  // ─── Calendar Renderer ─────────────────────────────────────────────────────

  const renderCalendar = () => {
    if (!selectedHall) return null;
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;
    const approvedBookings = hallBookings.filter(b => b.status === 'APPROVED' || b.status === 'UPCOMING');
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(day, 'd');
        const isCurrentMonth = isSameMonth(day, monthStart);
        const booking = approvedBookings.find(b => isSameDay(new Date(b.date), cloneDay));
        days.push(
          <div
            key={day.toString()}
            onClick={() => booking && setActiveBooking(booking)}
            className={`calendar-day cursor-pointer hover:bg-surface-hover ${!isCurrentMonth ? 'opacity-40' : ''} ${booking ? 'active' : ''}`}
          >
            <span className="font-semibold">{formattedDate}</span>
            {booking && <span className="text-xs font-bold text-primary mt-1 bg-accent/20 px-1 rounded">BAND</span>}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-1 mt-1" key={day.toString()}>{days}</div>);
      days = [];
    }
    return (
      <div className="w-full mt-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCalendarDate(subMonths(calendarDate, 1))} className="p-2 bg-surface-hover rounded-md hover:bg-accent/20 text-text border-none shadow-none">&lt;</button>
          <span className="font-serif font-bold text-primary text-lg">{format(calendarDate, 'MMMM yyyy')}</span>
          <button onClick={() => setCalendarDate(addMonths(calendarDate, 1))} className="p-2 bg-surface-hover rounded-md hover:bg-accent/20 text-text border-none shadow-none">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-text-muted text-sm mb-2">
          {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="border border-border rounded-md p-2 bg-surface">{rows}</div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────

  return (
    <div className="dashboard-layout">

      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="text-accent"><Sparkles size={20} /></div>
          <span>Admin</span>
        </div>

        <div className="sidebar-nav">
          <p>Katalog</p>
          {[
            { id: 'dashboard', label: 'Tizim Tahlili', icon: LayoutDashboard },
            { id: 'halls', label: "To'yxonalar", icon: Building2, count: pendingHalls.length },
            { id: 'owners', label: "To'yxona Egalari", icon: Users },
            { id: 'bookings', label: 'Barcha Bronlar', icon: BookOpen },
            { id: 'chat', label: 'Egalar Bilan Chat', icon: MessageSquare },
            { id: 'settings', label: 'Sozlamalar', icon: ShieldCheck }
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
                <span className="bg-warning text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 text-error hover:bg-error/10 hover:text-error bg-transparent border-none shadow-none justify-start px-4 py-3 rounded-md font-semibold transition-colors">
            <LogOut size={18} /> Tizimdan Chiqish
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">
          <div className="search-bar">
            <Search className="text-text-muted shrink-0" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: 0, boxShadow: 'none', fontSize: '0.95rem', color: 'var(--text)' }}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-surface border border-border p-2 pr-4 rounded-full">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : (user?.firstName?.slice(0, 2) || 'AD')}
              </div>
              <div className="flex flex-col">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold m-0 leading-none mb-1">Admin</p>
                <p className="text-sm font-bold text-primary m-0 leading-none">{user?.firstName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════ DASHBOARD TAB ══════════════ */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="mb-2">
              <h1 className="text-3xl font-serif text-primary m-0 mb-2 border-none">Tizim Tahlili</h1>
              <p className="text-text-muted m-0">Platformaning real vaqtdagi faollik ko'rsatkichlari.</p>
            </div>

            {/* Pending halls alert banner */}
            {pendingHalls.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-warning/20 text-warning flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primary m-0">{pendingHalls.length} ta to'yxona tasdiqlash kutmoqda</p>
                  <p className="text-sm text-text-muted m-0">To'yxona egalari yangi qo'shimchalar kiritdi. Iltimos, ko'rib chiqing.</p>
                </div>
                <button
                  onClick={() => setActiveTab('halls')}
                  className="btn-outline text-sm px-4 py-2 shadow-none whitespace-nowrap"
                >
                  Ko'rish →
                </button>
              </motion.div>
            )}

            <div className="stats-grid">
              {stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ color: s.color, backgroundColor: s.bg }}
                  >
                    <s.icon size={24} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-3xl font-bold text-primary m-0 leading-none">{s.val}</p>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-wider m-0 mt-2">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="analytics-grid">
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif text-primary m-0 border-none">Mijozlar Ro'yxatdan O'tishlari</h3>
                  <select
                    value={regYearFilter}
                    onChange={(e) => setRegYearFilter(e.target.value)}
                    className="p-2 border border-border rounded bg-surface-hover text-sm font-bold text-primary w-auto"
                  >
                    <option value="2026">Yil: 2026</option>
                    <option value="2025">Yil: 2025</option>
                    <option value="2024">Yil: 2024</option>
                  </select>
                </div>
                <div style={{ minHeight: '400px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredRegistrations}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif text-primary m-0 border-none">Eng Ommabop To'yxonalar</h3>
                  <select
                    value={popularDistrictFilter}
                    onChange={(e) => setPopularDistrictFilter(e.target.value)}
                    className="p-2 border border-border rounded bg-surface-hover text-sm font-bold text-primary w-auto"
                  >
                    <option value="all">Barcha tumanlar</option>
                    {uniqueDistricts.map(d => <option key={d} value={d}>{d} tumani</option>)}
                  </select>
                </div>
                <div style={{ minHeight: '400px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredPopularHalls} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={100} />
                      <RechartsTooltip cursor={{ fill: '#334155', opacity: 0.1 }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ HALLS TAB ══════════════ */}
        {activeTab === 'halls' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h2 className="text-3xl font-serif text-primary m-0 border-none pb-0">To'yxonalar</h2>
              <button onClick={openAddHallModal} className="btn-primary">
                <Plus size={18} /> Yangi To'yxona Qo'shish
              </button>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-3 p-4 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <Filter size={15} className="text-text-muted shrink-0" />
                <select
                  value={hallStatusFilter}
                  onChange={e => setHallStatusFilter(e.target.value as any)}
                  className="flex-1 p-2 border border-border rounded-md bg-surface-hover text-sm font-bold text-primary outline-none"
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="PENDING">Kutilmoqda</option>
                  <option value="APPROVED">Tasdiqlangan</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <select
                  value={hallDistrictFilter}
                  onChange={e => setHallDistrictFilter(e.target.value)}
                  className="flex-1 p-2 border border-border rounded-md bg-surface-hover text-sm font-bold text-primary outline-none"
                >
                  <option value="">Barcha tumanlar</option>
                  {uniqueDistricts.map(d => <option key={d} value={d}>{d} tumani</option>)}
                </select>
              </div>
              {/* Sort buttons */}
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                {(['price', 'capacity'] as const).map(field => (
                  <button
                    key={field}
                    onClick={() => {
                      if (hallSortField === field) setHallSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                      else { setHallSortField(field); setHallSortOrder('asc'); }
                    }}
                    className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md border bg-transparent shadow-none font-semibold transition-colors
                      ${hallSortField === field ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:border-accent hover:text-accent'}`}
                  >
                    {field === 'price' ? 'Narx' : "Sig'im"}
                    {hallSortField === field
                      ? (hallSortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
                      : <ArrowUpDown size={14} />}
                  </button>
                ))}
                {(hallStatusFilter !== 'all' || hallDistrictFilter || hallSortField !== 'none') && (
                  <button
                    onClick={() => { setHallStatusFilter('all'); setHallDistrictFilter(''); setHallSortField('none'); }}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md border border-error/30 bg-transparent shadow-none"
                  >
                    <X size={14} /> Tozalash
                  </button>
                )}
              </div>
            </div>

            <div className="table-wrapper">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Nomi</th>
                    <th>Tumani</th>
                    <th>Sig'imi</th>
                    <th>Narx/kishi</th>
                    <th>Holati</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHalls.map((hall) => (
                    <tr key={hall.id}>
                      <td
                        onClick={() => openHallDetails(hall)}
                        className="cursor-pointer font-bold text-primary hover:text-accent"
                      >
                        {hall.name}
                      </td>
                      <td>{hall.district}</td>
                      <td>{hall.capacity} kishi</td>
                      <td>{(hall.pricePerSeat || 0).toLocaleString()} so'm</td>
                      <td>
                        <span className={hall.status === 'APPROVED' ? 'badge-approved' : 'badge-pending'}>
                          {hall.status === 'APPROVED' ? 'Tasdiqlangan' : 'Kutilmoqda'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {hall.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleApproveHall(hall.id)} className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded hover:bg-success/20 border-none shadow-none text-xs font-bold" title="Tasdiqlash">
                                <CheckCircle size={14} /> Tasdiq
                              </button>
                              <button onClick={() => handleRejectHall(hall.id, hall.name)} className="flex items-center gap-1 px-2 py-1 bg-error/10 text-error rounded hover:bg-error/20 border-none shadow-none text-xs font-bold" title="Rad etish">
                                <X size={14} /> Rad
                              </button>
                            </>
                          )}
                          <button onClick={() => openEditHallModal(hall)} className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20 border-none shadow-none" title="Tahrirlash">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDeleteHall(hall.id)} className="p-2 bg-error/10 text-error rounded hover:bg-error/20 border-none shadow-none" title="O'chirish">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredHalls.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-text-muted font-bold">Hech qanday to'yxona topilmadi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════ OWNERS TAB ══════════════ */}
        {activeTab === 'owners' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h2 className="text-3xl font-serif text-primary m-0 border-none pb-0">To'yxona Egalari</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsOwnerModalOpen(true)} className="btn-primary">
                  <Plus size={18} /> Yangi Ega Qo'shish
                </button>
                <select
                  value={ownerDistrictFilter}
                  onChange={e => setOwnerDistrictFilter(e.target.value)}
                  className="p-2 border border-border rounded-md bg-surface text-sm font-bold text-primary outline-none"
                >
                  <option value="">Barcha tumanlar</option>
                  {uniqueDistricts.map(d => <option key={d} value={d}>{d} tumani</option>)}
                </select>
                {ownerDistrictFilter && (
                  <button
                    onClick={() => setOwnerDistrictFilter('')}
                    className="p-2 text-sm text-error hover:bg-error/10 rounded-md border border-error/30 bg-transparent shadow-none"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOwners.map((owner) => (
                <div
                  key={owner.id}
                  onClick={() => setSelectedOwner(owner)}
                  className="card flex items-center gap-5 cursor-pointer hover:-translate-y-1 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
                    {owner.avatarUrl
                      ? <img src={owner.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      : <span>{owner.firstName[0]}</span>}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-primary m-0 border-none pb-0">{owner.firstName} {owner.lastName}</h3>
                    <p className="text-sm text-text m-0">{owner.phone}</p>
                    <p className="text-xs text-text-muted mt-1 bg-surface-hover px-2 py-1 rounded-md inline-block">
                      {owner.halls?.length || 0} ta To'yxonasi bor
                    </p>
                  </div>
                </div>
              ))}
              {filteredOwners.length === 0 && (
                <div className="col-span-full p-10 text-center text-text-muted bg-surface border border-border rounded-lg">
                  To'yxona egalari topilmadi
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ BOOKINGS TAB ══════════════ */}
        {activeTab === 'bookings' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h2 className="text-3xl font-serif text-primary m-0 border-none pb-0">Barcha Bronlar</h2>
              <button onClick={fetchAllBookings} className="btn-outline flex items-center gap-2 text-sm shadow-none">
                <ArrowUpDown size={15} /> Yangilash
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 p-4 bg-surface border border-border rounded-xl">
              <select
                value={bookingStatusFilter}
                onChange={e => setBookingStatusFilter(e.target.value)}
                style={{ width: 'auto', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--surface-hover)', outline: 'none', boxShadow: 'none' }}
              >
                <option value="all">Barcha holatlar</option>
                <option value="PENDING">Kutilmoqda</option>
                <option value="APPROVED">Tasdiqlangan</option>
                <option value="UPCOMING">Kelayotgan</option>
                <option value="COMPLETED">Tugallangan</option>
                <option value="CANCELLED">Bekor qilingan</option>
                <option value="upcoming">Endi bo'ladigan</option>
                <option value="past">Bo'lib o'tgan</option>
              </select>
              <input
                type="text"
                placeholder="To'yxona nomi..."
                value={bookingHallFilter}
                onChange={e => setBookingHallFilter(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text)', background: 'var(--surface)', outline: 'none', boxShadow: 'none', width: '180px' }}
              />
              <select
                value={bookingDistrictFilter}
                onChange={e => setBookingDistrictFilter(e.target.value)}
                style={{ width: 'auto', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--surface-hover)', outline: 'none', boxShadow: 'none' }}
              >
                <option value="">Barcha tumanlar</option>
                {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <button
                onClick={() => setBookingDateOrder(o => o === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-accent text-accent bg-accent/10 shadow-none font-semibold"
              >
                Sana {bookingDateOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {(bookingStatusFilter !== 'all' || bookingHallFilter || bookingDistrictFilter) && (
                <button
                  onClick={() => { setBookingStatusFilter('all'); setBookingHallFilter(''); setBookingDistrictFilter(''); }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-md border border-error/30 bg-transparent shadow-none"
                >
                  <X size={14} /> Tozalash
                </button>
              )}
            </div>

            {bookingsLoading ? (
              <div className="p-10 text-center text-text-muted">Yuklanmoqda...</div>
            ) : (
              <div className="table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Bron ID</th>
                      <th>To'yxona</th>
                      <th>Tuman</th>
                      <th>Sana</th>
                      <th>Sig'im</th>
                      <th>Mijoz</th>
                      <th>Holati</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => {
                      const isPast = new Date(b.date) < now;
                      const statusLabel: Record<string, string> = {
                        PENDING: 'Kutilmoqda', APPROVED: 'Tasdiqlangan',
                        UPCOMING: 'Kelayotgan', COMPLETED: 'Tugallangan',
                        CANCELLED: 'Bekor', REJECTED: 'Rad etilgan'
                      };
                      const statusColor: Record<string, string> = {
                        PENDING: 'badge-pending', APPROVED: 'badge-approved',
                        UPCOMING: 'badge-approved', COMPLETED: 'badge-approved',
                        CANCELLED: 'badge-error', REJECTED: 'badge-error'
                      };
                      return (
                        <tr key={b.id}>
                          <td className="font-mono text-xs text-text-muted">{b.id.slice(0, 8)}…</td>
                          <td className="font-bold text-primary">{b.hall?.name}</td>
                          <td>{b.hall?.district}</td>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{format(new Date(b.date), 'dd.MM.yyyy')}</span>
                              <span className={`text-xs font-semibold ${isPast ? 'text-text-muted' : 'text-success'}`}>
                                {isPast ? "Bo'lib o'tgan" : "Endi bo'ladigan"}
                              </span>
                            </div>
                          </td>
                          <td>{b.seats} kishi</td>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{b.user?.firstName} {b.user?.lastName}</span>
                              <span className="text-xs text-text-muted">{b.user?.phone}</span>
                            </div>
                          </td>
                          <td>
                            <span className={statusColor[b.status] || 'badge-pending'}>
                              {statusLabel[b.status] || b.status}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              {b.status === 'PENDING' && (
                                <button
                                  onClick={() => handleApproveBooking(b.id)}
                                  className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded hover:bg-success/20 border-none shadow-none text-xs font-bold"
                                  title="Tasdiqlash"
                                >
                                  <CheckCircle size={13} /> Tasdiq
                                </button>
                              )}
                              {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="flex items-center gap-1 px-2 py-1 bg-error/10 text-error rounded hover:bg-error/20 border-none shadow-none text-xs font-bold"
                                  title="Bekor qilish"
                                >
                                  <Ban size={13} /> Bekor
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center p-10 text-text-muted font-bold">
                          Hech qanday bron topilmadi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-sm text-text-muted m-0">Jami: {filteredBookings.length} ta bron</p>
          </div>
        )}

        {/* ══════════════ SETTINGS TAB ══════════════ */}
        {activeTab === 'settings' && (
          <div className="card max-w-2xl animate-fade-in">
            <h2 className="text-2xl font-serif text-primary mb-6 m-0 border-none pb-0">Admin Sozlamalari</h2>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 mt-6">
              {/* Avatar Preview */}
              {profileForm.avatarUrl && (
                <div className="flex items-center gap-4 p-4 bg-surface-hover rounded-xl border border-border">
                  <img
                    src={profileForm.avatarUrl}
                    alt="avatar preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-accent"
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <p className="font-bold text-primary m-0">Profil rasmi ko'rinishi</p>
                    <p className="text-sm text-text-muted m-0">Avatar URL to'g'ri bo'lsa, rasm yuqorida ko'rinadi</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label>Ism</label>
                  <input type="text" value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label>Familiya</label>
                  <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label>Rasm URL (Avatar)</label>
                <input
                  type="text"
                  value={profileForm.avatarUrl}
                  onChange={e => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label>Yangi Parol</label>
                <input
                  type="password"
                  value={profileForm.password}
                  onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                  placeholder="O'zgartirish uchun kiriting..."
                />
              </div>
              <button type="submit" className="mt-4 self-start">Saqlash</button>
            </form>
          </div>
        )}

        {/* ══════════════ CHAT TAB ══════════════ */}
        {activeTab === 'chat' && (
          <div className="flex flex-col gap-4 animate-fade-in" style={{ height: 'calc(100vh - 160px)' }}>
            <h2 className="text-3xl font-serif text-primary m-0 border-none pb-0 shrink-0">
              To'yxona Egalari Bilan Chat
            </h2>

            <div className="flex gap-4 flex-1 min-h-0">
              {/* Contacts Sidebar */}
              <div className="w-72 shrink-0 flex flex-col bg-surface border border-border rounded-xl overflow-hidden">
                <div className="p-3 border-b border-border flex flex-col gap-2 shrink-0">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      value={chatSearch}
                      onChange={e => setChatSearch(e.target.value)}
                      placeholder="Ism bo'yicha qidirish..."
                      className="w-full pl-8 pr-3 py-2 bg-surface-hover border border-border rounded-lg text-sm outline-none focus:border-accent text-text"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={chatDistrictFilter}
                      onChange={e => setChatDistrictFilter(e.target.value)}
                      className="flex-1 py-1.5 px-2 bg-surface-hover border border-border rounded-lg text-xs font-bold text-primary outline-none"
                    >
                      <option value="">Barcha tumanlar</option>
                      {chatDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select
                      value={chatSortBy}
                      onChange={e => setChatSortBy(e.target.value as any)}
                      className="flex-1 py-1.5 px-2 bg-surface-hover border border-border rounded-lg text-xs font-bold text-primary outline-none"
                    >
                      <option value="name">Ism bo'yicha</option>
                      <option value="district">Tuman bo'yicha</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredChatContacts.length === 0 && (
                    <div className="p-8 text-center text-text-muted">
                      <Users size={32} className="opacity-20 mx-auto mb-2" />
                      <p className="text-sm font-bold m-0">Hech kim topilmadi</p>
                    </div>
                  )}
                  {filteredChatContacts.map(contact => (
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
                          {contact.halls?.[0]?.district ? `${contact.halls[0].district} tumani` : "To'yxona egasi"}
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
                </div>
              </div>

              {/* Chat Area */}
              {chatActiveContact ? (
                <div className="flex-1 flex flex-col overflow-hidden min-h-0" style={{ background: 'var(--surface)' }}>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center gap-3 bg-surface-hover shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden text-sm">
                      {chatActiveContact.avatarUrl
                        ? <img src={chatActiveContact.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : <span>{chatActiveContact.firstName[0]}</span>}
                    </div>
                    <div>
                      <p className="font-bold text-primary m-0 leading-none mb-1">
                        {chatActiveContact.firstName} {chatActiveContact.lastName}
                      </p>
                      <p className="text-xs text-text-muted m-0">
                        To'yxona Egasi
                        {chatActiveContact.halls?.length > 0
                          ? ` • ${chatActiveContact.halls.map((h: any) => h.district).join(', ')} tumani`
                          : ''}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0"
                    style={{ background: 'var(--background)' }}
                  >
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
                        <MessageSquare size={40} className="opacity-20" />
                        <p className="font-bold m-0">Muloqotni boshlang!</p>
                        <p className="text-sm m-0">Birinchi xabarni yuboring.</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                          <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm
                              ${isMine
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-surface text-text border border-border rounded-bl-sm'}`}
                            >
                              <p className="text-sm m-0">{msg.content}</p>
                              <p className={`text-xs mt-1 m-0 ${isMine ? 'text-white/60' : 'text-text-muted'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatMessagesEndRef} />
                  </div>

                  {/* Message Input */}
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
                  <h3 className="text-xl font-serif text-primary mb-2 m-0">Admin Chat</h3>
                  <p className="text-sm m-0">Chap tomondagi ro'yxatdan to'yxona egasini tanlang</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ═══════════════════ OWNER DETAIL MODAL ═══════════════════ */}
      <AnimatePresence>
        {selectedOwner && (
          <div className="fixed-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface relative border-2 border-accent/30 rounded-2xl p-8 shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedOwner(null)}
                className="absolute top-4 right-4 p-2 bg-surface-hover rounded-full hover:bg-error/10 hover:text-error transition-colors border-none shadow-none"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mb-6 mt-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 overflow-hidden border-2 border-accent shadow-md">
                  {selectedOwner.avatarUrl
                    ? <img src={selectedOwner.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <Users size={40} />}
                </div>
                <h3 className="text-2xl font-serif text-primary m-0 mb-1 border-none pb-0">
                  {selectedOwner.firstName} {selectedOwner.lastName}
                </h3>
                <p className="text-text-muted text-sm font-bold m-0 bg-surface-hover px-3 py-1 rounded-full inline-block">
                  To'yxona Egasi
                </p>
              </div>

              {/* Info Grid */}
              <div className="flex flex-col gap-2 mb-6">
                {[
                  { label: 'Telefon', value: selectedOwner.phone },
                  { label: 'Email', value: selectedOwner.email },
                  { label: 'Username', value: selectedOwner.username },
                  {
                    label: "Ro'yxatdan o'tgan",
                    value: selectedOwner.createdAt
                      ? new Date(selectedOwner.createdAt).toLocaleDateString('uz-UZ')
                      : '-'
                  },
                ].map(info => (
                  <div key={info.label} className="flex justify-between items-center p-3 bg-surface-hover rounded-lg border border-border">
                    <span className="text-sm text-text-muted">{info.label}:</span>
                    <span className="font-bold text-primary text-sm">{info.value || '-'}</span>
                  </div>
                ))}
              </div>

              {/* Halls list */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wide border-b border-border pb-2 m-0">
                  Tegishli To'yxonalar Ro'yxati
                </h4>
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2">
                  {halls.filter(h => h.ownerId === selectedOwner.id).map(hall => (
                    <div key={hall.id} className="flex justify-between items-center p-3 bg-surface-hover rounded-lg border border-border">
                      <div>
                        <p className="font-bold text-primary m-0">{hall.name}</p>
                        <p className="text-xs text-text-muted m-0">{hall.district} tumani</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${hall.status === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {hall.status === 'APPROVED' ? 'Tasdiqlangan' : 'Kutilmoqda'}
                      </span>
                    </div>
                  ))}
                  {halls.filter(h => h.ownerId === selectedOwner.id).length === 0 && (
                    <p className="text-sm text-text-muted m-0 p-4 text-center bg-surface-hover rounded-lg border border-border border-dashed">
                      Hali hech qanday to'yxona qo'shilmagan.
                    </p>
                  )}
                </div>

                <div className="mt-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleDeleteOwner(selectedOwner.id)}
                    className="w-full flex justify-center items-center gap-2 bg-error/10 text-error hover:bg-error/20 border-none py-3 rounded-md font-bold transition-colors shadow-none"
                  >
                    <Trash2 size={18} /> Egani O'chirish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ HALL DETAIL MODAL ═══════════════════ */}
      <AnimatePresence>
        {selectedHall && (
          <div className="fixed-overlay z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface relative border border-border rounded-xl p-6 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-2xl font-serif text-primary m-0 flex items-center gap-3">
                  <Building2 className="text-accent shrink-0" /> To'yxona Tafsilotlari & Taqvim
                </h3>
                <button
                  onClick={() => setSelectedHall(null)}
                  className="shrink-0 p-2 bg-surface-hover rounded-full hover:text-error transition-colors border-none shadow-none ml-4"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                  {/* Hall Info */}
                  <div className="bg-surface-hover p-5 rounded-xl border border-border">
                    <p className="text-xl font-bold text-primary m-0 mb-1">{selectedHall.name}</p>
                    <p className="text-sm text-text-muted mb-4">{selectedHall.address}</p>
                    <div className="flex gap-4">
                      <div className="bg-surface px-3 py-2 rounded-md border border-border text-sm flex-1">
                        <span className="text-text-muted block text-xs uppercase mb-1">Tuman</span>
                        <span className="font-bold text-primary">{selectedHall.district}</span>
                      </div>
                      <div className="bg-surface px-3 py-2 rounded-md border border-border text-sm flex-1">
                        <span className="text-text-muted block text-xs uppercase mb-1">Sig'im</span>
                        <span className="font-bold text-primary">{selectedHall.capacity} ta</span>
                      </div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="bg-surface-hover p-5 rounded-xl border border-border">
                    <p className="text-sm font-bold text-text-muted uppercase tracking-wide mb-4">To'yxona Egasi</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {selectedHall.owner ? selectedHall.owner.firstName[0] : 'U'}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-bold text-primary m-0">
                          {selectedHall.owner
                            ? `${selectedHall.owner.firstName} ${selectedHall.owner.lastName}`
                            : "Noma'lum"}
                        </p>
                        <p className="text-sm text-text-muted m-0">
                          {selectedHall.owner ? selectedHall.owner.phone : "Noma'lum"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Detail Panel */}
                  {activeBooking ? (
                    <div className="bg-accent/10 p-5 rounded-xl border border-accent/30 relative animate-fade-in">
                      <div className="flex justify-between items-center mb-3 border-b border-accent/20 pb-2">
                        <p className="font-bold text-primary m-0 uppercase text-xs tracking-wide">Bandlik Tafsilotlari</p>
                        <button
                          onClick={() => setActiveBooking(null)}
                          className="p-1 hover:bg-accent/20 rounded-full text-primary border-none shadow-none"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 text-sm">
                        <p
                          onClick={() => setSelectedUser(activeBooking.user)}
                          className="font-bold text-primary hover:text-accent cursor-pointer transition-colors m-0 text-base"
                        >
                          Mijoz: {activeBooking.user.firstName} {activeBooking.user.lastName}
                        </p>
                        <p className="text-text-muted m-0 mb-2">Telefon: {activeBooking.user.phone}</p>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div className="bg-surface p-2 rounded border border-border">
                            <span className="text-xs text-text-muted block">Mehmonlar:</span>
                            <span className="font-bold">{activeBooking.seats} ta</span>
                          </div>
                          <div className="bg-surface p-2 rounded border border-border">
                            <span className="text-xs text-text-muted block">Sana:</span>
                            <span className="font-bold">{format(new Date(activeBooking.date), 'dd.MM.yyyy')}</span>
                          </div>
                          <div className="bg-surface p-2 rounded border border-border">
                            <span className="text-xs text-text-muted block">Jami summa:</span>
                            <span className="font-bold text-success">{activeBooking.totalPrice?.toLocaleString()} UZS</span>
                          </div>
                          <div className="bg-surface p-2 rounded border border-border">
                            <span className="text-xs text-text-muted block">Avans to'lov:</span>
                            <span className="font-bold text-primary">{activeBooking.advancePayment?.toLocaleString()} UZS</span>
                          </div>
                        </div>
                        {activeBooking.services && activeBooking.services.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-text-muted uppercase mb-1">Qo'shimcha Xizmatlar:</p>
                            <div className="flex flex-wrap gap-1">
                              {activeBooking.services.map((s: any) => (
                                <span key={s.id} className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {s.service.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-hover p-5 rounded-xl border border-border border-dashed text-center text-sm text-text-muted flex items-center justify-center min-h-[100px]">
                      Taqvimdagi yashil rangli band kunlarni bossangiz, mijoz tafsilotlari shu yerda ko'rinadi.
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-2">
                    {selectedHall.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveHall(selectedHall.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-success text-white hover:bg-emerald-600 border-none py-3 rounded-md font-bold transition-colors shadow"
                        >
                          <CheckCircle size={18} /> Tasdiqlash
                        </button>
                        <button
                          onClick={() => handleRejectHall(selectedHall.id, selectedHall.name)}
                          className="flex-1 flex items-center justify-center gap-2 bg-error/10 text-error hover:bg-error/20 border-none py-3 rounded-md font-bold transition-colors shadow-none"
                        >
                          <X size={18} /> Rad Etish
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteHall(selectedHall.id)}
                      className="w-full flex items-center justify-center gap-2 bg-error/10 text-error hover:bg-error/20 border-none py-3 rounded-md font-bold transition-colors shadow-none"
                    >
                      <Trash2 size={18} /> To'yxonani O'chirish
                    </button>
                  </div>
                </div>

                {/* Calendar */}
                <div className="flex flex-col">
                  {renderCalendar()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ USER DETAIL MODAL ═══════════════════ */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed-overlay z-[60]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface relative border-2 border-primary/30 rounded-2xl p-8 shadow-2xl max-w-sm w-full"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2 bg-surface-hover rounded-full hover:bg-primary/10 hover:text-primary transition-colors border-none shadow-none"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mb-6 mt-4">
                <div className="w-24 h-24 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-4 overflow-hidden border-2 border-accent shadow-md">
                  {selectedUser.avatarUrl
                    ? <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <UserIcon size={40} />}
                </div>
                <h3 className="text-2xl font-serif text-primary m-0 mb-1 border-none pb-0">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-text-muted text-sm font-bold m-0 bg-surface-hover px-3 py-1 rounded-full inline-block">
                  Mijoz (Foydalanuvchi)
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { label: 'Telefon raqami', value: selectedUser.phone },
                  { label: 'Rol', value: 'Foydalanuvchi' },
                  { label: 'Balans (Hamyon)', value: `${(selectedUser.balance || 0).toLocaleString()} UZS` },
                ].map(info => (
                  <div key={info.label} className="flex justify-between items-center p-3 bg-surface-hover rounded-lg border border-border">
                    <span className="text-sm text-text-muted">{info.label}:</span>
                    <span className="font-bold text-primary">{info.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ ADD / EDIT HALL MODAL ═══════════════════ */}
      <AnimatePresence>
        {isHallModalOpen && (
          <div className="fixed-overlay z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface relative border border-border rounded-xl p-8 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h3 className="text-2xl font-serif text-primary m-0 flex items-center gap-3">
                  <Building2 className="text-accent shrink-0" />
                  {editingHall ? "To'yxonani tahrirlash" : "Yangi to'yxona qo'shish"}
                </h3>
                <button
                  onClick={() => setIsHallModalOpen(false)}
                  className="shrink-0 p-2 bg-surface-hover rounded-full hover:text-error transition-colors border-none shadow-none ml-4"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveHall} className="flex flex-col gap-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label>To'yxona Nomi *</label>
                    <input type="text" value={hallForm.name} onChange={e => setHallForm({ ...hallForm, name: e.target.value })} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Tuman *</label>
                    <select value={hallForm.district} onChange={e => setHallForm({ ...hallForm, district: e.target.value })}>
                      {["Yunusobod", "Mirobod", "Chilonzor", "Mirzo Ulug'bek", "Shayxontohur", "Uchtepa", "Yashnobod", "Olmazor", "Sergeli", "Yakkasaroy", "Bektemir", "Yangihayot"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Owner */}
                <div className="flex flex-col gap-2">
                  <label>To'yxona Egasi (Hamkor)</label>
                  <select value={hallForm.ownerId} onChange={e => setHallForm({ ...hallForm, ownerId: e.target.value })}>
                    <option value="">Tegishli emas (Tizimga tegishli)</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.firstName} {o.lastName} ({o.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label>Manzil *</label>
                  <input type="text" value={hallForm.address} onChange={e => setHallForm({ ...hallForm, address: e.target.value })} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-2">
                    <label>Sig'im (Odam) *</label>
                    <input type="number" value={hallForm.capacity} onChange={e => setHallForm({ ...hallForm, capacity: e.target.value })} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>O'rindiq Narxi (UZS) *</label>
                    <input type="number" value={hallForm.pricePerSeat} onChange={e => setHallForm({ ...hallForm, pricePerSeat: e.target.value })} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Telefon *</label>
                    <input type="text" value={hallForm.phone} onChange={e => setHallForm({ ...hallForm, phone: e.target.value })} placeholder="+998901234567" required />
                  </div>
                </div>

                {/* Images */}
                <div className="flex flex-col gap-3 bg-surface-hover p-5 rounded-xl border border-border mt-2">
                  <label className="text-primary mb-1 border-b border-border/50 pb-2">To'yxona Rasmlari (Maksimum 3 ta)</label>
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-center">
                      <input
                        type="text"
                        value={hallForm.images[idx]}
                        onChange={e => {
                          const imgs = [...hallForm.images];
                          imgs[idx] = e.target.value;
                          setHallForm({ ...hallForm, images: imgs });
                        }}
                        placeholder={`Rasm URL #${idx + 1}`}
                        className="flex-1"
                      />
                      <label className="flex items-center gap-2 min-w-[120px] m-0 text-sm font-bold cursor-pointer normal-case tracking-normal">
                        <input
                          type="checkbox"
                          checked={hallForm.images360[idx]}
                          onChange={e => {
                            const n = [...hallForm.images360];
                            n[idx] = e.target.checked;
                            setHallForm({ ...hallForm, images360: n });
                          }}
                          className="w-5 h-5 accent-primary"
                        />
                        360° Rasm
                      </label>
                    </div>
                  ))}
                </div>

                {/* Services */}
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex justify-between items-center border-b border-border pb-2 mb-2">
                    <label className="m-0 text-primary">Xizmatlar ro'yxati</label>
                    <button type="button" onClick={addServiceField} className="btn-outline py-1.5 px-4 text-xs shadow-none">
                      + Xizmat Qo'shish
                    </button>
                  </div>
                  {hallForm.services.map((service, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-center p-3 bg-surface-hover rounded-lg border border-border">
                      <input
                        type="text"
                        value={service.name}
                        onChange={e => {
                          const s = [...hallForm.services];
                          s[idx].name = e.target.value;
                          setHallForm({ ...hallForm, services: s });
                        }}
                        placeholder="Xizmat nomi"
                        className="flex-1"
                        required
                      />
                      <input
                        type="number"
                        value={service.price}
                        onChange={e => {
                          const s = [...hallForm.services];
                          s[idx].price = e.target.value;
                          setHallForm({ ...hallForm, services: s });
                        }}
                        placeholder="Narxi"
                        className="w-full md:w-40"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeServiceField(idx)}
                        className="p-3 bg-error/10 text-error hover:bg-error/20 rounded-md border-none shadow-none w-full md:w-auto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {hallForm.services.length === 0 && (
                    <p className="text-sm text-text-muted text-center p-4 bg-surface-hover rounded-lg border border-border border-dashed">
                      Hozircha qo'shimcha xizmatlar qo'shilmagan.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-border">
                  <button type="button" onClick={() => setIsHallModalOpen(false)} className="btn-outline">Bekor qilish</button>
                  <button type="submit">
                    {editingHall ? "O'zgarishlarni saqlash" : "To'yxonani yaratish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════ OWNER CREATION MODAL ══════════════ */}
      <AnimatePresence>
        {isOwnerModalOpen && (
          <div className="fixed-overlay z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface relative border border-border rounded-xl p-8 shadow-2xl max-w-lg w-full"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h3 className="text-2xl font-serif text-primary m-0 flex items-center gap-3">
                  <Users className="text-accent shrink-0" size={24} /> Yangi To'yxona Egasi
                </h3>
                <button onClick={() => setIsOwnerModalOpen(false)} className="shrink-0 p-2 bg-surface-hover rounded-full hover:text-error border-none shadow-none ml-4">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateOwner} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label>Ism *</label>
                    <input type="text" value={ownerForm.firstName} onChange={e => setOwnerForm({ ...ownerForm, firstName: e.target.value })} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Familiya *</label>
                    <input type="text" value={ownerForm.lastName} onChange={e => setOwnerForm({ ...ownerForm, lastName: e.target.value })} required />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label>Email *</label>
                  <input type="email" value={ownerForm.email} onChange={e => setOwnerForm({ ...ownerForm, email: e.target.value })} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label>Telefon *</label>
                  <input type="text" placeholder="+998901234567" value={ownerForm.phone} onChange={e => setOwnerForm({ ...ownerForm, phone: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label>Username *</label>
                    <input type="text" value={ownerForm.username} onChange={e => setOwnerForm({ ...ownerForm, username: e.target.value })} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Parol *</label>
                    <input type="password" value={ownerForm.password} onChange={e => setOwnerForm({ ...ownerForm, password: e.target.value })} required />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-border">
                  <button type="button" onClick={() => setIsOwnerModalOpen(false)} className="btn-outline">Bekor qilish</button>
                  <button type="submit">Qo'shish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
