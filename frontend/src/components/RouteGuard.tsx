import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./ui";
import type { Role } from "../types";

/** Faqat ruxsat etilgan rollar uchun. Aks holda login yoki home ga yo'naltiradi. */
export function RequireAuth({
  roles,
  redirectTo = "/login",
  children,
}: {
  roles?: Role[];
  redirectTo?: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Noto'g'ri rol — o'z paneliga qaytaramiz
    const home = user.role === "ADMIN" ? "/admin" : user.role === "OWNER" ? "/owner" : "/";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}

/** Tegishli rol uchun bosh sahifani aniqlash */
export function roleHome(role: Role): string {
  return role === "ADMIN" ? "/admin" : role === "OWNER" ? "/owner" : "/";
}
