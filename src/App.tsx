//App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext'; 
import LoginPresentacional from './components/Login';
import Home from './components/Home'; // Asegúrate de que esta ruta sea correcta
import Header from './components/Header';
import { Toaster } from 'react-hot-toast';

// ✅ IMPORTACIONES SEPARADAS: Cada una a su archivo correspondiente
import ProtectedRoute from './components/Routing/ProtectedRoute';
import ProtectedDashboardLayout from './components/Routing/ProtectedDashboardLayout';
import AreaPacientes from './Pages/Pacientes/AreaPacientes';

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <Header /> 
            <Routes>
                {/* 🏠 RUTA RAÍZ: Ahora Home se renderiza aquí */}
                <Route path="/" element={<Home />} />

                {/* 🔑 RUTA PÚBLICA */}
                <Route path="/login" element={<LoginPresentacional />} />
                <Route path="/pacientes" element={<AreaPacientes />} />
                
                {/* 🔒 RUTAS PROTEGIDAS (Dashboard) */}
                <Route 
                    path="/personal/*" 
                    element={
                        <ProtectedRoute>
                            <ProtectedDashboardLayout />
                        </ProtectedRoute>
                    } 
                />

                {/* 🚫 CAPTURA DE RUTAS NO EXISTENTES: Redirige a Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
                
            </Routes>
        </AuthProvider>
    );
}

export default App;