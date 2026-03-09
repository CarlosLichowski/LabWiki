// src/components/AreaPersonalDashboard.tsx
// src/components/AreaPersonalDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { 
    Menu, Home, Folder, HardDrive, Microscope, LogOut, 
    ArrowLeft, Contact, Calendar, ChevronDown,
    Target, ShieldCheck, Award, Beaker, 
    BarChart3, Gamepad2, Eye, Database 
} from 'lucide-react';
import * as bootstrap from 'bootstrap';

// --- 1. COMPONENTE DE ACCESOS RÁPIDOS ACTUALIZADO (5 FIJOS) ---
const QuickAccessGrid = () => {
    const atajos = [
        { label: 'Ateneos', icon: <Folder size={22} />, path: '/personal/ateneos', color: 'text-info', bg: '#e0f7fa' },
        { label: 'Derivaciones', icon: <Beaker size={22} />, path: '/personal/derivaciones', color: 'text-warning', bg: '#fff8e1' },
        { label: 'Análisis', icon: <Microscope size={22} />, path: '/personal/analisis', color: 'text-danger', bg: '#fce8e6' },
        { label: 'Stock', icon: <Database size={22} />, path: '/personal/stock', color: 'text-primary', bg: '#e7f1ff' },
        { label: 'Estadísticas', icon: <BarChart3 size={22} />, path: '/personal/estadisticas', color: 'text-success', bg: '#e6f4ea' },
    ];

    return (
        <div className="d-lg-none mb-4 mt-2">
            <h6 className="fw-bold text-muted small text-uppercase mb-3 px-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                Accesos Directos
            </h6>
            <div className="row g-2 justify-content-center">
                {atajos.map((item, index) => (
                    <div key={index} className="col-4">
                        <Link to={item.path} className="text-decoration-none">
                            <div className="d-flex flex-column align-items-center p-3 rounded-4 shadow-sm border-0 transition-all active-scale h-100" 
                                 style={{ backgroundColor: item.bg }}>
                                <div className={`${item.color} mb-2`}>
                                    {item.icon}
                                </div>
                                <span className="text-dark fw-bold text-center" style={{ fontSize: '0.65rem' }}>{item.label}</span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 2. LINKS DE NAVEGACIÓN (Sidebar) ---
const NavigationLinks: React.FC<{ 
    getLinkClass: (p: string) => string, 
    calendariosOpen: boolean, 
    setCalendariosOpen: (v: boolean) => void 
}> = ({ getLinkClass, calendariosOpen, setCalendariosOpen }) => (
    <div className="nav flex-column p-2">
        <div className="fw-bold text-uppercase text-muted px-3 mt-2 mb-1 small" style={{ fontSize: '0.7rem' }}>General</div>
        <Link to="/personal" className={getLinkClass('/personal')}>
            <Home size={18} className="me-2"/> Inicio
        </Link>
        
        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Inventario</div>
        <Link to="/personal/stock" className={getLinkClass('/personal/stock')}>
            <Database size={18} className="me-2 text-primary"/> Stock de Reactivos
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Ateneos</div>
        <Link to="/personal/ateneos" className={getLinkClass('/personal/ateneos')}>
            <Folder size={18} className="me-2"/> Ateneos
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Laboratorio</div>
        <Link to="/personal/derivaciones" className={getLinkClass('/personal/derivaciones')}>
            <Beaker size={18} className="me-2"/> Derivaciones
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

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Calidad y Gestión</div>
        <Link to="/personal/estadisticas" className={getLinkClass('/personal/estadisticas')}>
            <BarChart3 size={18} className="me-2 text-success"/> Estadísticas
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Organización</div>
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

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Planificación</div>
        <Link to="/personal/proyectos" className={getLinkClass('/personal/proyectos')}>
            <Target size={18} className="me-2 text-primary"/> Proyectos
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Normativas</div>
        <Link to="/personal/bioseguridad" className={getLinkClass('/personal/bioseguridad')}>
            <ShieldCheck size={18} className="me-2 text-success"/> Bioseguridad
        </Link>
        <Link to="/personal/normas" className={getLinkClass('/personal/normas')}>
            <Award size={18} className="me-2 text-warning"/> Normas ISO
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Entretenimiento</div>
        <Link to="/personal/entretenimiento" className={getLinkClass('/personal/entretenimiento')}>
            <Gamepad2 size={18} className="me-2 text-primary"/> Quiz de Laboratorio
        </Link>
    </div>
);

// --- 3. DASHBOARD PRINCIPAL ---
const AreaPersonalDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const [calendariosOpen, setCalendariosOpen] = useState(false);

    const isTestUser = user?.email === "testuser@testuser.com";
    const isHomePage = location.pathname === "/personal";

    useEffect(() => {
        const offcanvasElement = document.getElementById('sidebarMobile');
        if (offcanvasElement) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (bsOffcanvas) bsOffcanvas.hide();
        }
    }, [location.pathname]);

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Cargando...</div>;
    if (!user) return <Navigate to="/login" replace />;

    const displayName = isTestUser ? "Visitante (Demo)" : (user.displayName || user.email?.split('@')[0] || "Usuario");

    const getLinkClass = (path: string) =>
        `nav-link py-2 px-3 rounded-2 mb-1 d-flex align-items-center transition-all ${location.pathname === path
            ? 'active bg-success-subtle text-success fw-bold shadow-sm'
            : 'text-secondary hover-bg-light'}`;

    return (
        <div className="d-flex flex-column bg-light min-vh-100">
            {isTestUser && (
                <div className="bg-warning text-dark text-center py-1 fw-bold small shadow-sm border-bottom sticky-top" style={{ zIndex: 1060 }}>
                    <Eye size={14} className="me-2" /> MODO LECTURA. Edición deshabilitada.
                </div>
            )}

            {/* Navbar Móvil */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom d-lg-none sticky-top shadow-sm">
                <div className="container-fluid">
                    <button className="navbar-toggler border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMobile">
                        <Menu size={24} />
                    </button>
                    <span className="navbar-brand fw-bold text-success ms-2">LabWiki</span>
                    <div className="ms-auto text-muted small fw-bold">{displayName}</div>
                </div>
            </nav>

            <div className="d-flex flex-grow-1">
                {/* Sidebar Desktop */}
                <nav className="d-none d-lg-flex flex-column bg-white shadow-sm border-end sticky-top" style={{ width: '260px', height: '100vh' }}> 
                    <div className="p-4 border-bottom bg-white">
                        <h5 className={`fw-bold mb-0 text-truncate ${isTestUser ? 'text-warning' : 'text-success'}`}>
                            {displayName}
                        </h5>
                        <small className="text-muted">Panel Personal Lab</small>
                    </div>
                    <div className="flex-grow-1 overflow-y-auto pt-2">
                        <NavigationLinks 
                            getLinkClass={getLinkClass} 
                            calendariosOpen={calendariosOpen} 
                            setCalendariosOpen={setCalendariosOpen} 
                        />
                    </div>
                    <div className="p-3 border-top bg-light">
                        <Link to="/" className="btn btn-sm btn-outline-secondary w-100 mb-2 rounded-pill shadow-sm">
                            <ArrowLeft size={14} className="me-1"/> Inicio Público
                        </Link>
                        <button onClick={() => logout()} className="btn btn-sm btn-danger w-100 rounded-pill shadow-sm">
                            Cerrar Sesión <LogOut size={14} className="ms-1"/>
                        </button>
                    </div>
                </nav>

                {/* Sidebar Móvil (Offcanvas) */}
                <div className="offcanvas offcanvas-start d-lg-none" tabIndex={-1} id="sidebarMobile" style={{ width: '280px' }}>
                    <div className="offcanvas-header border-bottom">
                        <h5 className="offcanvas-title fw-bold text-success">{displayName}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                    </div>
                    <div className="offcanvas-body p-0 d-flex flex-column">
                        <NavigationLinks 
                            getLinkClass={getLinkClass} 
                            calendariosOpen={calendariosOpen} 
                            setCalendariosOpen={setCalendariosOpen} 
                        />
                    </div>
                </div>

                {/* Área de Contenido Principal */}
                <main className="flex-grow-1 p-3 p-lg-4 w-100 overflow-x-hidden">
                    <div className="container-fluid" style={{ maxWidth: '1200px' }}> 
                        
                        {/* ATAJOS MÓVILES: Siempre Ateneos, Derivaciones, Pruebas, Stock y Estadísticas */}
                        {isHomePage && <QuickAccessGrid />}

                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden"> 
                            <div className="card-body p-3 p-lg-5 bg-white min-vh-75"> 
                                {children} 
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                .hover-bg-light:hover { background-color: #f8f9fa; }
                .nav-link { transition: all 0.2s ease; cursor: pointer; text-decoration: none; }
                .transition-transform { transition: transform 0.3s ease; }
                .rotate-180 { transform: rotate(180deg); }
                .min-vh-75 { min-height: 75vh; }
                .active { border-right: 4px solid #198754; }
                .active-scale:active { transform: scale(0.95); }
                .transition-all { transition: all 0.2s ease; }
                main { background-color: #f8f9fa; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AreaPersonalDashboard;