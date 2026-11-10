// src/Pages/Personal/Inicio/Inicio.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Microscope, FileText,  HardDrive, Contact, Calendar, ArrowRight } from 'lucide-react';
import '../css/Inicio.css'; // Importación de los estilos externos

const Inicio: React.FC = () => {
    const modulos = [
        {
            title: 'Ateneos y Cursos',
            description: 'Sesiones clínicas y cursos técnicos.',
            path: '/ateneos',
            icon: <Users size={24} className="text-indigo-saas" />,
            bgIcon: 'bg-indigo-subtle',
            textColor: 'text-indigo-saas',
            actionText: 'Acceder'
        },
        {
            title: 'Determinaciones',
            description: 'Biblioteca de metodologías y documentación técnica.',
            path: '/insertos',
            icon: <FileText size={24} className="text-emerald-saas" />,
            bgIcon: 'bg-emerald-subtle',
            textColor: 'text-emerald-saas',
            actionText: 'Consultar'
        },
        {
            title: 'Derivaciones',
            description: 'Seguimiento de muestras externas.',
            path: '/derivaciones',
            icon: <Microscope size={24} className="text-sky-saas" />, 
            bgIcon: 'bg-sky-subtle',
            textColor: 'text-sky-saas',
            actionText: 'Acceder'
        },
        {
            title: 'Manual de Equipos',
            description: 'Manual de Equipo y guías de mantenimiento.',
            path: '/equipos',
            icon: <HardDrive size={24} className="text-violet-saas" />, 
            bgIcon: 'bg-violet-subtle',
            textColor: 'text-violet-saas',
            actionText: 'Acceder'
        },

                {
            title: 'Estadisticas',
            description: 'Registro de incidentes y consumo de reactivos',
            path: '/Estadisticas',
            icon: <Calendar size={24} className="text-slate-saas" />,
            bgIcon: 'ClipboardList',
            textColor: 'text-slate-saas',
            actionText: 'Ver Estadisticas'
        },


        
        {
            title: 'Innovaciones',
            description: 'Nuevas Tecnologias que hay en el mercado',
            path: '/innovacion',
            icon: <Calendar size={24} className="text-slate-saas" />,
            bgIcon: 'ClipboardList',
            textColor: 'text-slate-saas',
            actionText: 'Ver Innovaciones'
        },


        {
            title: 'Pase de Turno',
            description: 'Organizacion Entre Turno Mañana y Turno Tarde',
            path: '/pase',
            icon: <Calendar size={24} className="text-slate-saas" />,
            bgIcon: 'bg-slate-subtle',
            textColor: 'text-slate-saas',
            actionText: 'Ir A Pase De Turno'
        },

            {
            title: 'Calendarios',
            description: 'Organización de guardias y licencias.',
            path: '/calendario-guardias',
            icon: <Calendar size={24} className="text-slate-saas" />,
            bgIcon: 'bg-slate-subtle',
            textColor: 'text-slate-saas',
            actionText: 'Ver Calendario'
        },

            {
            title: 'Contactos',
            description: 'Agenda de personal del Hospital.',
            path: '/contactos',
            icon: <Contact size={24} className="text-rose-saas" />,
            bgIcon: 'bg-rose-subtle',
            textColor: 'text-rose-saas',
            actionText: 'Ver agenda'
        },
    ];

    return (
        <div className="d-flex flex-column align-items-center justify-content-center pt-5 pt-lg-3 pb-4 px-2 inicio-wrapper">
            
            <div className="text-center mb-5 mt-2">
                <h2 className="fw-bold text-dark m-0 tracking-tight inicio-title-container">
                    Panel de Control
                </h2>
            </div>

            {/* GRID DE MÓDULOS */}
            <div className="container inicio-container">
                <div className="row g-3 justify-content-center">
                    {modulos.map((modulo, index) => (
                        <div key={index} className="col-12 col-md-6 col-lg-4">
                            <Link to={modulo.path} className="text-decoration-none text-dark card-hover-effect d-block h-100">
                                <div className="card h-100 border rounded-4 p-4 bg-white d-flex flex-column justify-content-between position-relative overflow-hidden transition-all">
                                    
                                    <div>
                                        {/* CONTENEDOR DEL ICONO (Soft UI Circle) */}
                                        <div className={`d-flex align-items-center justify-content-center rounded-3 mb-3.5 icon-box ${modulo.bgIcon}`}>
                                            {modulo.icon}
                                        </div>

                                        {/* TEXTOS */}
                                        <h5 className="fw-bold text-dark mb-1.5 card-title">
                                            {modulo.title}
                                        </h5>
                                        <p className="text-muted mb-4 lh-sm card-description">
                                            {modulo.description}
                                        </p>
                                    </div>

                                    {/* ACCIÓN CON COLOR SINCRONIZADO */}
                                    <div className={`d-flex align-items-center justify-content-end fw-bold extra-small text-uppercase tracking-wider mt-auto pt-2 ${modulo.textColor}`}>
                                        <span>{modulo.actionText}</span>
                                        <ArrowRight size={14} className="ms-1 arrow-icon" />
                                    </div>

                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* FOOTER CORPORATIVO */}
            <div className="mt-5 d-flex align-items-center gap-2 text-muted fw-semibold inicio-footer">
                <span className="d-inline-block bg-success rounded-circle animate-pulse footer-status-dot"></span>
                <span className="text-uppercase text-secondary opacity-75">Hospital Ramos Mejía</span>
            </div>
        </div>
    );
};

export default Inicio;  