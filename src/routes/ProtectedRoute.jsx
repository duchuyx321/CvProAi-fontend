import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "~/context/AuthContext";

function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role check
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    const userRole = user?.role;

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;