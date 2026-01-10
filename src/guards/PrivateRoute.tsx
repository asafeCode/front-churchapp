import type { ReactNode, JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

interface PrivateRouteProps {
    children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps): JSX.Element => {
    const { isAdmin } = useAuth();
    return isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};

export const MemberRoute = ({ children }: PrivateRouteProps): JSX.Element => {
    const { isMember, isAdmin } = useAuth();
    return isMember || isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};
