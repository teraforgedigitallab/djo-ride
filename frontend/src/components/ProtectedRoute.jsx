import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Show loading spinner while checking auth status
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login if user is not authenticated
        // Save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin()) {
        toast.error("You don't have permission to access this page");
        return <Navigate to="/" replace />;
    }

    return children;
};