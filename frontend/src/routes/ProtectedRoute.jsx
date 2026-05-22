import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export default function ProtectedRoute({ roles }) {
  const { accessToken, profile } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
