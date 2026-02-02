// src/components/AreaPersonalDashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { 
    Menu, Home, Folder, HardDrive, Microscope, LogOut, 
    ArrowLeft, Contact, Calendar, ChevronDown,
    Target, ShieldCheck, Award, Beaker // <-- Icono Beaker para Derivaciones
} from 'lucide-react';

const AreaPersonalDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const [calendariosOpen, setCalendariosOpen] = useState(false);

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Cargando...</div>;
    if (!user) return <Navigate to="/login" replace />;

    const displayName = user.displayName || user.email?.split('@')[0] || "Usuario";

    const handleLogout = async () => {
        try { await logout(); } catch (error) { console.error(error); }
    };

    const getLinkClass = (path: string) =>
        `nav-link py-2 px-3 rounded-2 mb-1 d-flex align-items-center transition-all ${location.pathname === path
            ? 'active bg-success-subtle text-success fw-bold'
            : 'text-secondary hover-bg-light'}`;

    const NavigationLinks = () => (
        <div className="nav flex-column p-2">
            {/* 1. SECCIÓN GENERAL */}
            <div className="fw-bold text-uppercase text-muted px-3 mt-2 mb-1 small" style={{ fontSize: '0.7rem' }}>General</div>
            
            <Link to="/personal" className={getLinkClass('/personal')}>
                <Home size={18} className="me-2"/> Inicio
            </Link>
            <Link to="/personal/derivaciones" className={getLinkClass('/personal/derivaciones')}>
                <Beaker size={18} className="me-2"/> Derivaciones
            </Link>
            <Link to="/personal/ateneos" className={getLinkClass('/personal/ateneos')}>
                <Folder size={18} className="me-2"/> Ateneos
            </Link>
            <Link to="/personal/equipos" className={getLinkClass('/personal/equipos')}>
                <HardDrive size={18} className="me-2"/> Manual de Equipos
            </Link>
            <Link to="/personal/analisis" className={getLinkClass('/personal/analisis')}>
                <Microscope size={18} className="me-2"/> Análisis
            </Link>
            <Link to="/personal/contactos" className={getLinkClass('/personal/contactos')}>
                <Contact size={18} className="me-2"/> Contactos
            </Link>

            {/* 2. SECCIÓN: PLANIFICACIÓN */}
            <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Planificación</div>
            
            <Link to="/personal/proyectos" className={getLinkClass('/personal/proyectos')}>
                <Target size={18} className="me-2 text-primary"/> Proyectos
            </Link>

            {/* 3. SECCIÓN: NORMATIVAS */}
            <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Normativas</div>
            
            <Link to="/personal/bioseguridad" className={getLinkClass('/personal/bioseguridad')}>
                <ShieldCheck size={18} className="me-2 text-success"/> Bioseguridad
            </Link>
            <Link to="/personal/normas" className={getLinkClass('/personal/normas')}>
                <Award size={18} className="me-2 text-warning"/> Normas ISO
            </Link>

            {/* 4. SECCIÓN: ORGANIZACIÓN */}
            <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Organización</div>
            <div className="mb-1">
                <button 
                    onClick={() => setCalendariosOpen(!calendariosOpen)}
                    className="nav-link py-2 px-3 rounded-2 d-flex align-items-center w-100 border-0 bg-transparent text-secondary hover-bg-light"
                >
                    <Calendar size={18} className="me-2"/> 
                    <span>Calendarios</span>
                    <ChevronDown size={14} className={`ms-auto transition-transform ${calendariosOpen ? 'rotate-180' : ''}`} />
                </button>
                {calendariosOpen && (
                    <div className="ms-4 ps-2 border-start mt-1">
                        <Link to="/personal/calendario-guardias" className={getLinkClass('/personal/calendario-guardias')}>
                            <small>• Guardias</small>
                        </Link>
                        <Link to="/personal/calendario-vacaciones" className={getLinkClass('/personal/calendario-vacaciones')}>
                            <small>• Vacaciones</small>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="d-flex flex-column bg-light" style={{ minHeight: '100vh' }}>
            {/* Navbar móvil */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom d-lg-none sticky-top shadow-sm">
                <div className="container-fluid">
                    <button className="navbar-toggler border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMobile">
                        <Menu size={24} />
                    </button>
                    <span className="navbar-brand fw-bold text-success ms-2">LabWiki</span>
                    <div className="ms-auto text-muted small fw-bold">{displayName}</div>
                </div>
            </nav>

            <div className="d-flex flex-grow-1 flex-row align-items-start">
                {/* Sidebar escritorio */}
                <nav className="d-none d-lg-flex flex-column p-0 bg-white shadow-sm border-end sticky-top" style={{ width: '260px', height: '100vh' }}> 
                    <div className="p-4 border-bottom">
                        <h5 className="fw-bold text-success mb-0">{displayName}</h5>
                        <small className="text-muted">Panel Personal</small>
                    </div>
                    <div className="flex-grow-1 overflow-y-auto">
                        <NavigationLinks />
                    </div>
                    <div className="p-3 border-top bg-light">
                        <Link to="/" className="btn btn-sm btn-outline-secondary w-100 mb-2 rounded-pill">
                            <ArrowLeft size={14}/> Inicio Público
                        </Link>
                        <button onClick={handleLogout} className="btn btn-sm btn-danger w-100 rounded-pill">
                            Cerrar Sesión <LogOut size={14} className="ms-1"/>
                        </button>
                    </div>
                </nav>

                {/* Offcanvas móvil */}
                <div className="offcanvas offcanvas-start d-lg-none" tabIndex={-1} id="sidebarMobile" style={{ width: '280px' }}>
                    <div className="offcanvas-header border-bottom">
                        <h5 className="offcanvas-title fw-bold text-success">{displayName}</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
                    </div>
                    <div className="offcanvas-body p-0 d-flex flex-column">
                        <div className="flex-grow-1">
                            <NavigationLinks />
                        </div>
                    </div>
                </div>

                <main className="flex-grow-1 p-3 p-lg-4 w-100">
                    <div className="container-fluid" style={{ maxWidth: '1000px' }}> 
                        <div className="card shadow-sm border-0 min-vh-75"> 
                            <div className="card-body p-3 p-lg-5"> 
                                {children} 
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <style>{`
                .hover-bg-light:hover { background-color: #f8f9fa; }
                .nav-link { transition: all 0.2s; cursor: pointer; text-decoration: none; }
                .transition-transform { transition: transform 0.3s ease; }
                .rotate-180 { transform: rotate(180deg); }
                .min-vh-75 { min-height: 75vh; }
            `}</style>
        </div>
    );
};

export default AreaPersonalDashboard;