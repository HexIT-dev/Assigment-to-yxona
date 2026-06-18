import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2, Users2, Users, CalendarRange, Plus, Pencil, Trash2, Check,
  MapPin, Search, Phone, Mail, BadgeCheck,
} from "lucide-react";
import { DashboardShell, type Tab } from "../components/layout/DashboardShell";
import { HallForm } from "../components/HallForm";
import { BookingsTable } from "../components/BookingsTable";
import { Button, Badge, Modal, Input, Select, PageLoader, EmptyState } from "../components/ui";
import { formatPrice } from "../lib/utils";
import { TASHKENT_DISTRICTS } from "../lib/constants";
import api, { apiError } from "../lib/api";
import type { Booking, Hall, HallInput, User } from "../types";

const TABS: Tab[] = [
  { key: "halls", label: "To'yxonalar", icon: <Building2 size={18} /> },
  { key: "owners", label: "Egalar", icon: <Users2 size={18} /> },
  { key: "users", label: "Foydalanuvchilar", icon: <Users size={18} /> },
  { key: "bookings", label: "Bronlar", icon: <CalendarRange size={18} /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("halls");
  return (
    <DashboardShell title="Admin paneli" tabs={TABS} active={tab} onTab={setTab}>
      {tab === "halls" && <HallsTab />}
      {tab === "owners" && <OwnersTab />}
      {tab === "users" && <UsersTab />}
      {tab === "bookings" && <BookingsTab />}
    </DashboardShell>
  );
}

/* ============== TO'YXONALAR ============== */
function HallsTab() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Hall | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { status };
    if (search.trim()) params.search = search.trim();
    if (district) params.district = district;
    if (sort) {
      const [f, o] = sort.split("-");
      params.sortBy = f === "price" ? "pricePerSeat" : "capacity";
      params.order = o;
    }
    api.get<Hall[]>("/halls", { params }).then((r) => setHalls(r.data)).finally(() => setLoading(false));
  }, [search, district, status, sort]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    api.get<User[]>("/users", { params: { role: "OWNER" } }).then((r) => setOwners(r.data));
  }, []);

  async function submit(data: HallInput) {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/halls/${editing.id}`, data);
        toast.success("To'yxona yangilandi");
      } else {
        await api.post("/halls", data);
        toast.success("To'yxona qo'shildi");
      }
      setFormOpen(false); setEditing(null); load();
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  }

  async function approve(h: Hall) {
    try { await api.patch(`/halls/${h.id}/approve`); toast.success("Tasdiqlandi"); load(); }
    catch (err) { toast.error(apiError(err)); }
  }

  async function remove(h: Hall) {
    if (!confirm(`"${h.name}" to'yxonasini o'chirmoqchimisiz?`)) return;
    try { await api.delete(`/halls/${h.id}`); toast.success("O'chirildi"); load(); }
    catch (err) { toast.error(apiError(err)); }
  }

  return (
    <div>
      {/* Filtr paneli */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..."
            className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-9 pr-4 focus:border-cobalt-400 focus:outline-none focus:ring-2 focus:ring-cobalt-100" />
        </div>
        <Select value={district} onChange={(e) => setDistrict(e.target.value)} className="min-w-[140px]">
          <option value="">Barcha rayon</option>
          {TASHKENT_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="min-w-[150px]">
          <option value="all">Barcha holat</option>
          <option value="APPROVED">Tasdiqlangan</option>
          <option value="PENDING">Tasdiqlanmagan</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="min-w-[170px]">
          <option value="">Tartiblash</option>
          <option value="price-asc">Narx ↑</option>
          <option value="price-desc">Narx ↓</option>
          <option value="cap-asc">Sig'im ↑</option>
          <option value="cap-desc">Sig'im ↓</option>
        </Select>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18} /> Qo'shish</Button>
      </div>

      {loading ? <PageLoader /> : halls.length === 0 ? (
        <EmptyState title="To'yxona topilmadi" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {halls.map((h) => (
            <div key={h.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => navigate(`/halls/${h.id}`)}
                className="relative block aspect-[16/9] w-full bg-cream-200"
                title="Batafsil ko'rish (kalendar bilan)"
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
                <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-soft"><MapPin size={14} /> {h.district}</p>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{h.capacity} o'rin</span>
                  <span className="font-semibold text-terracotta-600">{formatPrice(h.pricePerSeat)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Egasi: {h.owner ? `${h.owner.firstName} ${h.owner.lastName}` : <span className="text-gold-600">biriktirilmagan</span>}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {h.status === "PENDING" && (
                    <Button size="sm" variant="secondary" onClick={() => approve(h)}><Check size={15} /> Tasdiqlash</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setEditing(h); setFormOpen(true); }}><Pencil size={15} /> Tahrir</Button>
                  <Button size="sm" variant="danger" onClick={() => remove(h)}><Trash2 size={15} /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? "To'yxonani tahrirlash" : "Yangi to'yxona"} size="xl">
        <HallForm initial={editing || undefined} owners={owners} showOwnerSelect onSubmit={submit} submitting={saving} submitLabel={editing ? "Yangilash" : "Qo'shish"} />
      </Modal>
    </div>
  );
}

/* ============== EGALAR ============== */
function OwnersTab() {
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", username: "" });

  const load = useCallback(() => {
    setLoading(true);
    api.get<User[]>("/users", { params: { role: "OWNER" } }).then((r) => setOwners(r.data)).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/users/create-owner", form);
      toast.success("To'yxona egasi qo'shildi. U email orqali kirib parol o'rnatadi.");
      setOpen(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", username: "" });
      load();
    } catch (err) { toast.error(apiError(err)); }
    finally { setSaving(false); }
  }

  async function remove(o: User) {
    const hallCount = (o as any).halls?.length ?? 0;
    const warn = hallCount > 0
      ? `"${o.firstName} ${o.lastName}" egasini va uning ${hallCount} ta to'yxonasini (hamda barcha bronlarini) o'chirmoqchimisiz?`
      : `"${o.firstName} ${o.lastName}" egasini o'chirmoqchimisiz?`;
    if (!confirm(warn)) return;
    try {
      await api.delete(`/users/${o.id}`);
      toast.success("Egasi o'chirildi");
      load();
    } catch (err) { toast.error(apiError(err)); }
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus size={18} /> Egasi qo'shish</Button>
      </div>

      {loading ? <PageLoader /> : owners.length === 0 ? (
        <EmptyState title="Egalar yo'q" hint="Birinchi to'yxona egasini qo'shing." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {owners.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-cobalt-100 font-display text-lg font-bold text-cobalt-600">
                  {o.firstName[0]}{o.lastName[0]}
                </span>
                <div>
                  <p className="font-semibold text-cobalt-700">{o.firstName} {o.lastName}</p>
                  <p className="text-xs text-ink-soft">@{o.username}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-ink-soft">
                <p className="flex items-center gap-2"><Mail size={14} /> {o.email}</p>
                <p className="flex items-center gap-2"><Phone size={14} /> {o.phone}</p>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-cream-200 pt-3 text-xs">
                <Badge tone="info"><Building2 size={11} /> {(o as any).halls?.length ?? 0} to'yxona</Badge>
                {(o as any).isVerified && <Badge tone="success"><BadgeCheck size={11} /> Tasdiqlangan</Badge>}
              </div>
              <div className="mt-3 flex justify-end">
                <Button size="sm" variant="danger" onClick={() => remove(o)}><Trash2 size={15} /> O'chirish</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Yangi to'yxona egasi">
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ism" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Familiya" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Telefon" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Foydalanuvchi nomi" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <p className="rounded-xl bg-gold-50 px-3 py-2 text-xs text-gold-700">
            Parol kerak emas — ega ko'rsatilgan email orqali kirib, o'zi parol o'rnatadi.
          </p>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving}>Qo'shish</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ============== FOYDALANUVCHILAR ============== */
function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { role: "USER" };
    if (search.trim()) params.search = search.trim();
    api.get<User[]>("/users", { params }).then((r) => setUsers(r.data)).finally(() => setLoading(false));
  }, [search]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function remove(u: User) {
    if (!confirm(`"${u.firstName} ${u.lastName}" foydalanuvchisini va uning barcha bronlarini o'chirmoqchimisiz?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      toast.success("Foydalanuvchi o'chirildi");
      load();
    } catch (err) { toast.error(apiError(err)); }
  }

  return (
    <div>
      <div className="mb-5">
        <div className="relative max-w-sm">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism, familiya yoki username bo'yicha qidirish..."
            className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-9 pr-4 focus:border-cobalt-400 focus:outline-none focus:ring-2 focus:ring-cobalt-100" />
        </div>
      </div>

      {loading ? <PageLoader /> : users.length === 0 ? (
        <EmptyState title="Foydalanuvchi topilmadi" hint="Hozircha ro'yxatdan o'tgan foydalanuvchi yo'q." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((u) => (
            <div key={u.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-terracotta-100 font-display text-lg font-bold text-terracotta-600">
                  {u.firstName[0]}{u.lastName[0]}
                </span>
                <div>
                  <p className="font-semibold text-cobalt-700">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-ink-soft">@{u.username}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-ink-soft">
                <p className="flex items-center gap-2"><Mail size={14} /> {u.email}</p>
                <p className="flex items-center gap-2"><Phone size={14} /> {u.phone}</p>
              </div>
              <div className="mt-3 flex justify-end border-t border-cream-200 pt-3">
                <Button size="sm" variant="danger" onClick={() => remove(u)}><Trash2 size={15} /> O'chirish</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============== BRONLAR ============== */
function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get<Booking[]>("/bookings").then((r) => setBookings(r.data)).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  async function cancel(b: Booking) {
    if (!confirm("Bronni bekor qilmoqchimisiz?")) return;
    try { await api.patch(`/bookings/${b.id}/cancel`, { reason: "Admin tomonidan bekor qilindi" }); toast.success("Bekor qilindi"); load(); }
    catch (err) { toast.error(apiError(err)); }
  }

  async function approve(b: Booking) {
    try { await api.patch(`/bookings/${b.id}/approve`); toast.success("Bron tasdiqlandi"); load(); }
    catch (err) { toast.error(apiError(err)); }
  }

  async function reject(b: Booking) {
    if (!confirm("Bronni rad etmoqchimisiz?")) return;
    try { await api.patch(`/bookings/${b.id}/reject`, { reason: "Admin rad etdi" }); toast.success("Bron rad etildi"); load(); }
    catch (err) { toast.error(apiError(err)); }
  }

  return loading ? <PageLoader /> : <BookingsTable bookings={bookings} showHall showUser onCancel={cancel} onApprove={approve} onReject={reject} />;
}
