import { Outlet } from 'react-router-dom';

// ProtectedRoute - Now allows all access without authentication
// All routes are publicly accessible
export const ProtectedRoute = () => {
    return <Outlet />;
};
