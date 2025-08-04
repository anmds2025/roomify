import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ScreenLoader } from '@/components/loaders';
import { useAuthContext } from './useAuthContext';

interface RequireAuthProps {
  allowedLelves: string[]; // Các quyền mà người dùng cần có để truy cập vào route
}

const RequireAuth = ({ allowedLelves }: RequireAuthProps) => {
  const { isLoading, currentUser } = useAuthContext();
  const location = useLocation();
  if (isLoading) {
    return <ScreenLoader />;
  }
  if (!currentUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  const hasPermission = allowedLelves.some(level => currentUser.level?.includes(level));

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />; 
};

export { RequireAuth };
