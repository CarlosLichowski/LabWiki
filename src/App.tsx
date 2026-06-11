// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext'; 
import { ChatProvider } from "./Context/ChatContext"; // 🌟 Asegurate de importar el Provider del chat
import LoginPresentacional from './components/Login';
import ChatFlotante from "./components/ChatFlotante/ChatFlotante"; // 🌟 Importamos el componente visual

import ProtectedRoute from './components/Routing/ProtectedRoute';
import ProtectedDashboardLayout from './components/Routing/ProtectedDashboardLayout';

function App() {
    return (
        <AuthProvider>
            <ChatProvider> {/* 🧠 La lógica del chat tiene acceso a los datos de Auth */}
                
                <Routes>
                    {/* 🔑 RUTA PÚBLICA DE ACCESO */}
                    <Route path="/login" element={<LoginPresentacional />} />
                    
                    {/* 🔒 PORTAL PERSONAL COMPLETO */}
                    <Route 
                        path="/*" 
                        element={
                            <ProtectedRoute>
                                <ProtectedDashboardLayout />
                            </ProtectedRoute>
                        } 
                    />

                    {/* 🚫 CAPTURA CUALQUIER OTRA RUTA ANÓMALA */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* 👀 El componente visual vive de forma global pero respeta el contexto */}
                <ChatFlotante /> 

            </ChatProvider>
        </AuthProvider>
    );
}

export default App;