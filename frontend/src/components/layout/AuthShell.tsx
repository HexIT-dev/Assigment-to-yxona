import { Link } from "react-router-dom";
import { CalendarHeart } from "lucide-react";
import { SuzaniRosette, IslimiVine } from "../ornaments/Suzani";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Chap — naqshli brand paneli */}
      <div className="relative hidden overflow-hidden bg-cobalt-700 lg:block">
        <div className="suzani-bg absolute inset-0 opacity-10" />
        <SuzaniRosette className="absolute -left-16 -top-16 h-80 w-80 text-gold-400/30" />
        <SuzaniRosette className="absolute -bottom-20 -right-16 h-96 w-96 text-terracotta-400/20" />
        <IslimiVine className="absolute right-10 top-1/3 h-40 w-40 text-cobalt-400/40" />

        <div className="relative flex h-full flex-col justify-between p-12 text-cream-100">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-terracotta-500 text-cream-50">
              <CalendarHeart size={24} />
            </span>
            <span className="font-display text-2xl font-bold text-cream-50">To'yxona</span>
          </Link>

          <div>
            <SuzaniRosette className="mb-6 h-16 w-16 text-gold-400" />
            <h2 className="font-display text-4xl font-bold leading-tight text-cream-50">
              Toshkentdagi eng yaxshi to'yxonalar bir joyda
            </h2>
            <p className="mt-4 max-w-md text-cream-200/80">
              Ro'yxatdan o'ting, qulay sanani tanlang va to'yxonangizni bir necha
              daqiqada bron qiling.
            </p>
          </div>

          <p className="text-sm text-cream-200/60">© {new Date().getFullYear()} To'yxona</p>
        </div>
      </div>

      {/* O'ng — forma */}
      <div className="suzani-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta-500 text-cream-50">
              <CalendarHeart size={22} />
            </span>
            <span className="font-display text-xl font-bold text-cobalt-700">To'yxona</span>
          </Link>

          <div className="card p-7 sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-bold text-cobalt-700">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
