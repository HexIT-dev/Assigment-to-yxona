import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, CalendarRange, Plus, Pencil, MapPin, Users } from "lucide-react";
import { DashboardShell, type Tab } from "../components/layout/DashboardShell";
import { HallForm } from "../components/HallForm";
import { BookingsTable } from "../components/BookingsTable";
import { Button, Badge, Modal, PageLoader, EmptyState } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/utils";
import api, { apiError } from "../lib/api";
import type { Booking, Hall, HallInput } from "../types";

const TABS: Tab[] = [
  { key: "halls", label: "To'yxonalarim", icon: <Building2 size={18} /> },
  { key: "bookings", label: "Bronlar", icon: <CalendarRange size={18} /> },
];

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("halls");

  const [halls, setHalls] = useState<Hall[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Hall | null>(null);
  const [saving, setSaving] = useState(false);

  const loadHalls = useCallback(() => {
    if (!user) return;
    return api.get<Hall[]>("/halls", { params: { ownerId: user.id } }).then((r) => setHalls(r.data));
  }, [user]);

  const loadBookings = useCallback(() => {
    return api.get<Booking[]>("/bookings").then((r) => setBookings(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadHalls(), loadBookings()]).finally(() => setLoading(false));
  }, [loadHalls, loadBookings]);

  async function handleSubmit(data: HallInput) {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/halls/${editing.id}`, data);
        toast.success("To'yxona yangilandi (qayta tasdiqlash kutilmoqda)");
      } else {
        await api.post("/halls", data);
        toast.success("To'yxona qo'shildi! Admin tasdig'i kutilmoqda");
      }
      setFormOpen(false);
      setEditing(null);
      await loadHalls();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function cancelBooking(b: Booking) {
    if (!confirm("Bronni bekor qilmoqchimisiz?")) return;
    try {
      await api.patch(`/bookings/${b.id}/cancel`, { reason: "To'yxona egasi tomonidan bekor qilindi" });
      toast.success("Bron bekor qilindi");
      loadBookings();
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function approveBooking(b: Booking) {
    try {
      await api.patch(`/bookings/${b.id}/approve`);
      toast.success("Bron tasdiqlandi");
      loadBookings();
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  async function rejectBooking(b: Booking) {
    if (!confirm("Bronni rad etmoqchimisiz?")) return;
    try {
      await api.patch(`/bookings/${b.id}/reject`, { reason: "To'yxona egasi rad etdi" });
      toast.success("Bron rad etildi");
      loadBookings();
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  return (
    <DashboardShell title="Egasi paneli" tabs={TABS} active={tab} onTab={setTab}>
      {loading ? <PageLoader /> : tab === "halls" ? (
        <div>
          <div className="mb-5 flex justify-end">
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={18} /> Yangi to'yxona
            </Button>
          </div>

          {halls.length === 0 ? (
            <EmptyState title="To'yxona qo'shilmagan" hint="Birinchi to'yxonangizni ro'yxatdan o'tkazing." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {halls.map((h) => (
                <div key={h.id} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => navigate(`/halls/${h.id}`)}
                    className="relative block aspect-[16/9] w-full bg-cream-200"
                    title="Batafsil ko'rish (kalendar va bronlar bilan)"
                  >
                    {h.images?.[0]?.url && <img src={h.images[0].url} alt={h.name} className="h-full w-full object-cover" />}
                    <div className="absolute right-2 top-2">
                      <Badge tone={h.status === "APPROVED" ? "success" : "warning"}>
                        {h.status === "APPROVED" ? "Tasdiqlangan" : "Tasdiqlanmagan"}
                      </Badge>
                    </div>
                  </button>
                  <div className="p-4">
                    <h3
                      onClick={() => navigate(`/halls/${h.id}`)}
                      className="cursor-pointer font-display text-lg font-bold text-cobalt-700 hover:text-terracotta-600"
                    >
                      {h.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft"><MapPin size={14} /> {h.district}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-ink-soft"><Users size={14} /> {h.capacity}</span>
                      <span className="font-semibold text-terracotta-600">{formatPrice(h.pricePerSeat)}</span>
                    </div>
                    <Button variant="outline" size="sm" fullWidth className="mt-3" onClick={() => { setEditing(h); setFormOpen(true); }}>
                      <Pencil size={15} /> Tahrirlash
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <BookingsTable bookings={bookings} showHall showUser onCancel={cancelBooking} onApprove={approveBooking} onReject={rejectBooking} />
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? "To'yxonani tahrirlash" : "Yangi to'yxona qo'shish"} size="xl">
        <HallForm
          initial={editing || undefined}
          onSubmit={handleSubmit}
          submitting={saving}
          submitLabel={editing ? "Yangilash" : "Qo'shish"}
        />
      </Modal>
    </DashboardShell>
  );
}
