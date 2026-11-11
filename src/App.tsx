// App.tsx
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext'; 
import { ChatProvider } from "./Context/ChatContext"; 
import ChatFlotante from './components/ChatFlotante/ChatFlotante';
import ChatbotRAG from './components/ChatbotRAG/ChatbotRAG';
import ProtectedRoute from './components/Routing/ProtectedRoute';
import ProtectedDashboardLayout from './components/Routing/ProtectedDashboardLayout';
import { UserDataChecking } from './components/UserDataCheck/UserDataCheck';

// 🟢 Carga perezosa (Lazy loading)
const LoginPresentacional = lazy(() => import('./Pages/Login'));
const RegistroOculto = lazy(() => import('./Pages/RegistroOculto'));

// 🌐 Páginas de acceso público (Consultas Rápidas)
const Derivaciones = lazy(() => import('./Pages/Derivacion'));
const Insertos = lazy(() => import('./Pages/Insertos/Insertos'));

// Loader minimalista
const PageLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#6c757d' }}>
        <span>Cargando sistema...</span>
    </div>
);

// Componente interno para validar si se muestran los chats flotantes de IA según la sesión
const AsistenteIAPrivado: React.FC = () => {
    const { user } = useAuth();

    // Si no hay usuario logueado, no renderizamos los chats de IA
    if (!user) return null;

    return (
        <>
            <ChatFlotante />
            <ChatbotRAG />
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <ChatProvider>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* RUTA PÚBLICA DE ACCESO */}
                        <Route path="/login" element={<LoginPresentacional />} />
                        
                        {/* RUTA PRIVADA DE REGISTRO */}
                        <Route path="/labramosregistro" element={<RegistroOculto />} />
                        
                        {/* 🌐 RUTAS PÚBLICAS DE CONSULTA RÁPIDA */}
                        <Route path="/derivaciones" element={<Derivaciones />} />
                        <Route path="/insertos" element={<Insertos />} />
                        
                        {/* PERSONAL / PANEL INTERNO */}
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

                {/* 🤖 El Asistente IA solo se muestra si el usuario está autenticado */}
                <AsistenteIAPrivado />
            </ChatProvider>
        </AuthProvider>
    );
}

export default App;