import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, UserCog } from "lucide-react";
import { Button, Input, Badge } from "../components/ui";
import { StarMotif } from "../components/ornaments/Suzani";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../components/RouteGuard";
import api, { apiError } from "../lib/api";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  OWNER: "To'yxona egasi",
  USER: "Foydalanuvchi",
};

export default function Profile() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const st = (location.state as { setPassword?: boolean; home?: string }) || {};
  const mustSetPassword = !!st.setPassword;

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    password: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) {
      toast.error("Parollar mos kelmadi");
      return;
    }
    if (mustSetPassword && !form.password) {
      toast.error("Iltimos, yangi parol o'rnating");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      };
      if (form.password) payload.password = form.password;
      await api.put("/users/profile", payload);
      await refresh();
      toast.success("Ma'lumotlar saqlandi");
      setForm((f) => ({ ...f, password: "", confirm: "" }));
      if (mustSetPassword) navigate(st.home || roleHome(user!.role), { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Saqlashda xatolik"));
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <button
        onClick={() => navigate(roleHome(user.role))}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt-600 hover:text-terracotta-500"
      >
        <ArrowLeft size={17} /> Orqaga
      </button>

      <div className="card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cobalt-700 text-gold-400">
            <UserCog size={24} />
          </span>
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-cobalt-700">
              Profil <StarMotif className="h-4 w-4 text-gold-400" />
            </h1>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-ink-soft">
              @{user.username} <Badge tone="info">{ROLE_LABEL[user.role]}</Badge>
            </div>
          </div>
        </div>

        {mustSetPassword && (
          <p className="mb-5 rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-700">
            Xush kelibsiz! Hisobingizdan keyingi safar oson kirish uchun yangi parol o'rnating.
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Ism" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            <Input label="Familiya" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </div>
          <Input label="Telefon raqam" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <Input label="Email" type="email" value={user.email} disabled />

          <div className="border-t border-cream-300 pt-4">
            <p className="mb-3 text-sm font-semibold text-cobalt-700">
              {mustSetPassword ? "Parol o'rnatish" : "Parolni o'zgartirish (ixtiyoriy)"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Yangi parol"
                type="password"
                minLength={6}
                required={mustSetPassword}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
              <Input
                label="Parolni tasdiqlang"
                type="password"
                minLength={6}
                required={!!form.password}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" loading={saving}>Saqlash</Button>
          </div>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-ink-soft">
        <Link to={roleHome(user.role)} className="font-semibold text-terracotta-600 hover:underline">
          Bosh sahifaga qaytish
        </Link>
      </p>
    </div>
  );
}
