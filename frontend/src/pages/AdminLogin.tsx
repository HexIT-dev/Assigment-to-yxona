import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { Button, Input } from "../components/ui";
import { SuzaniRosette, IslimiVine } from "../components/ornaments/Suzani";
import { useAuth } from "../context/AuthContext";
import api, { apiError } from "../lib/api";
import type { User } from "../types";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ user: User; token: string }>("/auth/login", form);
      if (data.user.role !== "ADMIN") {
        toast.error("Bu sahifa faqat administrator uchun");
        return;
      }
      login(data.token, data.user);
      toast.success("Administrator paneliga xush kelibsiz");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Login yoki parol noto'g'ri"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-cobalt-800 p-6">
      <div className="suzani-bg absolute inset-0 opacity-10" />
      <SuzaniRosette className="absolute -left-20 -top-20 h-96 w-96 text-gold-400/20" />
      <SuzaniRosette className="absolute -bottom-24 -right-20 h-[28rem] w-[28rem] text-terracotta-400/15" />
      <IslimiVine className="absolute right-16 top-1/4 h-40 w-40 text-cobalt-500/40" />

      <div className="relative w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-cobalt-700 text-gold-400">
              <ShieldCheck size={28} />
            </span>
            <h1 className="font-display text-2xl font-bold text-cobalt-700">Administrator paneli</h1>
            <p className="mt-1 text-sm text-ink-soft">Boshqaruv tizimiga kirish</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Foydalanuvchi nomi"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              label="Parol"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" variant="secondary" fullWidth size="lg" loading={loading}>
              Kirish
            </Button>
          </form>

          <div className="mt-5 rounded-xl border border-cobalt-100 bg-cobalt-50 p-4 text-sm">
            <p className="mb-1 font-semibold text-cobalt-700">Sinov uchun admin:</p>
            <p className="text-ink-soft">
              Login: <span className="font-mono text-ink">admin123</span> · Parol: <span className="font-mono text-ink">admin123</span>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-cream-200/70">
          <Link to="/" className="hover:text-gold-300">← Bosh sahifaga qaytish</Link>
        </p>
      </div>
    </div>
  );
}
