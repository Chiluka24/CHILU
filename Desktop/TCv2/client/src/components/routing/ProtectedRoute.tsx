import { Navigate, Outlet } from 'react-router-dom';
import { sessionManager } from '../../lib/sessionManager';

export default function ProtectedRoute() {
  const token = sessionManager.getToken();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}