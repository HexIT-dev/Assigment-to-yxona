import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthShell } from "../components/layout/AuthShell";
import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../components/RouteGuard";
import api, { apiError } from "../lib/api";
import type { User } from "../types";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ user: User; token: string }>("/auth/login", form);
      login(data.token, data.user);
      toast.success(`Xush kelibsiz, ${data.user.firstName}!`);
      const from = (location.state as { from?: string })?.from;
      navigate(from && data.user.role === "USER" ? from : roleHome(data.user.role), { replace: true });
    } catch (err: any) {
      // Owner birinchi marta kirsa — OTP tasdiqlash kerak
      if (err?.response?.data?.needsVerification) {
        toast("Hisobingizni tasdiqlang. Emailingizga kod yuborildi.", { icon: "✉️" });
        navigate("/verify-otp", { state: { email: err.response.data.email } });
        return;
      }
      toast.error(apiError(err, "Login yoki parol noto'g'ri"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Tizimga kirish" subtitle="Hisobingizga kirib bron qilishni davom ettiring">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Foydalanuvchi nomi"
          name="username"
          placeholder="username"
          autoComplete="username"
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <Input
          label="Parol"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="text-right">
          <Link to="/email-login" className="text-sm font-medium text-cobalt-500 hover:underline">
            Parolni unutdingizmi?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Kirish
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-cream-300 bg-cream-100/60 p-4 text-sm">
        <p className="mb-2 font-semibold text-ink">Sinov uchun loginlar:</p>
        <ul className="space-y-1 text-ink-soft">
          <li>👤 Foydalanuvchi: <span className="font-mono text-ink">user</span> / <span className="font-mono text-ink">1234</span></li>
          <li>🏛️ To'yxona egasi: <span className="font-mono text-ink">ilhom</span> / <span className="font-mono text-ink">1234</span></li>
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Hisobingiz yo'qmi?{" "}
        <Link to="/register" className="font-semibold text-terracotta-600 hover:underline">
          Ro'yxatdan o'ting
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-ink-soft/70">
        Administrator?{" "}
        <Link to="/admin/login" className="font-medium text-cobalt-500 hover:underline">
          Admin kirish
        </Link>
      </p>
    </AuthShell>
  );
}
