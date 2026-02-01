// src/pages/Personal/ManualDeEquipos/ManualEquipos.tsx

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const equiposDisponibles = [
    { id: 'cobas411', nombre: 'Cobas e411', icono: '🧪' },
    { id: 'cobas503', nombre: 'Cobas c503', icono: '🔬' },
    { id: 'vidas', nombre: 'VIDAS 3', icono: '🧫' },
    { id: 'iris', nombre: 'IRIS iQ200 (Orina)', icono: '🔬' },
    { id: 'proteinograma', nombre: 'Proteinogramas (SPEP)', icono: '🧬' },
];

const ManualEquipos: React.FC = () => {
    const location = useLocation();

    // Función para determinar si el link está activo (para estilos visuales)
    const getLinkClass = (path: string) => {
        // Verifica si la ruta actual coincide con el path del equipo para activar la pestaña.
        const isActive = location.pathname.includes(path);
        
        // Usamos las clases de Bootstrap para Nav-Tabs
        return `nav-link ${
            isActive 
            ? 'active text-success border-bottom border-success border-3 fw-bold' 
            : 'text-secondary bg-light'
        }`;
    };

    // Si la ruta es exactamente /personal/equipos, mostramos un mensaje de bienvenida
    const isIndex = location.pathname === '/personal/equipos';

    return (
        <div className="flex-grow-1 p-0">
            <h2 className="mb-4 fw-light text-secondary">
                Documentación de Equipos
            </h2>

            {/* 🟢 A. Menú de Equipos (NAV TABS SUPERIOR) 🟢 */}
            {/* Quitamos el div con d-flex flex-grow-1 que forzaba el layout lateral */}
            <div className="mb-4">
                <ul className="nav nav-tabs border-bottom-0">
                    {equiposDisponibles.map((equipo) => (
                        <li className="nav-item" key={equipo.id}>
                            <Link 
                                to={`/personal/equipos/${equipo.id}`} 
                                // Usamos las clases para simular una pestaña activa con la línea verde
                                className={getLinkClass(equipo.id)}
                            >
                                {equipo.icono} {equipo.nombre}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>


            {/* 🟢 B. Área de Contenido del Manual Seleccionado (Outlet) 🟢 */}
            <div className="flex-grow-1 p-3 border rounded shadow-sm bg-white">
                {isIndex ? (
                    // Mensaje inicial cuando no hay ningún equipo seleccionado
                    <div className="alert alert-info p-4">
                        <h4 className="alert-heading">Bienvenido al Manual de Equipos</h4>
                        <p className='mb-0'>Selecciona un instrumento en el menú superior para ver su manual de operación y documentación.</p>
                    </div>
                ) : (
                    // Aquí es donde se renderiza el componente de detalle (Cobas411Detail, VidasDetail, etc.)
                    <Outlet />
                )}
            </div>
            
        </div>
    );
};

export default ManualEquipos;