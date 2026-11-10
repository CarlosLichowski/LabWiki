// ProtectedDashboardLayout.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; 
import AreaPersonalDashboard from '../../Pages/AreaPersonalDashBoard';

// Importaciones existentes de las páginas
import Inicio from '../../Pages/Inicio';
import Contactos from '../../Pages/Contactos';
import Ateneos from '../../Pages/Ateneos';
import Insertos from '../../Pages/Insertos/Insertos'; 
import ManualEquipos from '../../Pages/ManualDeEquipos/ManualEquipos';
import ProyectosYObjetivos from '../../Pages/ProyectosYObjetivos';
import Bioseguridad from '../../Pages/Bioseguridad/Bioseguridad';
import Derivaciones from '../../Pages/Derivacion';
import CalendarioVacaciones from '../../Pages/Calendario/CalendarioVacaciones';
import CalendarioGuardias from '../../Pages/Calendario/CalendarioGuardias';
import Entretenimiento from '../../Pages/Entretenimiento';
import Estadisticas from '../../Pages/Metricas/Estadisticas';

// Detalles de equipos
import Cobas411Detail from '../../Pages/ManualDeEquipos/Cobas411Detail';
import Cobas6000Detail from '../../Pages/ManualDeEquipos/Cobas6000Detail';
import Cobas503Detail from '../../Pages/ManualDeEquipos/Cobas503Detail';
import VidasDetail from '../../Pages/ManualDeEquipos/VidasDetail';
import LauraXLDetail from '../../Pages/ManualDeEquipos/LauraXL(Orina)';
import ProteinogramaDetail from '../../Pages/ManualDeEquipos/ProteinogramasDetail';
import StaCompactMax from '../../Pages/ManualDeEquipos/StaComapctMax';
import PaseDeTurno from '../../Pages/PaseDeTurno';
import InnovacionYNuevasMetodologias from '../../Pages/InnovaciónyNuevasMetodologías';
import RegistroIncidencias from '../../Pages/Metricas/PlanillasIncidencias';
import EstadisticasReactivos from '../../Pages/Metricas/EstadisticasReactivos';
import { EstadisticasReactivosPlanta } from '../../Pages/Metricas/PlanillaConsumoReactivos';
import { GraficosYMetricas } from '../../Pages/Metricas/GraficosYMetricas';
import ControlReactivosCobas from '../../Pages/Metricas/ControlReactivosCobas';

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
                    
                    <Route path="insertos" element={<Insertos />} />
                    
                    <Route path="contactos" element={<Contactos />} />
                    <Route path="derivaciones" element={<Derivaciones />} />
                    <Route path="entretenimiento" element={<Entretenimiento />} />

                    {/* PLANIFICACIÓN Y NORMATIVAS */}
                    <Route path="proyectos" element={<ProyectosYObjetivos />} />
                    <Route path="bioseguridad" element={<Bioseguridad />} />

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
                    <Route path='equipos/StaCompactMax' element={<StaCompactMax/>}/>

                    {/* Pase de Turno */}
                    <Route path='pase' element={<PaseDeTurno/>}/>

                    {/* Innovaciones */}
                    <Route path='Innovacion' element={<InnovacionYNuevasMetodologias/>}/>

                    {/* Estadisticas - Menú Principal */}
                    <Route path='Estadisticas' element={<Estadisticas/>}/>
                    <Route path='estadisticas' element={<Estadisticas/>}/>

                    {/* Planilla Registro Incidencias */}
                    <Route path='estadisticas/registroIncidencias' element={<RegistroIncidencias/>}/>
                    <Route path='estadisticas/registroincidencias' element={<RegistroIncidencias/>}/>

                    {/* Módulo Roche Cobas: Carga Mensual y Métricas */}
                    <Route path='estadisticas/estadisticasReactivos' element={<EstadisticasReactivos/>}/>
                    <Route path='estadisticas/estadisticasreactivos' element={<EstadisticasReactivos/>}/>
                    <Route path='estadisticas/estadisticasReactivos/Planta' element={<EstadisticasReactivosPlanta/>}/>
                    <Route path='estadisticas/estadisticasReactivos/planta' element={<EstadisticasReactivosPlanta/>}/>
                    <Route path='estadisticas/estadisticasReactivos/Guardia' element={<ControlReactivosCobas tabInicial="carga" />}/>
                    <Route path='estadisticas/estadisticasReactivos/guardia' element={<ControlReactivosCobas tabInicial="carga" />}/>

                    {/* Pestaña 1: Panel y Métricas */}
                    <Route path='estadisticas/Metricas' element={<GraficosYMetricas/>}/>
                    <Route path='estadisticas/metricas' element={<GraficosYMetricas/>}/>

                    {/* Ruta directa para Control Analítico Roche Cobas */}
                    <Route path='estadisticas/cobas' element={<ControlReactivosCobas tabInicial="metricas" />}/>
                    <Route path='estadisticas/control-reactivos' element={<ControlReactivosCobas tabInicial="carga" />}/>

                    {/* FALLBACK LOCAL */}
                    <Route path="*" element={<Navigate to="." replace />} />
                </Routes>
            </AreaPersonalDashboard>
        </>
    );
};

export default ProtectedDashboardLayout;
