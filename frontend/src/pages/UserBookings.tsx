import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Ban, X, Edit3, Sparkles, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const UserBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Booking Modal States
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [editSeats, setEditSeats] = useState(100);
  const [editDate, setEditDate] = useState('');
  const [editServices, setEditServices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Ma'lumotlarni yuklashda xatolik");
    }
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu bronni bekor qilmoqchimisiz?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Bron bekor qilindi');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const openEditModal = (booking: any) => {
    setSelectedBooking(booking);
    setEditSeats(booking.seats);
    setEditDate(new Date(booking.date).toISOString().split('T')[0]);
    setEditServices(booking.services.map((s: any) => s.service.id));
  };

  const closeEditModal = () => {
    setSelectedBooking(null);
  };

  const handleEditSave = async () => {
    if (!selectedBooking) return;
    if (!editDate) {
      toast.error('Iltimos, tadbir sanasini tanlang');
      return;
    }
    if (editSeats < 50) {
      toast.error("Minimal mehmonlar soni 50 ta bo'lishi kerak");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/bookings/${selectedBooking.id}`, {
        seats: editSeats,
        date: editDate,
        serviceIds: editServices
      });
      toast.success('Bron muvaffaqiyatli o\'zgartirildi');
      closeEditModal();
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

  // Recalculate price in edit modal
  let modalTotalPrice = 0;
  if (selectedBooking) {
    modalTotalPrice = selectedBooking.hall.pricePerSeat * editSeats;
    const activeServices = selectedBooking.hall.services.filter((s: any) => editServices.includes(s.id));
    activeServices.forEach((s: any) => modalTotalPrice += s.price);
  }
  const modalAdvancePayment = modalTotalPrice * 0.2;

  return (
    <div className="bookings-container">
      <div className="bookings-wrapper">
        
        {/* Header Section */}
        <div className="bookings-header">
          <div className="bookings-header-icon">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="bookings-title">Mening Bronlarim</h1>
            <p className="bookings-subtitle">Sizning barcha band qilgan to'yxonalaringiz ro'yxati</p>
          </div>
        </div>

        {/* Pending Banner Alert */}
        {pendingBookings.length > 0 && (
          <div className="bookings-alert">
            <div className="bookings-alert-content">
              <div className="bookings-alert-icon">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="bookings-alert-title">Kutilayotgan bandlovlar mavjud!</h4>
                <p className="bookings-alert-desc">Sizda {pendingBookings.length} ta tasdiqlanishi kutilayotgan bron bor. To'yxona egasi ruxsat berguncha ularni o'zgartirishingiz yoki bekor qilishingiz mumkin.</p>
              </div>
            </div>
            <span className="badge-pending">
              Kutilmoqda
            </span>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bookings-empty">
            <AlertCircle size={48} />
            <h3>Hech narsa topilmadi</h3>
            <p>Siz hali hech qanday to'yxonani band qilmadingiz.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                
                {/* Status Indicator */}
                <div className="booking-card-status">
                  {booking.status === 'APPROVED' && <CheckCircle size={32} />}
                  {booking.status === 'PENDING' && <Clock size={32} />}
                  {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && <Ban size={32} />}
                  
                  <span className={booking.status === 'APPROVED' ? 'badge-approved' : booking.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'}>
                    {booking.status === 'APPROVED' ? 'Tasdiqlandi' :
                     booking.status === 'PENDING' ? 'Kutilmoqda' :
                     booking.status === 'REJECTED' ? 'Rad etildi' : 'Bekor qilingan'}
                  </span>
                </div>

                {/* Details */}
                <div className="booking-card-body">
                  <div className="booking-card-header">
                    <div>
                      <h3 className="booking-card-title">{booking.hall.name}</h3>
                      <div className="booking-card-location">
                        <MapPin size={16} /> {booking.hall.address}, {booking.hall.district}
                      </div>
                    </div>
                    <div className="booking-card-price-block">
                      <p className="booking-card-price">{booking.totalPrice.toLocaleString()} <span className="currency">UZS</span></p>
                      <p className="booking-card-price-label">Umumiy Summa</p>
                    </div>
                  </div>

                  <div className="booking-card-specs">
                    <div className="booking-spec-item">
                      <p className="spec-label">Sana</p>
                      <p className="spec-val">{format(new Date(booking.date), 'dd.MM.yyyy')}</p>
                    </div>
                    <div className="booking-spec-item">
                      <p className="spec-label">Odam soni</p>
                      <p className="spec-val">{booking.seats} kishi</p>
                    </div>
                    <div className="booking-spec-item span-col-2">
                      <p className="spec-label">Xizmatlar</p>
                      <p className="spec-val service-list-text">
                        {booking.services.length > 0 
                          ? booking.services.map((s:any) => s.service.name).join(', ')
                          : "Qo'shimcha xizmatlar yo'q"}
                      </p>
                    </div>
                  </div>
                  
                  {booking.status === 'REJECTED' && booking.rejectReason && (
                     <div className="booking-reject-banner">
                        <p className="reject-label">Rad etilish sababi</p>
                        <p className="reject-desc">{booking.rejectReason}</p>
                     </div>
                  )}

                  {/* Actions */}
                  <div className="booking-card-actions mt-3 flex flex-wrap gap-2">
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => openEditModal(booking)}
                          className="btn-outline"
                        >
                          <Edit3 size={16} /> Tahrirlash
                        </button>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn-outline btn-cancel"
                        >
                          Bekor qilish
                        </button>
                      </>
                    )}
                    {booking.hall?.owner && (
                      <Link
                        to="/chat"
                        state={{ ownerId: booking.hall.owner.id }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold no-underline transition-colors"
                      >
                        <MessageSquare size={16} /> Ega bilan yozish
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Edit Booking Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface relative border border-border rounded-xl p-8 shadow-2xl max-w-md w-full"
            >
              <button 
                onClick={closeEditModal} 
                className="absolute top-4 right-4 p-2 bg-surface-hover rounded-full hover:text-primary transition-colors border-none shadow-none"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-primary m-0 leading-tight">Bronni tahrirlash</h3>
                  <p className="text-sm text-text-muted m-0 mt-1">{selectedBooking.hall.name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {/* Date Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary uppercase">Tadbir Sanasi</label>
                  <input 
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="p-3 border border-border rounded bg-surface w-full"
                  />
                </div>

                {/* Guest Slider */}
                <div className="flex flex-col gap-2 bg-surface-hover p-4 rounded-xl border border-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-primary">Mehmonlar Soni</span>
                    <span className="text-sm font-bold text-primary">{editSeats} kishi</span>
                  </div>
                  <input 
                    type="range" min="50" max={selectedBooking.hall.capacity} step="10"
                    value={editSeats}
                    onChange={(e) => setEditSeats(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer my-2"
                  />
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Min: 50 ta</span>
                    <span>Max: {selectedBooking.hall.capacity} ta</span>
                  </div>
                </div>

                {/* Service Checkboxes */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-primary uppercase">Qo'shimcha Xizmatlar</label>
                  <div className="flex flex-col gap-2 bg-surface-hover p-4 rounded border border-border max-h-48 overflow-y-auto">
                    {selectedBooking.hall.services.map((service: any) => (
                      <label 
                        key={service.id}
                        className="flex items-center gap-3 m-0 cursor-pointer p-2 hover:bg-surface rounded"
                      >
                        <input 
                          type="checkbox"
                          checked={editServices.includes(service.id)}
                          onChange={() => {
                            setEditServices(prev => 
                              prev.includes(service.id)
                                ? prev.filter(id => id !== service.id)
                                : [...prev, service.id]
                            );
                          }}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text">{service.name}</span>
                          <span className="text-xs text-text-muted">+{service.price.toLocaleString()} UZS</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col gap-2 my-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Umumiy yangi summa:</span>
                    <span className="font-bold text-primary">{modalTotalPrice.toLocaleString()} UZS</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-1">
                    <span className="text-sm text-text-muted flex items-center gap-1"><Sparkles size={14} className="text-accent" /> Yangi oldindan to'lov (20%):</span>
                    <span className="font-bold text-success">{modalAdvancePayment.toLocaleString()} UZS</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <button 
                  onClick={handleEditSave}
                  disabled={saving}
                  className="w-full py-3 bg-primary text-white border-none rounded-md font-bold mt-2 shadow hover:bg-primary-hover"
                >
                  {saving ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserBookings;
