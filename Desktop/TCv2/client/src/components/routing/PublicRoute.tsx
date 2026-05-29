import { Navigate, Outlet } from 'react-router-dom';
import { sessionManager } from '../../lib/sessionManager';

export default function PublicRoute() {
  const token = sessionManager.getToken();
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
}