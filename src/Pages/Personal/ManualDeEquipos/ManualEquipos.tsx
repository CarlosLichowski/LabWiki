// src/pages/Personal/ManualDeEquipos/ManualEquipos.tsx
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const equiposDisponibles = [
    { id: 'cobas6000', nombre: 'Cobas 6000', icono: '🧪' },
    { id: 'cobas411', nombre: 'Cobas e411', icono: '🔬' },
    { id: 'vidas', nombre: 'VIDAS 3', icono: '🧫' },
    { id: 'lauraxl', nombre: 'LauraXl (Orina)', icono: '🔬' },
    { id: 'proteinograma', nombre: 'Proteinogramas (SPEP)', icono: '🧬' },
];

const ManualEquipos: React.FC = () => {
    const location = useLocation();

    // Determina si el link está activo inspeccionando el final del path de forma segura
    const getLinkClass = (path: string) => {
        const isActive = location.pathname.endsWith(path);
        return `nav-link ${
            isActive 
            ? 'active text-success border-bottom border-success border-3 fw-bold bg-white' 
            : 'text-secondary bg-light'
        }`;
    };

    // Verifica si estamos parados exactamente en la raíz de equipos para mostrar el mensaje inicial
    const isIndex = location.pathname === '/equipos' || location.pathname === '/equipos/';

    return (
        <div className="flex-grow-1 p-0 animate__animated animate__fadeIn">
            <h2 className="mb-4 fw-light text-secondary">
                Documentación de Equipos
            </h2>

            {/* 🟢 A. Menú de Equipos (NAV TABS SUPERIOR) 🟢 */}
            <div className="mb-4">
                <ul className="nav nav-tabs border-bottom-0">
                    {equiposDisponibles.map((equipo) => (
                        <li className="nav-item" key={equipo.id}>
                            <Link 
                                to={`/equipos/${equipo.id}`} 
                                className={getLinkClass(equipo.id)}
                            >
                                {equipo.icono} {equipo.nombre}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 🟢 B. Área de Contenido Dinámico (Outlet) 🟢 */}
            <div className="flex-grow-1 p-3 border rounded shadow-sm bg-white">
                {isIndex ? (
                    <div className="alert alert-info p-4 mb-0">
                        <h4 className="alert-heading fw-bold">Bienvenido al Manual de Equipos</h4>
                        <p className='mb-0'>Selecciona un instrumento en el menú superior para ver su manual de operación y documentación técnica.</p>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>

            {/* Botón Inferior de Retorno */}
            <div className="d-flex justify-content-center mt-5">
                <Link 
                    to="/" 
                    className="btn bg-secondary-subtle text-dark border d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold transition-all shadow-sm"
                    style={{ textDecoration: 'none' }}
                >
                    <ArrowLeft size={16} className="text-success" /> 
                    <span>Volver al Inicio</span>
                </Link>
            </div>
        </div>
    );
};

export default ManualEquipos;