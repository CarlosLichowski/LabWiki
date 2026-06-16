// src/Pages/Personal/Inicio/Inicio.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Microscope, FileText, ClipboardList, HardDrive, Contact, Calendar, ArrowRight } from 'lucide-react';

const Inicio: React.FC = () => {
    const modulos = [
        {
            title: 'Ateneos y Cursos',
            description: 'Sesiones clínicas y cursos técnicos de formación continuada.',
            path: '/ateneos',
            icon: <Users size={24} className="text-indigo-saas" />,
            bgIcon: 'bg-indigo-subtle',
            textColor: 'text-indigo-saas',
            actionText: 'Acceder'
        },
        {
            title: 'Determinaciones',
            description: 'Biblioteca centralizada de metodologías y documentación técnica.',
            path: '/insertos',
            icon: <FileText size={24} className="text-emerald-saas" />,
            bgIcon: 'bg-emerald-subtle',
            textColor: 'text-emerald-saas',
            actionText: 'Consultar'
        },
        {
            title: 'Derivaciones',
            description: 'Seguimiento, logística y control de muestras externas.',
            path: '/derivaciones',
            icon: <Microscope size={24} className="text-sky-saas" />, 
            bgIcon: 'bg-sky-subtle',
            textColor: 'text-sky-saas',
            actionText: 'Acceder'
        },
        {
            title: 'Manual de Equipos',
            description: 'Documentación de plataformas analíticas y guías de mantenimiento.',
            path: '/equipos',
            icon: <HardDrive size={24} className="text-violet-saas" />, 
            bgIcon: 'bg-violet-subtle',
            textColor: 'text-violet-saas',
            actionText: 'Acceder'
        },
        {
            title: 'Contactos',
            description: 'Agenda centralizada de personal del hospital y entidades externas.',
            path: '/contactos',
            icon: <Contact size={24} className="text-rose-saas" />,
            bgIcon: 'bg-rose-subtle',
            textColor: 'text-rose-saas',
            actionText: 'Ver agenda'
        },
        {
            title: 'Inventario',
            description: 'Control de stock crítico, reactivos y suministros del laboratorio.',
            path: '/stock',
            icon: <ClipboardList size={24} className="text-amber-saas" />,
            bgIcon: 'bg-amber-subtle',
            textColor: 'text-amber-saas',
            actionText: 'Acceder'
        },
        {
            title: 'Calendarios',
            description: 'Organización integrada de guardias internas y licencias.',
            path: '/calendario-guardias',
            icon: <Calendar size={24} className="text-slate-saas" />,
            bgIcon: 'bg-slate-subtle',
            textColor: 'text-slate-saas',
            actionText: 'Ver turnos'
        },
    ];

    return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-75 py-4 px-2" style={{ backgroundColor: '#fafafa' }}>
            
            {/* TÍTULO MINIMALISTA */}
            <div className="text-center mb-5">
                <h2 className="fw-bold text-dark m-0 tracking-tight" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
                    Panel de Control
                </h2>
                <p className="text-muted small m-0 mt-1">Gestión interna integrada — Laboratorio Central</p>
            </div>

            {/* GRID DE MÓDULOS */}
            <div className="container" style={{ maxWidth: '1140px' }}>
                <div className="row g-3 justify-content-center">
                    {modulos.map((modulo, index) => (
                        <div key={index} className="col-12 col-md-6 col-lg-4">
                            <Link to={modulo.path} className="text-decoration-none text-dark card-hover-effect d-block h-100">
                                <div className="card h-100 border rounded-4 p-4 bg-white d-flex flex-column justify-content-between position-relative overflow-hidden transition-all">
                                    
                                    <div>
                                        {/* CONTENEDOR DEL ICONO (Soft UI Circle) */}
                                        <div className={`d-flex align-items-center justify-content-center rounded-3 mb-3.5 ${modulo.bgIcon}`} style={{ width: '48px', height: '48px' }}>
                                            {modulo.icon}
                                        </div>

                                        {/* TEXTOS */}
                                        <h5 className="fw-bold text-dark mb-1.5" style={{ letterSpacing: '-0.2px' }}>
                                            {modulo.title}
                                        </h5>
                                        <p className="text-muted mb-4 lh-sm" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            {modulo.description}
                                        </p>
                                    </div>

                                    {/* ACCIÓN CON COLOR SINCRONIZADO */}
                                    <div className={`d-flex align-items-center justify-content-end fw-bold extra-small text-uppercase tracking-wider mt-auto pt-2 ${modulo.textColor}`}>
                                        <span>{modulo.actionText}</span>
                                        <ArrowRight size={14} className="ms-1 transition-transform arrow-icon" />
                                    </div>

                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* FOOTER CORPORATIVO */}
            <div className="mt-5 d-flex align-items-center gap-2 text-muted fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <span className="d-inline-block bg-success rounded-circle animate-pulse" style={{ width: '6px', height: '6px' }}></span>
                <span className="text-uppercase text-secondary opacity-75">Hospital Ramos Mejía</span>
            </div>

            {/* PALETA DE COLORES SOFT UI PREMIUM */}
            <style>{`
                .extra-small { font-size: 0.72rem; }
                .tracking-tight { letter-spacing: -0.025em; }
                .card-hover-effect { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
                .card-hover-effect .card { border-color: #f1f5f9 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important; }
                .arrow-icon { transition: transform 0.2s ease; }
                
                /* Mapeo Cromático Soft UI (SaaS Clean) */
                .bg-indigo-subtle { background-color: #f5f3ff !important; }
                .text-indigo-saas { color: #6366f1 !important; }
                
                .bg-emerald-subtle { background-color: #ecfdf5 !important; }
                .text-emerald-saas { color: #10b981 !important; }
                
                .bg-sky-subtle { background-color: #f0f9ff !important; }
                .text-sky-saas { color: #0284c7 !important; }
                
                .bg-violet-subtle { background-color: #faf5ff !important; }
                .text-violet-saas { color: #8b5cf6 !important; }
                
                .bg-rose-subtle { background-color: #fff1f2 !important; }
                .text-rose-saas { color: #f43f5e !important; }
                
                .bg-amber-subtle { background-color: #fffbeb !important; }
                .text-amber-saas { color: #d97706 !important; }
                
                .bg-slate-subtle { background-color: #f8fafc !important; }
                .text-slate-saas { color: #475569 !important; }
                
                /* Animaciones de Interacción */
                .card-hover-effect:hover { transform: translateY(-3px); }
                .card-hover-effect:hover .card { border-color: #e2e8f0 !important; box-shadow: 0 10px 20px rgba(0,0,0,0.04) !important; }
                .card-hover-effect:hover .arrow-icon { transform: translateX(3px); }
                .card-hover-effect:active { transform: translateY(-1px); }
                
                @keyframes pulse {
                    0% { transform: scale(0.9); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.9); opacity: 0.5; }
                }
                .animate-pulse { animation: pulse 2.s infinite ease-in-out; }
                .mb-3.5 { margin-bottom: 0.85rem !important; }
            `}</style>
        </div>
    );
};

export default Inicio;  