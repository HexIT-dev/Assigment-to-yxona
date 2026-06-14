import { Link } from "react-router-dom";
import { CalendarHeart, Phone, MapPin } from "lucide-react";
import { SuzaniBorder, IslimiVine } from "../ornaments/Suzani";

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-cobalt-700 text-cream-100">
      {/* Tepa naqsh bordyuri */}
      <div className="text-gold-400">
        <SuzaniBorder className="h-6 w-full" />
      </div>

      <IslimiVine className="pointer-events-none absolute -right-6 top-10 h-40 w-40 text-cobalt-500/40" />
      <IslimiVine className="pointer-events-none absolute -left-6 bottom-6 h-32 w-32 -scale-x-100 text-cobalt-500/40" />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta-500 text-cream-50">
              <CalendarHeart size={22} />
            </span>
            <span className="font-display text-xl font-bold text-cream-50">To'yxona</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-cream-200/80">
            Toshkent shahridagi to'yxonalarni qulay tarzda onlayn ko'rib chiqing, taqqoslang va bron qiling.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base text-cream-50">Sahifalar</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream-200/80">
            <li><Link to="/" className="transition hover:text-gold-300">Bosh sahifa</Link></li>
            <li><Link to="/login" className="transition hover:text-gold-300">Kirish</Link></li>
            <li><Link to="/register" className="transition hover:text-gold-300">Ro'yxatdan o'tish</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base text-cream-50">Aloqa</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream-200/80">
            <li className="flex items-center gap-2"><Phone size={15} className="text-gold-400" /> +998 90 000 00 00</li>
            <li className="flex items-center gap-2"><MapPin size={15} className="text-gold-400" /> Toshkent shahri, O'zbekiston</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cobalt-500/40 py-4 text-center text-xs text-cream-200/60">
        © {new Date().getFullYear()} To'yxona. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
