// src/components/Routing/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation(); // 📍 Para recordar la ruta de origen

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <h5 className="text-muted animate-pulse">Verificando credenciales...</h5>
            </div>
        );
    }

    if (!user) {
        // Redirigimos al login pero guardamos la ubicación actual en el estado del router
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;