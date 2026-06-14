import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthShell } from "../components/layout/AuthShell";
import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import api, { apiError } from "../lib/api";
import type { Role, User } from "../types";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("USER");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ user: User; token: string }>("/auth/register", { ...form, role });

      if (role === "OWNER") {
        toast("Emailingizga tasdiqlash kodi yuborildi", { icon: "✉️" });
        navigate("/verify-otp", { state: { email: form.email } });
      } else {
        login(data.token, data.user);
        toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
        navigate("/", { replace: true });
      }
    } catch (err) {
      toast.error(apiError(err, "Ro'yxatdan o'tishda xatolik"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Ro'yxatdan o'tish" subtitle="Bir necha qadamda hisob yarating">
      {/* Rol tanlash */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-cream-200 p-1">
        <RoleTab active={role === "USER"} onClick={() => setRole("USER")}>Foydalanuvchi</RoleTab>
        <RoleTab active={role === "OWNER"} onClick={() => setRole("OWNER")}>To'yxona egasi</RoleTab>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ism" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          <Input label="Familiya" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </div>
        <Input label="Email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        <Input label="Telefon raqam" placeholder="+998901234567" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <Input label="Foydalanuvchi nomi" required value={form.username} onChange={(e) => set("username", e.target.value)} />
        <Input label="Parol" type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} />

        {role === "OWNER" && (
          <p className="rounded-xl bg-gold-50 px-3 py-2 text-xs text-gold-700">
            To'yxona egalari uchun: ro'yxatdan o'tgandan so'ng emailingizga yuborilgan kod orqali hisobingizni tasdiqlaysiz.
          </p>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Ro'yxatdan o'tish
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Hisobingiz bormi?{" "}
        <Link to="/login" className="font-semibold text-terracotta-600 hover:underline">
          Kirish
        </Link>
      </p>
    </AuthShell>
  );
}

function RoleTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-lg py-2 text-sm font-semibold transition " +
        (active ? "bg-cream-50 text-terracotta-600 shadow-sm" : "text-ink-soft hover:text-cobalt-600")
      }
    >
      {children}
    </button>
  );
}
