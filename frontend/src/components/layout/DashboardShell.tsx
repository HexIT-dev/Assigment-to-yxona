import { Link, useNavigate } from "react-router-dom";
import { CalendarHeart, LogOut, Home, UserCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SuzaniBorder } from "../ornaments/Suzani";
import { cx } from "../../lib/utils";

export interface Tab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  title: string;
  tabs: Tab[];
  active: string;
  onTab: (key: string) => void;
  children: React.ReactNode;
}

export function DashboardShell({ title, tabs, active, onTab, children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-cream-300 bg-cobalt-700 text-cream-100 lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta-500 text-cream-50">
            <CalendarHeart size={22} />
          </span>
          <div className="leading-none">
            <p className="font-display text-lg font-bold text-cream-50">To'yxona</p>
            <p className="text-xs text-gold-300">{title}</p>
          </div>
        </div>
        <div className="text-gold-400"><SuzaniBorder className="h-4 w-full" /></div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTab(t.key)}
              className={cx(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                active === t.key ? "bg-cream-50 text-cobalt-700" : "text-cream-200/80 hover:bg-cobalt-600"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-cobalt-500/40 p-3">
          <Link to="/profile" className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-cream-200/80 hover:bg-cobalt-600">
            <UserCog size={18} /> Profil
          </Link>
          <Link to="/" className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-cream-200/80 hover:bg-cobalt-600">
            <Home size={18} /> Saytga o'tish
          </Link>
          <button onClick={() => { logout(); navigate("/"); }} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-terracotta-200 hover:bg-cobalt-600">
            <LogOut size={18} /> Chiqish
          </button>
        </div>
      </aside>

      {/* Asosiy qism */}
      <div className="flex-1">
        {/* Mobil tab bar */}
        <header className="sticky top-0 z-30 border-b border-cream-300 bg-cream-50/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-display text-lg font-bold text-cobalt-700">{title}</p>
            <button onClick={() => { logout(); navigate("/"); }} className="rounded-lg p-2 text-terracotta-500"><LogOut size={20} /></button>
          </div>
          <div className="flex gap-1 overflow-x-auto px-3 pb-2">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => onTab(t.key)}
                className={cx("flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold", active === t.key ? "bg-cobalt-700 text-cream-50" : "bg-cream-200 text-cobalt-600")}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </header>

        <div className="hidden items-center justify-between px-8 py-5 lg:flex">
          <h1 className="font-display text-2xl font-bold text-cobalt-700">{tabs.find((t) => t.key === active)?.label}</h1>
          <span className="text-sm text-ink-soft">Salom, <b className="text-cobalt-700">{user?.firstName}</b></span>
        </div>

        <main className="p-4 sm:p-6 lg:px-8 lg:pb-10 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
