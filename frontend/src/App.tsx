import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HallDetailsPage from './pages/HallDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import UserBookings from './pages/UserBookings';
import OwnerDashboard from './pages/OwnerDashboard';
import ChatPage from './pages/ChatPage';

import AdminLogin from './pages/AdminLogin';

const PrivateRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <main className="app-main">{children}</main>;
};

const ChatLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{
      marginTop: '4.75rem',
      height: 'calc(100vh - 4.75rem)',
      padding: '0.75rem 2rem',
      maxWidth: '1440px',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {children}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <AuthProvider>
        <Router>
          <div>
            <Navbar />
            <Routes>
              <Route path="/" element={<ClientLayout><LandingPage /></ClientLayout>} />
              <Route path="/halls/:id" element={<ClientLayout><HallDetailsPage /></ClientLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/chat" element={<PrivateRoute><ChatLayout><ChatPage /></ChatLayout></PrivateRoute>} />
              
              <Route 
                path="/admin/*" 
                element={
                  <PrivateRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />

              <Route 
                path="/owner/*" 
                element={
                  <PrivateRoute roles={['OWNER']}>
                    <OwnerDashboard />
                  </PrivateRoute>
                } 
              />

              <Route 
                path="/my-bookings" 
                element={
                  <PrivateRoute roles={['USER']}>
                    <ClientLayout>
                      <UserBookings />
                    </ClientLayout>
                  </PrivateRoute>
                } 
              />
              
              {/* Add more routes as needed */}
            </Routes>

            <Toaster 
              position="bottom-right"
              toastOptions={{
                className: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xl'
              }}
            />
          </div>
        </Router>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
