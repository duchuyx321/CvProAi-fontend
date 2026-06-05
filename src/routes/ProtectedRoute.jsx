import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { config } from '~/config';
import { useAuth } from '~/context/AuthContext';

function ProtectedRoute({ children, role, publicOnly = false }) {
    const location = useLocation();
    const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

    if (!isInitialized || isLoading) {
        return (
            <div
                style={{
                    minHeight: '60vh',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <div>Loading...</div>
            </div>
        );
    }

    const userRole = user?.role;

    // Route public/guest
    // Guest vào được
    // USER vào được
    // ADMIN không được vào, đá về /admin
    if (publicOnly) {
        if (isAuthenticated && userRole === 'ADMIN') {
            return <Navigate to={config.router.adminDashboard} replace />;
        }

        return children ?? <Outlet />;
    }

    // Route cần đăng nhập
    if (!isAuthenticated || !user) {
        return (
            <Navigate
                to={config.router.login}
                replace
                state={{ from: location }}
            />
        );
    }

    // Check role
    if (role) {
        const allowedRoles = Array.isArray(role) ? role : [role];

        if (!allowedRoles.includes(userRole)) {
            if (userRole === 'ADMIN') {
                return <Navigate to={config.router.adminDashboard} replace />;
            }

            if (userRole === 'USER') {
                return <Navigate to={config.router.dashboard} replace />;
            }

            return <Navigate to={config.router.login} replace />;
        }
    }

    return children ?? <Outlet />;
}

export default ProtectedRoute;
