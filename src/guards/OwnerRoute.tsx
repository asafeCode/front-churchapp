import type { ReactNode, JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

interface OwnerRouteProps {
    children: ReactNode;
}

export const OwnerRoute = ({ children }: OwnerRouteProps): JSX.Element => {
    const { isOwner, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return isOwner ? <>{children}</> : <Navigate to="/dashboard" replace />;
};
