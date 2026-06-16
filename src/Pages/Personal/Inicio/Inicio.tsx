// src/pages/Inicio.tsx (o src/components/Inicio.tsx)
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Microscope, FileText, ClipboardList, HardDrive, Contact, Calendar, ArrowRight } from 'lucide-react';

const Inicio: React.FC = () => {
    const modulos = [
        {
            title: 'Ateneos y Cursos',
            description: 'Sesiones clínicas y Cursos Tecnicos.',
            path: '/ateneos',
            icon: <Users size={32} className="text-primary" />,
            bgIcon: 'bg-primary-subtle',
            actionText: 'Acceder'
        },
        {
            title: 'Determinaciones',
            description: 'Biblioteca de metodologías y documentación .',
            path: '/insertos',
            icon: <FileText size={32} className="text-success" />,
            bgIcon: 'bg-success-subtle',
            actionText: 'Consultar'
        },
        {
            title: 'Derivaciones',
            description: 'Seguimiento y control de muestras externas.',
            path: '/derivaciones',
            icon: <Microscope size={32} className="text-info" />, // Cambiado a text-info para contrastar
            bgIcon: 'bg-info-subtle',
            actionText: 'Acceder'
        },

                {
            title: 'Manual de Equipos',
            description: 'Documentación técnica, guías de uso y mantenimiento.',
            path: '/equipos',
            icon: <HardDrive size={32} style={{ color: '#6366f1' }} />, // Color índigo moderno
            bgIcon: 'bg-indigo-subtle',
            actionText: 'Acceder'
        },
            {
            title: 'Contactos',
            description: 'Agenda centralizada de personal y entidades externas.',
            path: '/contactos',
            icon: <Contact size={32} className="text-danger" />,
            bgIcon: 'bg-danger-subtle',
            actionText: 'Ver agenda'
        },
        {
            title: 'Inventario',
            description: 'Control de stock y suministros del laboratorio.',
            path: '/stock',
            icon: <ClipboardList size={32} className="text-warning" />,
            bgIcon: 'bg-warning-subtle',
            actionText: 'Acceder'
        },

        {
            title: 'Calendarios',
            description: 'Organización de guardias internas y vacaciones.',
            path: '/calendario-guardias',
            icon: <Calendar size={32} className="text-dark" />,
            bgIcon: 'bg-secondary-subtle',
            actionText: 'Ver turnos'
        },

    ];

    return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-75 py-5 px-3" style={{ backgroundColor: '#f8f9fa' }}>
            
            {/* Título Estilizado */}
            <div className="text-center mb-5">
                <h1 className="fw-black text-dark position-relative d-inline-block pb-2 m-0" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
                    Panel de Control
                    <span className="position-absolute bottom-0 start-50 translate-middle-x bg-dark rounded" style={{ width: '60px', height: '4px' }}></span>
                </h1>
            </div>

            {/* Grid de Cartas */}
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="row g-4 justify-content-center">
                    {modulos.map((modulo, index) => (
                        <div key={index} className="col-12 col-md-6 col-lg-4">
                            <Link to={modulo.path} className="text-decoration-none text-dark card-hover-effect d-block h-100">
                                <div className="card h-100 border border-light-subtle shadow-sm rounded-4 p-4 bg-white d-flex flex-column justify-content-between position-relative overflow-hidden transition-all">
                                    
                                    <div>
                                        {/* Contenedor del Icono Superior */}
                                        <div className={`d-flex align-items-center justify-content-center rounded-3 mb-4 ${modulo.bgIcon}`} style={{ width: '60px', height: '60px' }}>
                                            {modulo.icon}
                                        </div>

                                        {/* Textos principales */}
                                        <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '1.5rem', letterSpacing: '-0.3px' }}>
                                            {modulo.title}
                                        </h2>
                                        <p className="text-muted mb-4 lh-base" style={{ fontSize: '0.9rem' }}>
                                            {modulo.description}
                                        </p>
                                    </div>

                                    {/* Indicador de Acción Alineado a la Derecha */}
                                    <div className="d-flex align-items-center justify-content-end text-success fw-bold small text-uppercase tracking-wider action-link mt-auto pt-2">
                                        <span>{modulo.actionText || 'Acceder'}</span>
                                        <ArrowRight size={16} className="ms-1 transition-transform arrow-icon" />
                                    </div>

                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Técnico Inferior */}
            <div className="mt-5 d-flex align-items-center gap-2 text-muted fw-medium" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                <span className="d-inline-block bg-success rounded-circle animate-pulse" style={{ width: '8px', height: '8px' }}></span>
                <span>Hospital Ramos Mejia</span>

            </div>

            {/* Estilos CSS locales y clases personalizadas para Bootstrap */}
            <style>{`
                .fw-black { font-weight: 800 !important; }
                .card-hover-effect { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .card-hover-effect .card { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
                .arrow-icon { transition: transform 0.2s ease; }
                
                /* Clases para el color Indigo e Info que Bootstrap no siempre incluye por defecto en bg-subtle */
                .bg-indigo-subtle { background-color: #e0e7ff !important; }
                .bg-info-subtle { background-color: #e0f2fe !important; }
                
                .card-hover-effect:hover {
                    transform: translateY(-4px);
                }
                .card-hover-effect:hover .card {
                    border-color: #dee2e6 !important;
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06) !important;
                }
                .card-hover-effect:hover .arrow-icon {
                    transform: translateX(4px);
                }
                .card-hover-effect:active {
                    transform: translateY(-1px);
                }
                
                .tracking-wider { letter-spacing: 0.05em; }
                
                @keyframes pulse {
                    0% { transform: scale(0.9); opacity: 0.6; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.9); opacity: 0.6; }
                }
                .animate-pulse { animation: pulse 2s infinite ease-in-out; }
            `}</style>
        </div>
    );
};

export default Inicio;