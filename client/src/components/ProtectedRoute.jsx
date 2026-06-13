import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice';

const ProtectedRoute = ({ children, requiredRole = null, requiredPlan = null }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login but save the attempted URL to return to after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Role-based guarding (e.g. Admin only)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Plan-based gating (e.g. 'business' plan required for Workspace)
  if (requiredPlan) {
    const plans = ['free', 'business', 'pro', 'vip'];
    const userPlanIndex = plans.indexOf(user.plan || 'free');
    const requiredPlanIndex = plans.indexOf(requiredPlan);

    if (userPlanIndex < requiredPlanIndex) {
      return <Navigate to="/upgrade" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
