// src/components/Routing/ProtectedDashboardLayout.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; 
import AreaPersonalDashboard from '../../Pages/Personal/AreaPersonalDashBoard';

// Importaciones existentes
import Inicio from '../../Pages/Personal/Inicio/Inicio';
import Contactos from '../../Pages/Contactos';
import Ateneos from '../../Pages/Personal/Ateneos/Ateneos'; 
import AnalisisProcedimientos from '../../Pages/AnalisisProcedimientos';
import ManualEquipos from '../../Pages/Personal/ManualDeEquipos/ManualEquipos';
import ProyectosYObjetivos from '../../Pages/ProyectosYObjetivos/ProyectosYObjetivos';
import Bioseguridad from '../../Pages/Bioseguridad/Bioseguridad';
import NormasISO from '../../Pages/NormasISO/NormasISO';
import Derivaciones from '../../Pages/Derivaciones/Derivacion';
import CalendarioVacaciones from '../../Pages/Personal/Calendario/CalendarioVacaciones';
import CalendarioGuardias from '../../Pages/Personal/Calendario/CalendarioGuardias';

// --- NUEVA IMPORTACIÓN ---
import Entretenimiento from '../../Pages/Personal/Entretenimiento/Entretenimiento';// Ajusta la ruta si el archivo está en otra carpeta

// Detalles de equipos...
import Estadisticas from '../../Pages/Estadisticas/Estadisticas';
import ControlCalidadInterno from '../../Pages/Estadisticas/ControlCalidadInterno';
import Cobas411Detail from '../../Pages/Personal/ManualDeEquipos/Cobas411Detail';
import Cobas503Detail from '../../Pages/Personal/ManualDeEquipos/Cobas503Detail';
import VidasDetail from '../../Pages/Personal/ManualDeEquipos/VidasDetail';
import IrisIQ200Detail from '../../Pages/Personal/ManualDeEquipos/IrisIQ200';
import ProteinogramaDetail from '../../Pages/Personal/ManualDeEquipos/ProteinogramasDetail';

const ProtectedDashboardLayout: React.FC = () => {
    const { user, db, storage, appId } = useAuth();
    const userId = user?.uid || null; 

    return (
        <AreaPersonalDashboard>
            <Routes>
                {/* RUTA DE INICIO */}
                <Route index element={<Inicio />} />

                {/* RUTAS GENERALES */}
                <Route 
                    path="ateneos" 
                    element={<Ateneos userId={userId} db={db} storage={storage} appId={appId} />} 
                /> 
                
                <Route path="analisis" element={<AnalisisProcedimientos />} />
                <Route path="contactos" element={<Contactos />} />
                <Route path="derivaciones" element={<Derivaciones />} />
                
                {/* NUEVA RUTA DE ENTRETENIMIENTO */}
                <Route path="entretenimiento" element={<Entretenimiento />} />

                {/* CALIDAD Y ESTADÍSTICA */}
                <Route path="estadisticas" element={<Estadisticas />} />
                <Route path="control-calidad" element={<ControlCalidadInterno />} />

                {/* PLANIFICACIÓN Y NORMATIVAS */}
                <Route path="proyectos" element={<ProyectosYObjetivos />} />
                <Route path="bioseguridad" element={<Bioseguridad />} />
                <Route path="normas" element={<NormasISO />} />

                {/* CALENDARIOS */}
                <Route path="calendario-guardias" element={<CalendarioGuardias/>} />
                <Route path="calendario-vacaciones" element={<CalendarioVacaciones/>} />

                {/* MANUAL DE EQUIPOS (Rutas Anidadas) */}
                <Route path="equipos" element={<ManualEquipos />}>
                    <Route path="cobas411" element={<Cobas411Detail />} /> 
                    <Route path="cobas503" element={<Cobas503Detail />} />
                    <Route path="vidas" element={<VidasDetail />} />
                    <Route path="iris" element={<IrisIQ200Detail />} />
                    <Route path="proteinograma" element={<ProteinogramaDetail />} />
                    <Route path="*" element={<Navigate to="/personal/equipos" replace />} />
                </Route>
                
                {/* FALLBACK: Redirige a la raíz del dashboard si la ruta no existe */}
                <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
        </AreaPersonalDashboard>
    );
};

export default ProtectedDashboardLayout;