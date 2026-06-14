import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthShell } from "../components/layout/AuthShell";
import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../components/RouteGuard";
import api, { apiError } from "../lib/api";
import type { User } from "../types";

export default function VerifyOTP() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const stateEmail = (location.state as { email?: string })?.email || "";

  const [email, setEmail] = useState(stateEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/verify-otp", { email, otp });
      login(data.token, data.user);
      toast.success("Hisobingiz tasdiqlandi!");
      navigate(roleHome(data.user.role), { replace: true });
    } catch (err) {
      toast.error(apiError(err, "Kod noto'g'ri"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Hisobni tasdiqlash" subtitle="Emailingizga yuborilgan 6 xonali kodni kiriting">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!stateEmail}
        />
        <Input
          label="Tasdiqlash kodi"
          inputMode="numeric"
          maxLength={6}
          placeholder="______"
          required
          className="text-center text-2xl tracking-[0.5em]"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Tasdiqlash
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/login" className="font-semibold text-terracotta-600 hover:underline">
          Kirishga qaytish
        </Link>
      </p>
    </AuthShell>
  );
}
