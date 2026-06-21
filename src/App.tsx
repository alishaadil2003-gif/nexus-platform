import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { EntrepreneurDashboard } from './pages/dashboard/EntrepreneurDashboard';
import { InvestorDashboard } from './pages/dashboard/InvestorDashboard';
import { EntrepreneurProfile } from './pages/profile/EntrepreneurProfile';
import { InvestorProfile } from './pages/profile/InvestorProfile';
import { InvestorsPage } from './pages/investors/InvestorsPage';
import { EntrepreneursPage } from './pages/entrepreneurs/EntrepreneursPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HelpPage } from './pages/help/HelpPage';
import { DealsPage } from './pages/deals/DealsPage';
import { ChatPage } from './pages/chat/ChatPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { VideoCallPage } from './pages/video/VideoCallPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="entrepreneur" element={<EntrepreneurDashboard />} />
        <Route path="investor" element={<InvestorDashboard />} />
      </Route>

      <Route path="/profile" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="entrepreneur/:id" element={<EntrepreneurProfile />} />
        <Route path="investor/:id" element={<InvestorProfile />} />
      </Route>

      <Route path="/investors" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<InvestorsPage />} />
      </Route>
      <Route path="/entrepreneurs" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<EntrepreneursPage />} />
      </Route>
      <Route path="/messages" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<MessagesPage />} />
      </Route>
      <Route path="/notifications" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<NotificationsPage />} />
      </Route>
      <Route path="/documents" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DocumentsPage />} />
      </Route>
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<SettingsPage />} />
      </Route>
      <Route path="/help" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<HelpPage />} />
      </Route>
      <Route path="/deals" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DealsPage />} />
      </Route>
      <Route path="/chat" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ChatPage />} />
        <Route path=":userId" element={<ChatPage />} />
      </Route>
      <Route path="/meetings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<MeetingsPage />} />
      </Route>
      <Route path="/payments" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<PaymentsPage />} />
      </Route>
      <Route path="/call/:meetingId" element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>} />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
