import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { HallCard } from "../components/HallCard";
import { Select, PageLoader, EmptyState } from "../components/ui";
import { SuzaniRosette, SuzaniBorder, StarMotif } from "../components/ornaments/Suzani";
import { TASHKENT_DISTRICTS } from "../lib/constants";
import api from "../lib/api";
import type { Hall } from "../types";

type SortKey = "" | "price-asc" | "price-desc" | "cap-asc" | "cap-desc";

export default function Home() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [sort, setSort] = useState<SortKey>("");

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (district) params.district = district;
      if (sort) {
        const [field, order] = sort.split("-");
        params.sortBy = field === "price" ? "pricePerSeat" : "capacity";
        params.order = order;
      }
      api
        .get<Hall[]>("/halls", { params })
        .then((r) => setHalls(r.data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, district, sort]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cobalt-700">
        <div className="suzani-bg absolute inset-0 opacity-10" />
        <SuzaniRosette className="pointer-events-none absolute -left-20 -top-16 h-80 w-80 text-gold-400/20" />
        <SuzaniRosette className="pointer-events-none absolute -bottom-28 -right-16 h-[26rem] w-[26rem] text-terracotta-400/15" />

        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <span className="eyebrow justify-center text-gold-300">
            Toshkent shahri to'yxonalari
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-cream-50 sm:text-5xl">
            To'yingiz uchun eng go'zal maskanni{" "}
            <span className="text-gold-400">onlayn bron qiling</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream-200/80">
            To'yxonalarni ko'ring, narx va sig'im bo'yicha taqqoslang hamda
            kerakli kunni bir necha daqiqada band qiling.
          </p>

          {/* Qidiruv */}
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-cream-50 p-2 shadow-[var(--shadow-lift)]">
            <Search className="ml-2 text-ink-soft" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="To'yxona nomi yoki manzili bo'yicha qidiring..."
              className="flex-1 bg-transparent px-1 py-2 text-ink placeholder:text-ink-soft/60 focus:outline-none"
            />
          </div>
        </div>

        <div className="relative text-gold-400">
          <SuzaniBorder className="h-6 w-full" />
        </div>
      </section>

      {/* RO'YXAT */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Filtrlar paneli */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <StarMotif className="h-5 w-5 text-gold-400" />
            <h2 className="font-display text-2xl font-bold text-cobalt-700">
              Mavjud to'yxonalar
              {!loading && <span className="ml-2 text-base font-medium text-ink-soft">({halls.length})</span>}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1 text-sm font-semibold text-ink-soft sm:flex">
              <SlidersHorizontal size={16} /> Saralash:
            </span>
            <Select value={district} onChange={(e) => setDistrict(e.target.value)} className="min-w-[150px]">
              <option value="">Barcha rayonlar</option>
              {TASHKENT_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="min-w-[180px]">
              <option value="">Tartiblash</option>
              <option value="price-asc">Narx: arzondan qimmatga</option>
              <option value="price-desc">Narx: qimmatdan arzonga</option>
              <option value="cap-asc">Sig'im: kamdan ko'pga</option>
              <option value="cap-desc">Sig'im: ko'pdan kamga</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <PageLoader />
        ) : halls.length === 0 ? (
          <EmptyState
            title="To'yxona topilmadi"
            hint="Qidiruv yoki filtrlarni o'zgartirib ko'ring."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {halls.map((hall) => (
              <HallCard key={hall.id} hall={hall} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
