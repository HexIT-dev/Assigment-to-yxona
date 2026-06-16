import { useMemo, useState } from "react";
import { Phone, X, Check } from "lucide-react";
import { Badge, Button, Select, EmptyState } from "./ui";
import { formatDate, formatPrice, isPast, cx } from "../lib/utils";
import { TASHKENT_DISTRICTS } from "../lib/constants";
import type { Booking } from "../types";

type SortKey = "date" | "hall" | "district" | "status";

interface Props {
  bookings: Booking[];
  showHall?: boolean;
  showUser?: boolean;
  onCancel?: (b: Booking) => void;
  /** Ega/admin uchun: tasdiqlash va rad etish */
  onApprove?: (b: Booking) => void;
  onReject?: (b: Booking) => void;
}

/** Bronning ko'rsatiladigan holati */
function displayStatus(b: Booking): { label: string; tone: "success" | "info" | "danger" | "neutral" | "warning" } {
  if (b.status === "CANCELLED") return { label: "Bekor qilingan", tone: "danger" };
  if (b.status === "REJECTED") return { label: "Rad etilgan", tone: "danger" };
  if (b.status === "PENDING") return { label: "Tasdiq kutilmoqda", tone: "warning" };
  return isPast(b.date)
    ? { label: "Bo'lib o'tgan", tone: "neutral" }
    : { label: "Endi bo'ladigan", tone: "success" };
}

export function BookingsTable({ bookings, showHall = true, showUser = true, onCancel, onApprove, onReject }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "upcoming" | "past" | "cancelled">("all");
  const [districtFilter, setDistrictFilter] = useState("");
  const hasActions = !!(onCancel || onApprove || onReject);

  const rows = useMemo(() => {
    let list = [...bookings];

    if (districtFilter) list = list.filter((b) => b.hall?.district === districtFilter);

    if (statusFilter !== "all") {
      list = list.filter((b) => {
        const cancelled = b.status === "CANCELLED" || b.status === "REJECTED";
        if (statusFilter === "cancelled") return cancelled;
        if (statusFilter === "pending") return b.status === "PENDING";
        if (cancelled || b.status === "PENDING") return false;
        return statusFilter === "past" ? isPast(b.date) : !isPast(b.date);
      });
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case "date": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "hall": return (a.hall?.name || "").localeCompare(b.hall?.name || "");
        case "district": return (a.hall?.district || "").localeCompare(b.hall?.district || "");
        case "status": return Number(isPast(a.date)) - Number(isPast(b.date));
      }
    });
    return list;
  }, [bookings, sortBy, statusFilter, districtFilter]);

  return (
    <div>
      {/* Filtrlar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="min-w-[170px]">
          <option value="date">Sana bo'yicha</option>
          {showHall && <option value="hall">To'yxona bo'yicha</option>}
          {showHall && <option value="district">Rayon bo'yicha</option>}
          <option value="status">Status bo'yicha</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="min-w-[150px]">
          <option value="all">Barcha holat</option>
          <option value="pending">Tasdiq kutilmoqda</option>
          <option value="upcoming">Endi bo'ladigan</option>
          <option value="past">Bo'lib o'tgan</option>
          <option value="cancelled">Bekor qilingan</option>
        </Select>
        {showHall && (
          <Select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="min-w-[150px]">
            <option value="">Barcha rayon</option>
            {TASHKENT_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Bron yo'q" hint="Hozircha bu yerda ko'rsatiladigan bron mavjud emas." />
      ) : (
        <>
          {/* Desktop jadval */}
          <div className="hidden overflow-x-auto rounded-2xl border border-cream-300 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-cobalt-700 text-cream-50">
                <tr>
                  <Th>#</Th>
                  {showHall && <Th>To'yxona</Th>}
                  <Th>Sana</Th>
                  <Th>O'rin</Th>
                  {showUser && <Th>Mijoz</Th>}
                  <Th>Narx</Th>
                  <Th>Holat</Th>
                  {hasActions && <Th>Amal</Th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((b, i) => {
                  const st = displayStatus(b);
                  const pending = b.status === "PENDING";
                  const showApproveReject = pending && (!!onApprove || !!onReject);
                  const canCancel = onCancel && b.status !== "CANCELLED" && b.status !== "REJECTED" && !isPast(b.date);
                  return (
                    <tr key={b.id} className={cx("border-t border-cream-200", i % 2 ? "bg-cream-50" : "bg-white")}>
                      <Td className="font-mono text-xs text-ink-soft">{b.id.slice(0, 8)}</Td>
                      {showHall && <Td className="font-semibold text-cobalt-700">{b.hall?.name || "—"}<div className="text-xs font-normal text-ink-soft">{b.hall?.district}</div></Td>}
                      <Td>{formatDate(b.date)}</Td>
                      <Td>{b.seats}</Td>
                      {showUser && (
                        <Td>
                          {b.user ? (
                            <div>
                              <div className="font-medium text-cobalt-700">{b.user.firstName} {b.user.lastName}</div>
                              <div className="flex items-center gap-1 text-xs text-ink-soft"><Phone size={11} /> {b.user.phone}</div>
                            </div>
                          ) : "—"}
                        </Td>
                      )}
                      <Td className="font-semibold text-terracotta-600">{formatPrice(b.totalPrice)}</Td>
                      <Td><Badge tone={st.tone}>{st.label}</Badge></Td>
                      {hasActions && (
                        <Td>
                          {showApproveReject ? (
                            <div className="flex flex-wrap gap-1.5">
                              {onApprove && !isPast(b.date) && (
                                <button onClick={() => onApprove(b)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--color-success)] hover:bg-green-50">
                                  <Check size={14} /> Tasdiqlash
                                </button>
                              )}
                              {onReject && (
                                <button onClick={() => onReject(b)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--color-danger)] hover:bg-terracotta-50">
                                  <X size={14} /> Rad etish
                                </button>
                              )}
                            </div>
                          ) : canCancel ? (
                            <button onClick={() => onCancel!(b)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--color-danger)] hover:bg-terracotta-50">
                              <X size={14} /> Bekor
                            </button>
                          ) : <span className="text-xs text-ink-soft/50">—</span>}
                        </Td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobil kartalar */}
          <div className="space-y-3 md:hidden">
            {rows.map((b) => {
              const st = displayStatus(b);
              const pending = b.status === "PENDING";
              const showApproveReject = pending && (!!onApprove || !!onReject);
              const canCancel = onCancel && b.status !== "CANCELLED" && b.status !== "REJECTED" && !isPast(b.date);
              return (
                <div key={b.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      {showHall && <p className="font-semibold text-cobalt-700">{b.hall?.name}</p>}
                      <p className="text-xs text-ink-soft">{b.hall?.district}</p>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <KV k="Sana" v={formatDate(b.date)} />
                    <KV k="O'rin" v={String(b.seats)} />
                    {showUser && b.user && <KV k="Mijoz" v={`${b.user.firstName} ${b.user.lastName}`} />}
                    <KV k="Narx" v={formatPrice(b.totalPrice)} />
                  </div>
                  {showApproveReject ? (
                    <div className="mt-3 flex gap-2">
                      {onApprove && !isPast(b.date) && (
                        <Button variant="secondary" size="sm" onClick={() => onApprove(b)}>Tasdiqlash</Button>
                      )}
                      {onReject && (
                        <Button variant="danger" size="sm" onClick={() => onReject(b)}>Rad etish</Button>
                      )}
                    </div>
                  ) : canCancel ? (
                    <Button variant="danger" size="sm" className="mt-3" onClick={() => onCancel!(b)}>Bekor qilish</Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cx("px-4 py-3 align-middle", className)}>{children}</td>;
}
function KV({ k, v }: { k: string; v: string }) {
  return <div><span className="text-xs text-ink-soft">{k}: </span><span className="font-medium text-cobalt-700">{v}</span></div>;
}
