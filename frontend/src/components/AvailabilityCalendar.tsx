import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toDateKey, isPast, cx } from "../lib/utils";
import type { Booking } from "../types";

const WEEKDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

/** Bir kunga ruxsat etilgan maksimal bron (nahorgi osh + oqshomgi to'y) */
export const MAX_BOOKINGS_PER_DAY = 2;

type DayState = "past" | "free" | "partial" | "full";

interface Props {
  bookings: Booking[];
  selectable?: boolean;
  selectedDate?: string | null;
  onSelectDate?: (dateKey: string) => void;
  onSelectBooked?: (dateKey: string, dayBookings: Booking[]) => void;
}

export function AvailabilityCalendar({
  bookings,
  selectable = false,
  selectedDate,
  onSelectDate,
  onSelectBooked,
}: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Faol bronlarni kun bo'yicha guruhlash (bekor/rad etilganlar hisobga olinmaydi)
  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (b.status === "CANCELLED" || b.status === "REJECTED") continue;
      const key = toDateKey(b.date);
      const arr = map.get(key) || [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [bookings]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Dushanba = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const arr: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [cursor]);

  function dayState(date: Date): DayState {
    if (isPast(date)) return "past";
    const count = byDay.get(toDateKey(date))?.length || 0;
    if (count >= MAX_BOOKINGS_PER_DAY) return "full";
    if (count > 0) return "partial";
    return "free";
  }

  function handleClick(date: Date) {
    const key = toDateKey(date);
    const state = dayState(date);
    const dayBookings = byDay.get(key) || [];

    if (state === "past") return;

    if (selectable) {
      // Foydalanuvchi: to'la band bo'lmagan kunni bron uchun tanlaydi
      // (boshqa mijozlar ma'lumoti ko'rsatilmaydi — maxfiylik)
      if (state !== "full" && onSelectDate) onSelectDate(key);
      return;
    }

    // Admin/egasi: band kunni bossa — kim bron qilgani ko'rinadi
    if (dayBookings.length > 0 && onSelectBooked) onSelectBooked(key, dayBookings);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="grid h-9 w-9 place-items-center rounded-lg border border-cream-300 text-cobalt-600 transition hover:bg-cream-200"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-display text-lg font-bold text-cobalt-700">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </h3>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="grid h-9 w-9 place-items-center rounded-lg border border-cream-300 text-cobalt-600 transition hover:bg-cream-200"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Hafta kunlari */}
      <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-ink-soft">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      {/* Kunlar */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const key = toDateKey(date);
          const state = dayState(date);
          const isSelected = selectedDate === key;
          const hasBookings = (byDay.get(key)?.length ?? 0) > 0;
          const clickable = state !== "past" && (selectable ? state !== "full" : hasBookings);

          return (
            <button
              key={i}
              disabled={!clickable}
              onClick={() => handleClick(date)}
              className={cx(
                "relative aspect-square rounded-lg text-sm font-semibold transition",
                clickable && "cursor-pointer hover:ring-2 hover:ring-gold-300",
                isSelected && "ring-2 ring-cobalt-500 ring-offset-1",
                stateStyles[state]
              )}
            >
              {date.getDate()}
              {state === "partial" && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current opacity-70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft">
        <Legend className="bg-green-100 text-[var(--color-success)]" label="Bo'sh" />
        <Legend className="bg-gold-100 text-gold-700" label="Qisman band (1/2)" />
        <Legend className="bg-terracotta-100 text-terracotta-600" label="To'liq band" />
        <Legend className="bg-cream-200 text-ink-soft/50" label="O'tgan kun" />
      </div>
    </div>
  );
}

const stateStyles: Record<DayState, string> = {
  past: "bg-cream-200 text-ink-soft/40",
  free: "bg-green-100 text-[var(--color-success)] hover:bg-green-200",
  partial: "bg-gold-100 text-gold-700 hover:bg-gold-200",
  full: "bg-terracotta-100 text-terracotta-600",
};

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cx("h-3.5 w-3.5 rounded", className)} />
      {label}
    </span>
  );
}
