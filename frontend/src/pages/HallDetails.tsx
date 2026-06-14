import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Users, Phone, Calendar as CalIcon, ArrowLeft, Music2, Car, UtensilsCrossed, Megaphone } from "lucide-react";
import { Button, Badge, PageLoader, Modal } from "../components/ui";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { StarMotif, SuzaniBorder } from "../components/ornaments/Suzani";
import { useAuth } from "../context/AuthContext";
import { formatPrice, formatDate } from "../lib/utils";
import { SERVICE_LABEL } from "../lib/constants";
import api, { apiError } from "../lib/api";
import type { Booking, Hall, HallService, ServiceType } from "../types";

export default function HallDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  // bron oqimi holati
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [seats, setSeats] = useState<number>(0);
  const [chosenServices, setChosenServices] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);

  // band kun ma'lumoti modali
  const [dayInfo, setDayInfo] = useState<{ date: string; items: Booking[] } | null>(null);

  function load() {
    if (!id) return;
    setLoading(true);
    api.get<Hall>(`/halls/${id}`).then((r) => setHall(r.data)).catch(() => setHall(null)).finally(() => setLoading(false));
  }
  useEffect(load, [id]);

  if (loading) return <PageLoader />;
  if (!hall) return <div className="py-20 text-center text-ink-soft">To'yxona topilmadi.</div>;

  const total = hall.pricePerSeat * (seats || 0) +
    hall.services.filter((s) => chosenServices.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
  const advance = total * 0.2;
  const overCapacity = seats > hall.capacity;

  const grouped = groupServices(hall.services);

  function toggleService(sid: string) {
    setChosenServices((p) => (p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid]));
  }

  async function confirmBooking() {
    if (!selectedDate) return toast.error("Avval kalendardan kun tanlang");
    if (!seats || seats < 1) return toast.error("Odam sonini kiriting");
    if (overCapacity) return toast.error("Odam soni to'yxona sig'imidan oshib ketdi");

    // Login talab qilinadi
    if (!user) {
      toast("Bron qilish uchun avval tizimga kiring", { icon: "🔒" });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (user.role !== "USER") {
      return toast.error("Faqat foydalanuvchilar bron qila oladi");
    }

    setBooking(true);
    try {
      await api.post("/bookings", {
        hallId: hall!.id,
        date: selectedDate,
        seats,
        serviceIds: chosenServices,
      });
      toast.success("Muvaffaqiyatli to'landi! Broningiz qabul qilindi 🎉");
      setSelectedDate(null);
      setSeats(0);
      setChosenServices([]);
      load();
    } catch (err) {
      toast.error(apiError(err, "Bron qilishda xatolik"));
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-600 hover:text-terracotta-500">
        <ArrowLeft size={17} /> Orqaga
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* CHAP USTUN */}
        <div>
          {/* Galereya */}
          <div className="overflow-hidden rounded-2xl border border-cream-300 bg-cream-200">
            <div className="aspect-[16/10] w-full">
              {hall.images[activeImg]?.url ? (
                <img src={hall.images[activeImg].url} alt={hall.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-cream-400"><StarMotif className="h-16 w-16" /></div>
              )}
            </div>
            {hall.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-2">
                {hall.images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)}
                    className={"h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition " + (i === activeImg ? "border-gold-400" : "border-transparent opacity-70 hover:opacity-100")}>
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sarlavha + asosiy ma'lumot */}
          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl font-bold text-cobalt-700">{hall.name}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-ink-soft"><MapPin size={16} className="text-terracotta-500" /> {hall.district}, {hall.address}</p>
              </div>
              <Badge tone="gold" className="text-sm">{formatPrice(hall.pricePerSeat)} / o'rin</Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <InfoChip icon={<Users size={16} />} label="Sig'im" value={`${hall.capacity} o'rin`} />
              <InfoChip icon={<Phone size={16} />} label="Telefon" value={hall.phone} />
            </div>
          </div>

          {/* Qo'shimcha xizmatlar */}
          {hall.services.length > 0 && (
            <div className="mt-8">
              <SectionTitle>Qo'shimcha xizmatlar</SectionTitle>
              <div className="mt-4 space-y-6">
                {(Object.keys(grouped) as ServiceType[]).map((type) => (
                  <ServiceGroup key={type} type={type} items={grouped[type]!} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* O'NG USTUN — bron paneli */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <div className="card overflow-hidden">
            <div className="bg-cobalt-700 px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-cream-50">
                <CalIcon size={18} className="text-gold-400" /> Bo'sh kunlar va bron
              </h2>
            </div>
            <div className="text-gold-400"><SuzaniBorder className="h-4 w-full" /></div>

            <div className="p-5">
              <AvailabilityCalendar
                bookings={hall.bookings || []}
                selectable={!user || user.role === "USER"}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectBooked={(date, items) => setDayInfo({ date, items })}
              />

              {/* Bron formasi */}
              {selectedDate && (
                <div className="mt-6 space-y-4 border-t border-cream-300 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">Tanlangan kun</span>
                    <Badge tone="info">{formatDate(selectedDate)}</Badge>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-cobalt-700">Odamlar soni</label>
                    <input
                      type="number" min={1} max={hall.capacity} value={seats || ""}
                      onChange={(e) => setSeats(parseInt(e.target.value) || 0)}
                      placeholder={`Maks. ${hall.capacity}`}
                      className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 focus:border-cobalt-400 focus:outline-none focus:ring-2 focus:ring-cobalt-100"
                    />
                    {overCapacity && (
                      <p className="mt-1 text-xs text-[var(--color-danger)]">
                        Sig'imdan oshib ketdi! Iltimos, kattaroq to'yxona tanlang.
                      </p>
                    )}
                  </div>

                  {hall.services.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-cobalt-700">Xizmatlar (ixtiyoriy)</p>
                      <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
                        {hall.services.map((s) => (
                          <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-cream-100">
                            <input type="checkbox" checked={chosenServices.includes(s.id)} onChange={() => toggleService(s.id)}
                              className="h-4 w-4 accent-terracotta-500" />
                            <span className="flex-1 text-sm">{SERVICE_LABEL[s.type]}: {s.name}</span>
                            {s.price > 0 && <span className="text-xs font-semibold text-terracotta-600">+{formatPrice(s.price)}</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl bg-cream-100 p-4">
                    <Row label="Jami narx" value={formatPrice(total)} />
                    <Row label="Avans (20%)" value={formatPrice(advance)} accent />
                  </div>

                  <Button fullWidth size="lg" loading={booking} disabled={overCapacity || !seats} onClick={confirmBooking}>
                    Bron qilish va to'lash
                  </Button>
                  <p className="text-center text-xs text-ink-soft">Bron uchun umumiy narxning 20% avans to'lanadi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Band kun haqida modal */}
      <Modal open={!!dayInfo} onClose={() => setDayInfo(null)} title={dayInfo ? `${formatDate(dayInfo.date)} — band` : ""}>
        <div className="space-y-3">
          {dayInfo?.items.map((b) => (
            <div key={b.id} className="rounded-xl border border-cream-300 bg-cream-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cobalt-700">
                  {b.user ? `${b.user.firstName} ${b.user.lastName}` : "Mijoz"}
                </span>
                <Badge tone="warning">{b.seats} o'rin</Badge>
              </div>
              {b.user?.phone && <p className="mt-1 text-sm text-ink-soft">{b.user.phone}</p>}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/* ---------- yordamchilar ---------- */

function groupServices(services: HallService[]): Partial<Record<ServiceType, HallService[]>> {
  const g: Partial<Record<ServiceType, HallService[]>> = {};
  for (const s of services) {
    (g[s.type] ||= []).push(s);
  }
  return g;
}

const SERVICE_ICON: Partial<Record<ServiceType, React.ReactNode>> = {
  SINGER: <Music2 size={16} />,
  KARNAY: <Megaphone size={16} />,
  MENU: <UtensilsCrossed size={16} />,
  CAR: <Car size={16} />,
};

function ServiceGroup({ type, items }: { type: ServiceType; items: HallService[] }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 font-display text-base text-cobalt-700">
        <span className="text-terracotta-500">{SERVICE_ICON[type]}</span> {SERVICE_LABEL[type]}
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-xl border border-cream-300 bg-cream-50">
            {s.imageUrl && <img src={s.imageUrl} alt={s.name} className="h-24 w-full object-cover" />}
            <div className="p-2.5">
              <p className="text-sm font-semibold text-cobalt-700 line-clamp-1">{s.name}</p>
              {s.price > 0 && <p className="text-xs text-terracotta-600">{formatPrice(s.price)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-xl font-bold text-cobalt-700">
      <StarMotif className="h-4 w-4 text-gold-400" /> {children}
    </h3>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2">
      <span className="text-terracotta-500">{icon}</span>
      <div className="leading-tight">
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="text-sm font-semibold text-cobalt-700">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className={"font-bold " + (accent ? "text-lg text-terracotta-600" : "text-cobalt-700")}>{value}</span>
    </div>
  );
}
