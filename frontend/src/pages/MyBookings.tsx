import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarCheck } from "lucide-react";
import { BookingsTable } from "../components/BookingsTable";
import { PageLoader } from "../components/ui";
import { StarMotif } from "../components/ornaments/Suzani";
import api, { apiError } from "../lib/api";
import type { Booking } from "../types";

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get<Booking[]>("/bookings").then((r) => setBookings(r.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function cancel(b: Booking) {
    if (!confirm("Bronni bekor qilmoqchimisiz?")) return;
    try {
      await api.patch(`/bookings/${b.id}/cancel`);
      toast.success("Bron bekor qilindi");
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta-500 text-cream-50">
          <CalendarCheck size={20} />
        </span>
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-cobalt-700">
            Mening bronlarim <StarMotif className="h-4 w-4 text-gold-400" />
          </h1>
          <p className="text-sm text-ink-soft">O'zingiz qilgan bronlarni ko'ring va boshqaring</p>
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <BookingsTable bookings={bookings} showHall showUser={false} onCancel={cancel} userMode />
      )}
    </div>
  );
}
