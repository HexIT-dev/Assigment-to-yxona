import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Send, Search, User, Ban, HelpCircle,
  MessageSquare, ArrowLeft, X as CloseIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-select contact from navigation state (e.g., from UserBookings)
  useEffect(() => {
    const preselect = (location.state as any)?.ownerId;
    if (preselect && contacts.length > 0) {
      const found = contacts.find(c => c.id === preselect);
      if (found) setActiveContact(found);
    }
  }, [contacts, location.state]);

  useEffect(() => {
    if (activeContact) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContacts = async () => {
    try {
      // getAvailableContacts endpoint from backend returns appropriate contacts based on role
      const res = await api.get('/messages/contacts');
      setContacts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    if (!activeContact) return;
    try {
      const res = await api.get(`/messages?otherUserId=${activeContact.id}`);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    try {
      const res = await api.post('/messages', {
        receiverId: activeContact.id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xabar yuborishda xatolik');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBlockUser = async () => {
     if (!activeContact) return;
     if (!window.confirm(`${activeContact.firstName}ni bloklamoqchimisiz?`)) return;
     try {
        await api.post(`/messages/block/${activeContact.id}`);
        toast.success('Foydalanuvchi bloklandi');
        setActiveContact(null);
        fetchContacts();
     } catch (error: any) {
        toast.error(error.response?.data?.message || 'Xatolik');
     }
  };

  const uniqueDistricts = Array.from(new Set(
    contacts.flatMap(c => c.halls?.map((h: any) => h.district) || []).filter(Boolean)
  )) as string[];

  const filteredContacts = contacts
    .filter(c => {
      const nameMatch = (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchQuery.toLowerCase());
      const districtMatch = selectedDistrict === '' || 
        (c.halls && c.halls.some((h: any) => h.district.toLowerCase() === selectedDistrict.toLowerCase()));
      return nameMatch && districtMatch;
    })
    .sort((a, b) => {
      const nameA = a.firstName + ' ' + a.lastName;
      const nameB = b.firstName + ' ' + b.lastName;
      return nameA.localeCompare(nameB);
    });

  return (
    <div className="flex flex-col animate-fade-in" style={{ flex: 1, minHeight: 0 }}>
      <div className="flex flex-1 min-h-0 bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
        
        {/* Sidebar */}
        <div className="w-80 shrink-0 flex flex-col border-r border-border" style={{ background: 'var(--surface)' }}>
          <div className="p-3 border-b border-border flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary m-0">Aloqa</h2>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-primary bg-transparent border-none shadow-none p-1 rounded font-semibold"
                title="Orqaga"
              >
                <ArrowLeft size={16} /> Orqaga
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} style={{ zIndex: 1 }} />
                <input
                  type="text"
                  placeholder="Ism bo'yicha qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg text-sm focus:border-accent outline-none text-text"
                  style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingTop: '0.45rem', paddingBottom: '0.45rem' }}
                />
              </div>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', padding: '0.3rem 0.5rem', boxShadow: 'none', cursor: 'pointer' }}
              >
                <option value="">Barcha tumanlar</option>
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`chat-contact-btn ${activeContact?.id === contact.id ? 'selected' : ''}`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0 text-white text-sm"
                  style={{ background: 'var(--primary)', minWidth: '2.5rem' }}>
                  {contact.avatarUrl
                    ? <img src={contact.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : (contact.firstName?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate m-0" style={{ color: 'var(--text)' }}>
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-xs truncate m-0" style={{ color: 'var(--text-muted)' }}>
                    {contact.role === 'ADMIN' ? 'Administrator' :
                      contact.role === 'OWNER' ? `Ega${contact.halls?.length > 0 ? ` · ${contact.halls[0].district}` : ''}` : 'Mijoz'}
                  </p>
                </div>
                {contact.unreadCount > 0 && (
                  <span className="text-xs font-bold text-white rounded-full px-1.5 py-0.5 shrink-0"
                    style={{ background: 'var(--primary)', minWidth: '1.25rem', textAlign: 'center' }}>
                    {contact.unreadCount}
                  </span>
                )}
              </button>
            ))}
            {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {user?.role === 'USER'
                  ? "Bron qilgan to'yxona egalari bu yerda ko'rinadi"
                  : user?.role === 'OWNER'
                  ? 'Sizning to\'yxonangizni bron qilgan mijozlar bu yerda ko\'rinadi'
                  : 'Hech qanday kontakt topilmadi'}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeContact ? (
          <div className="flex-1 flex flex-col bg-surface min-w-0 h-full">
            {/* Chat Header */}
            <header className="p-4 border-b border-border flex justify-between items-center bg-surface shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden">
                  {activeContact.avatarUrl ? <img src={activeContact.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User size={20} />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-primary m-0 leading-tight border-none pb-0">{activeContact.firstName} {activeContact.lastName}</h2>
                  <p className="text-xs text-text-muted m-0">{activeContact.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 {user?.role === 'OWNER' && activeContact.role === 'USER' && (
                    <button 
                       onClick={handleBlockUser}
                       className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-error hover:bg-error/10 rounded-md border border-error/20 bg-transparent shadow-none"
                       title="Ushbu foydalanuvchini bloklash"
                    >
                       <Ban size={14} /> Bloklash
                    </button>
                 )}
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-surface-hover">
              {messages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2">
                    <MessageSquare size={48} className="opacity-25" />
                    <p className="font-bold m-0 text-sm">Muloqotni boshlang!</p>
                 </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm
                        ${isMine ? 'bg-primary text-white rounded-br-none' : 'bg-surface text-text border border-border rounded-bl-none'}`}
                      >
                        <p className="text-sm m-0 leading-normal">{msg.content}</p>
                        <p className={`text-[10px] text-right mt-1 m-0 ${isMine ? 'text-white/70' : 'text-text-muted'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-surface shrink-0">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Xabaringizni yozing..."
                  className="flex-1 bg-surface-hover border border-border rounded-full text-sm focus:border-accent outline-none text-text"
                  style={{ paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed border-none shadow shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-surface-hover text-text-muted">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
               <HelpCircle size={40} className="text-primary/40" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-1 m-0">Xush Kelibsiz!</h3>
            <p className="text-sm m-0">Muloqotni boshlash uchun chap tomondagi ro'yxatdan suhbatdoshni tanlang.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatPage;
