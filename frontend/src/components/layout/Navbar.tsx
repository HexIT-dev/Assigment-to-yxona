import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CalendarHeart, LogIn, UserPlus, LogOut, Menu, X, LayoutDashboard, CalendarCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../RouteGuard";
import { StarMotif } from "../ornaments/Suzani";
import { cx } from "../../lib/utils";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-terracotta-500 text-cream-50 shadow-[var(--shadow-soft)]">
            <CalendarHeart size={22} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold text-cobalt-700">To'yxona</span>
            <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-widest text-gold-500">
              <StarMotif className="h-2.5 w-2.5" /> onlayn bron
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/">Bosh sahifa</NavItem>
          {user?.role === "USER" && <NavItem to="/my-bookings">Mening bronlarim</NavItem>}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Link
                to="/login"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-cobalt-600 transition hover:bg-cream-200"
              >
                <LogIn size={17} /> Kirish
              </Link>
              <Link
                to="/register"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-terracotta-500 px-4 text-sm font-semibold text-cream-50 shadow-[var(--shadow-soft)] transition hover:bg-terracotta-600"
              >
                <UserPlus size={17} /> Ro'yxatdan o'tish
              </Link>
            </>
          ) : (
            <UserMenu />
          )}
        </div>

        {/* Mobile toggle */}
        <button className="rounded-lg p-2 text-cobalt-700 md:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-cream-300 bg-cream-50 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            <MobileLink to="/" onClick={() => setOpen(false)}>Bosh sahifa</MobileLink>
            {user?.role === "USER" && (
              <MobileLink to="/my-bookings" onClick={() => setOpen(false)}>Mening bronlarim</MobileLink>
            )}
            {user && (user.role === "OWNER" || user.role === "ADMIN") && (
              <MobileLink to={roleHome(user.role)} onClick={() => setOpen(false)}>Boshqaruv paneli</MobileLink>
            )}
            <div className="my-2 h-px bg-cream-300" />
            {!user ? (
              <>
                <MobileLink to="/login" onClick={() => setOpen(false)}>Kirish</MobileLink>
                <MobileLink to="/register" onClick={() => setOpen(false)}>Ro'yxatdan o'tish</MobileLink>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-terracotta-600 hover:bg-cream-200"
              >
                <LogOut size={17} /> Chiqish
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {(user.role === "OWNER" || user.role === "ADMIN") && (
        <Link
          to={roleHome(user.role)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-cobalt-200 px-3.5 text-sm font-semibold text-cobalt-600 transition hover:bg-cobalt-50"
        >
          <LayoutDashboard size={17} /> Panel
        </Link>
      )}
      {user.role === "USER" && (
        <Link
          to="/my-bookings"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-cobalt-200 px-3.5 text-sm font-semibold text-cobalt-600 transition hover:bg-cobalt-50"
        >
          <CalendarCheck size={17} /> Bronlarim
        </Link>
      )}
      <div className="flex items-center gap-2 rounded-xl bg-cream-200 py-1.5 pl-3 pr-1.5">
        <span className="text-sm font-semibold text-cobalt-700">{user.firstName}</span>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          title="Chiqish"
          className="grid h-7 w-7 place-items-center rounded-lg bg-cream-50 text-terracotta-500 transition hover:bg-terracotta-500 hover:text-cream-50"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cx(
          "rounded-xl px-4 py-2 text-sm font-semibold transition",
          isActive ? "bg-cream-200 text-terracotta-600" : "text-cobalt-600 hover:bg-cream-200"
        )
      }
    >
      {children}
    </NavLink>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-cobalt-700 hover:bg-cream-200">
      {children}
    </Link>
  );
}
