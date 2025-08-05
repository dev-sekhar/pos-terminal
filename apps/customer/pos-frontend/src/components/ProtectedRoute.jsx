import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getUserPermissions } from '@pos-terminal/permissions'; // Import our shared permissions logic

/**
 * A component that protects routes based on user permissions.
 * @param {{ requiredPermission: string, children: React.ReactNode }} props
 */
const ProtectedRoute = ({ requiredPermission }) => {
  const { user } = useUser();

  // This should not happen if used within the main protected route wrapper, but it's a safeguard.
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Get the list of permissions for the current user's role.
  const userPermissions = getUserPermissions(user.role);

  // Check if the user's permissions include the one required for this route.
  if (userPermissions.includes(requiredPermission)) {
    // If they have permission, render the child component (e.g., <Dashboard />).
    return <Outlet />;
  } else {
    // If they don't have permission, redirect them to a safe default page.
    // The sales page is a good default for a cashier.
    return <Navigate to="/sales" />;
  }
};

export default ProtectedRoute;