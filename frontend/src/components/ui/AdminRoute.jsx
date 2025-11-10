import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * AdminRoute Component
 * 
 * This component protects admin routes:
 * - If user is logged in AND is admin: renders the protected component
 * - If user is not logged in: redirects to home
 * - If user is logged in but not admin: redirects to home
 */
function AdminRoute({ children, ...props }) {
  const { isLoggedIn, isAdmin } = useContext(AuthContext);

  // If not logged in, redirect to home
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // If logged in but not admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If logged in and is admin, render the protected component
  return children;
}

export default AdminRoute;

