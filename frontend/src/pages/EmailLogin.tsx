import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthShell } from "../components/layout/AuthShell";
import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../components/RouteGuard";
import api, { apiError } from "../lib/api";
import type { User } from "../types";

/**
 * Email orqali kirish / parolni tiklash.
 * 1-qadam: email kiritish -> emailga kod yuboriladi.
 * 2-qadam: kodni kiritish -> tizimga kiradi. So'ng profilda parol o'rnatishi mumkin.
 * Barcha rollar uchun (foydalanuvchi, ega, admin) ishlaydi.
 */
export default function EmailLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/request-code", { email });
      toast.success("Kod emailingizga yuborildi");
      setStep("code");
    } catch (err) {
      toast.error(apiError(err, "Kod yuborishda xatolik"));
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/verify-otp", { email, otp });
      login(data.token, data.user);
      toast.success("Tizimga kirdingiz! Parolingizni o'rnating.");
      // Kirgandan so'ng profilga yo'naltiramiz — u yerda parol o'rnatadi
      navigate("/profile", { replace: true, state: { setPassword: true, home: roleHome(data.user.role) } });
    } catch (err) {
      toast.error(apiError(err, "Kod noto'g'ri yoki muddati o'tgan"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Email orqali kirish"
      subtitle={
        step === "email"
          ? "Emailingizni kiriting — tasdiqlash kodi yuboramiz"
          : "Emailingizga yuborilgan kodni kiriting"
      }
    >
      {step === "email" ? (
        <form onSubmit={sendCode} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Kod yuborish
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <Input label="Email" type="email" value={email} disabled />
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
            Kirish
          </Button>
          <button
            type="button"
            onClick={() => { setStep("email"); setOtp(""); }}
            className="w-full text-center text-sm text-ink-soft hover:text-cobalt-600"
          >
            ← Boshqa email kiritish
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/login" className="font-semibold text-terracotta-600 hover:underline">
          Parol bilan kirishga qaytish
        </Link>
      </p>
    </AuthShell>
  );
}
