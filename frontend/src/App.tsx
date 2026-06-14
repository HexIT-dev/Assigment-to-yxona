import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { RequireAuth } from "./components/RouteGuard";

import Home from "./pages/Home";
import HallDetails from "./pages/HallDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import MyBookings from "./pages/MyBookings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* Ochiq sahifalar (Navbar + Footer bilan) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/halls/:id" element={<HallDetails />} />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth roles={["USER"]}>
              <MyBookings />
            </RequireAuth>
          }
        />
      </Route>

      {/* Auth sahifalari (layoutsiz) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Panel sahifalari */}
      <Route
        path="/admin"
        element={
          <RequireAuth roles={["ADMIN"]} redirectTo="/admin/login">
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/owner"
        element={
          <RequireAuth roles={["OWNER"]}>
            <OwnerDashboard />
          </RequireAuth>
        }
      />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
