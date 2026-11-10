// App.tsx
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext'; 
import { ChatProvider } from "./Context/ChatContext"; 
import ChatFlotante from './components/ChatFlotante/ChatFlotante';
import ProtectedRoute from './components/Routing/ProtectedRoute';
import ProtectedDashboardLayout from './components/Routing/ProtectedDashboardLayout';
import { UserDataChecking } from './components/UserDataCheck/UserDataCheck'; // Importación del validador

// 🟢 Carga perezosa (Lazy loading): Solo descarga el JS de estas vistas al navegar a sus URLs
const LoginPresentacional = lazy(() => import('./Pages/Login'));
const RegistroOculto = lazy(() => import('./Pages/RegistroOculto'));

// Loader minimalista para la transición de carga de fragmentos de JS (Mantiene el FCP bajo)
const PageLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#6c757d' }}>
        <span>Cargando sistema...</span>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <ChatProvider>
                
                
                {/* 🟢 Suspense intercepta las cargas asíncronas de los componentes perezosos */}
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* RUTA PÚBLICA DE ACCESO */}
                        <Route path="/login" element={<LoginPresentacional />} />
                        
                        {/* RUTA PRIVADA DE REGISTRO */}
                        <Route path="/labramosregistro" element={<RegistroOculto />} />
                        
                        {/* PERSONAL / PANEL INTERNO (Protegido con RouteGuard y el validador de datos) */}
                        <Route 
                            path="/*" 
                            element={
                                <ProtectedRoute>
                                    <UserDataChecking>
                                        <ProtectedDashboardLayout />
                                    </UserDataChecking>
                                </ProtectedRoute>
                            } 
                        />

                        {/* Redirección por defecto a raíz */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>

                 <ChatFlotante /> 
            </ChatProvider>
        </AuthProvider>
    );
}

export default App;