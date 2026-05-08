// frontend/src/App.jsx
// Add SocketProvider import and wrap AppRoutes with it

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';   // ← ADD

// ... all your page imports stay the same ...
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import ReportIssue from './pages/ReportIssue';
import SchedulePickup from './pages/SchedulePickup';
import MyComplaints from './pages/MyComplaints';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import InstallPrompt from './components/InstallPrompt';
import { ThemeProvider } from './context/ThemeContext'; 
import DarkModeToggle   from './components/DarkModeToggle';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
      <Route path="/report" element={<PrivateRoute><ReportIssue /></PrivateRoute>} />
      <Route path="/schedule" element={<PrivateRoute><SchedulePickup /></PrivateRoute>} />
      <Route path="/my-complaints" element={<PrivateRoute><MyComplaints /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>    
    <AuthProvider>
      <SocketProvider>                    {/* ← WRAP HERE */}
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#166534', color: '#fff', borderRadius: '8px' },
              success: { style: { background: '#15803d' } },
              error: { style: { background: '#991b1b' } },
            }}
          />
          <InstallPrompt /> 
          <AppRoutes />
        </BrowserRouter>
      </SocketProvider>                   {/* ← CLOSE HERE */}
    </AuthProvider>
    </ThemeProvider>
  );
}