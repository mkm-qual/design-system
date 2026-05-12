import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Role } from '../../types';

interface Props {
  children: ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { currentUser } = useAuthStore();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const rank = { admin: 3, editor: 2, viewer: 1 };
    if (rank[currentUser.role] < rank[requiredRole]) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
