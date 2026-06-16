//ProtectedDashboardLayout.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; 
import AreaPersonalDashboard from '../../Pages/Personal/AreaPersonalDashBoard';

// Importaciones existentes de las páginas
import Inicio from '../../Pages/Personal/Inicio/Inicio';
import Contactos from '../../Pages/Contactos';
import Ateneos from '../../Pages/Personal/Ateneos/Ateneos'; 
import Insertos from '../../Pages/Personal/Insertos/Insertos'; // Importación renombrada y corregida
import ManualEquipos from '../../Pages/Personal/ManualDeEquipos/ManualEquipos';
import ProyectosYObjetivos from '../../Pages/ProyectosYObjetivos/ProyectosYObjetivos';
import Bioseguridad from '../../Pages/Bioseguridad/Bioseguridad';
import NormasISO from '../../Pages/NormasISO/NormasISO';
import Derivaciones from '../../Pages/Derivaciones/Derivacion';
import CalendarioVacaciones from '../../Pages/Personal/Calendario/CalendarioVacaciones';
import CalendarioGuardias from '../../Pages/Personal/Calendario/CalendarioGuardias';
import Entretenimiento from '../../Pages/Personal/Entretenimiento/Entretenimiento';
import Stock from '../../Pages/Stock/Stock'; 
import Estadisticas from '../../Pages/Estadisticas/Estadisticas';

// Detalles de equipos
import Cobas411Detail from '../../Pages/Personal/ManualDeEquipos/Cobas411Detail';
import Cobas6000Detail from '../../Pages/Personal/ManualDeEquipos/Cobas6000Detail'
import Cobas503Detail from '../../Pages/Personal/ManualDeEquipos/Cobas503Detail';
import VidasDetail from '../../Pages/Personal/ManualDeEquipos/VidasDetail';
import LauraXLDetail from '../../Pages/Personal/ManualDeEquipos/LauraXL(Orina)';
import ProteinogramaDetail from '../../Pages/Personal/ManualDeEquipos/ProteinogramasDetail';

const ProtectedDashboardLayout: React.FC = () => {
    const { user, db, storage, appId } = useAuth();
    const userId = user?.uid || null; 

    return (
        <>
            <AreaPersonalDashboard>
                <Routes>
                    {/* RUTA DE INICIO */}
                    <Route index element={<Inicio />} />

                    {/* RUTAS GENERALES Y LABORATORIO */}
                    <Route 
                        path="ateneos" 
                        element={<Ateneos userId={userId} db={db} storage={storage} appId={appId} />} 
                    /> 
                    
                    {/* Cambiado de analisis a insertos */}
                    <Route path="insertos" element={<Insertos />} />
                    
                    <Route path="contactos" element={<Contactos />} />
                    <Route path="derivaciones" element={<Derivaciones />} />
                    <Route path="stock" element={<Stock />} />
                    <Route path="entretenimiento" element={<Entretenimiento />} />
                    <Route path="estadisticas" element={<Estadisticas />} />

                    {/* PLANIFICACIÓN Y NORMATIVAS */}
                    <Route path="proyectos" element={<ProyectosYObjetivos />} />
                    <Route path="bioseguridad" element={<Bioseguridad />} />
                    <Route path="normas" element={<NormasISO />} />

                    {/* CALENDARIOS */}
                    <Route path="calendario-guardias" element={<CalendarioGuardias/>} />
                    <Route path="calendario-vacaciones" element={<CalendarioVacaciones/>} />

                    {/* MANUAL DE EQUIPOS */}
                    <Route path="equipos" element={<ManualEquipos />} />
                    <Route path="equipos/cobas411" element={<Cobas411Detail />} /> 
                    <Route path="equipos/cobas6000" element={<Cobas6000Detail />} />
                    <Route path="equipos/cobas503" element={<Cobas503Detail />} />
                    <Route path="equipos/vidas" element={<VidasDetail />} />
                    <Route path="equipos/lauraxl" element={<LauraXLDetail />} />
                    <Route path="equipos/proteinograma" element={<ProteinogramaDetail />} />
                    
                    {/* FALLBACK LOCAL */}
                    <Route path="*" element={<Navigate to="." replace />} />
                </Routes>
            </AreaPersonalDashboard>
        </>
    );
};

export default ProtectedDashboardLayout;