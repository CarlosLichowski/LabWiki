//ProtectedDashboard

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; 
import AreaPersonalDashboard from '../../Pages/Personal/AreaPersonalDashBoard';

// Componentes
import Ateneos from '../../Pages/Personal/Ateneos/Ateneos'; 
import AnalisisProcedimientos from '../../Pages/AnalisisProcedimientos';
import ManualEquipos from '../../Pages/Personal/ManualDeEquipos/ManualEquipos';
import Cobas411Detail from '../../Pages/Personal/ManualDeEquipos/Cobas411Detail';
import Cobas503Detail from '../../Pages/Personal/ManualDeEquipos/Cobas503Detail';
import VidasDetail from '../../Pages/Personal/ManualDeEquipos/VidasDetail';
import IrisIQ200Detail from '../../Pages/Personal/ManualDeEquipos/IrisIQ200';
import ProteinogramaDetail from '../../Pages/Personal/ManualDeEquipos/ProteinogramasDetail';
import Favoritos from '../../Pages/Favoritos'; 
import Historial from '../../Pages/Historial'; 
import Configuracion from '../../Pages/Configuracion';


const DashboardInicio: React.FC = () => (
    <div className="alert alert-info p-4 border-0 bg-success-subtle text-success">
        <h4 className="alert-heading">¡Bienvenido de vuelta!</h4>
        <p className='mb-0'>Selecciona una sección en el menú lateral para empezar.</p>
    </div>
);

const ProtectedDashboardLayout: React.FC = () => {
    const { user, db, storage, appId } = useAuth();
    const userId = user?.uid || null; 

    return (
        <AreaPersonalDashboard>
            <Routes>
                <Route index element={<DashboardInicio />} />
                <Route path="ateneos" element={
                    <Ateneos userId={userId} db={db} appId={appId} storage={storage} />
                } />                 
                <Route path="analisis" element={<AnalisisProcedimientos />} />

                <Route path="equipos" element={<ManualEquipos />}>
                    <Route path="cobas411" element={<Cobas411Detail />} /> 
                    <Route path="cobas503" element={<Cobas503Detail />} />
                    <Route path="vidas" element={<VidasDetail />} />
                    <Route path="iris" element={<IrisIQ200Detail />} />
                    <Route path="proteinograma" element={<ProteinogramaDetail />} />
                    <Route path="*" element={<Navigate to="/personal/equipos" replace />} />
                </Route>
                
                <Route path="favoritos" element={<Favoritos />} /> 
                <Route path="historial" element={<Historial />} /> 
                <Route path="configuracion" element={<Configuracion />} /> 
                <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
        </AreaPersonalDashboard>
    );
};

export default ProtectedDashboardLayout;