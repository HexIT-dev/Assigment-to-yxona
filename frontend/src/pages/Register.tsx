import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthShell } from "../components/layout/AuthShell";
import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import api, { apiError } from "../lib/api";
import type { User } from "../types";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      // Faqat oddiy foydalanuvchi ro'yxatdan o'tadi. To'yxona egasini admin qo'shadi.
      const { data } = await api.post<{ user: User; token: string }>("/auth/register", { ...form, role: "USER" });
      login(data.token, data.user);
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Ro'yxatdan o'tishda xatolik"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Ro'yxatdan o'tish" subtitle="Bir necha qadamda hisob yarating">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ism" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          <Input label="Familiya" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </div>
        <Input label="Email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        <Input label="Telefon raqam" placeholder="+998901234567" required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <Input label="Foydalanuvchi nomi" required value={form.username} onChange={(e) => set("username", e.target.value)} />
        <Input label="Parol" type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} />

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Ro'yxatdan o'tish
        </Button>
      </form>

      <p className="mt-4 rounded-xl bg-gold-50 px-3 py-2 text-center text-xs text-gold-700">
        To'yxona egasimisiz? Hisobingizni administrator ochib beradi. So'ngra{" "}
        <Link to="/email-login" className="font-semibold underline">email orqali kiring</Link>.
      </p>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Hisobingiz bormi?{" "}
        <Link to="/login" className="font-semibold text-terracotta-600 hover:underline">
          Kirish
        </Link>
      </p>
    </AuthShell>
  );
}
