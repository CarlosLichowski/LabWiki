import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { 
    Menu, Home, Folder, HardDrive, LogOut, 
    Contact, Calendar, ChevronDown, Target, ShieldCheck, 
    Award, Beaker, BarChart3, Eye, Database, FileText 
} from 'lucide-react';

// --- 1. LINKS DE NAVEGACIÓN ---
const NavigationLinks: React.FC<{ 
    getLinkClass: (p: string) => string, 
    calendariosOpen: boolean, 
    setCalendariosOpen: (v: boolean) => void 
}> = ({ getLinkClass, calendariosOpen, setCalendariosOpen }) => (
    <div className="nav flex-column p-2">
        <div className="fw-bold text-uppercase text-muted px-3 mt-2 mb-1 small" style={{ fontSize: '0.7rem' }}>General</div>
        <Link to="/" className={getLinkClass('/')}>
            <Home size={18} className="me-2"/> Inicio
        </Link>
        
        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Inventario</div>
        <Link to="/stock" className={getLinkClass('/stock')}>
            <Database size={18} className="me-2 text-primary"/> Stock de Reactivos
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Ateneos</div>
        <Link to="/ateneos" className={getLinkClass('/ateneos')}>
            <Folder size={18} className="me-2"/> Ateneos y Cursos
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Laboratorio</div>
        <Link to="/derivaciones" className={getLinkClass('/derivaciones')}>
            <Beaker size={18} className="me-2"/> Derivaciones
        </Link>
        <Link to="/equipos" className={getLinkClass('/equipos')}>
            <HardDrive size={18} className="me-2"/> Manual de Equipos
        </Link>
        
        <Link to="/insertos" className={getLinkClass('/insertos')}>
            <FileText size={18} className="me-2"/>Determinaciones e Insertos 
        </Link>
        
        <Link to="/contactos" className={getLinkClass('/contactos')}>
            <Contact size={18} className="me-2"/> Contactos
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Calidad y Gestión</div>
        <Link to="/estadisticas" className={getLinkClass('/estadisticas')}>
            <BarChart3 size={18} className="me-2 text-success"/> Estadísticas
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Organización</div>
        <button 
            onClick={(e) => {
                e.preventDefault();
                setCalendariosOpen(!calendariosOpen);
            }}
            className="nav-link py-2 px-3 rounded-2 d-flex align-items-center w-100 border-0 bg-transparent text-secondary hover-bg-light"
        >
            <Calendar size={18} className="me-2"/> 
            <span>Calendarios</span>
            <ChevronDown size={14} className={`ms-auto transition-transform ${calendariosOpen ? 'rotate-180' : ''}`} />
        </button>
        {calendariosOpen && (
            <div className="ms-4 ps-2 border-start mt-1">
                <Link to="/calendario-guardias" className={getLinkClass('/calendario-guardias')}>
                    <small>• Guardias</small>
                </Link>
                <Link to="/calendario-vacaciones" className={getLinkClass('/calendario-vacaciones')}>
                    <small>• Vacaciones</small>
                </Link>
            </div>
        )}

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Planificación</div>
        <Link to="/proyectos" className={getLinkClass('/proyectos')}>
            <Target size={18} className="me-2 text-primary"/> Proyectos
        </Link>

        <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Normativas</div>
        <Link to="/bioseguridad" className={getLinkClass('/bioseguridad')}>
            <ShieldCheck size={18} className="me-2 text-success"/> Bioseguridad
        </Link>
        <Link to="/normas" className={getLinkClass('/normas')}>
            <Award size={18} className="me-2 text-warning"/> Normas ISO
        </Link>
    </div>
);

// --- 2. DASHBOARD PRINCIPAL ---
const AreaPersonalDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const [calendariosOpen, setCalendariosOpen] = useState(false);

    const isTestUser = user?.email === "testuser@testuser.com";

    // 🟢 SOLUCIÓN DEFINITIVA: Cierre seguro simulando la acción nativa del botón de cierre
    useEffect(() => {
        const offcanvasElement = document.getElementById('sidebarUnified');
        if (offcanvasElement && offcanvasElement.classList.contains('show')) {
            // Buscamos el botón "X" (close) dentro del offcanvas y simulamos su click nativo
            const closeBtn = offcanvasElement.querySelector('.btn-close') as HTMLButtonElement | null;
            if (closeBtn) {
                closeBtn.click();
            }
        }

        // Limpieza de respaldo ultra segura por si la velocidad de renderizado de React interrumpe a Bootstrap
        const cleanupBootstrap = () => {
            const backdrops = document.querySelectorAll('.offcanvas-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.body.removeAttribute('data-bs-overflow');
        };

        cleanupBootstrap();
    }, [location.pathname]);

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100">Cargando...</div>;
    if (!user) return <Navigate to="/login" replace />;

    const displayName = isTestUser ? "Visitante (Demo)" : (user.displayName || user.email?.split('@')[0] || "Usuario");

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return `nav-link py-2 px-3 rounded-2 mb-1 d-flex align-items-center transition-all ${isActive
            ? 'active bg-success-subtle text-success fw-bold shadow-sm'
            : 'text-secondary hover-bg-light'}`;
    };

    return (
        <div className="d-flex flex-column bg-light min-vh-100">
            {isTestUser && (
                <div className="bg-warning text-dark text-center py-1 fw-bold small shadow-sm border-bottom sticky-top" style={{ zIndex: 1060 }}>
                    <Eye size={14} className="me-2" /> MODO LECTURA. Edición deshabilitada.
                </div>
            )}

            {/* BARRA SUPERIOR FIJA GLOBAL */}
            <nav className="navbar navbar-expand navbar-light bg-white border-bottom sticky-top shadow-sm py-2">
                <div className="container-fluid">
                    <button 
                        className="btn btn-light border-0 me-2 d-flex align-items-center justify-content-center rounded-circle" 
                        type="button" 
                        data-bs-toggle="offcanvas" 
                        data-bs-target="#sidebarUnified"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <Menu size={22} />
                    </button>
                    
                    <Link to="/" className="navbar-brand fw-bold text-success m-0 ps-1 text-decoration-none" style={{ fontSize: '1.25rem' }}>
                        LabWiki
                    </Link>
                    
                    <div className="ms-auto d-flex align-items-center gap-3">
                        <div className="text-muted small fw-bold d-none d-sm-inline-block">{displayName}</div>
                        <button onClick={() => logout()} className="btn btn-sm btn-outline-danger px-3 rounded-pill border-0 fw-bold d-flex align-items-center gap-1">
                            <LogOut size={14} /> <span className="d-none d-md-inline">Salir</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="d-flex flex-grow-1 position-relative">
                {/* SIDEBAR UNIFICADO */}
                <div 
                    className="offcanvas offcanvas-start shadow" 
                    tabIndex={-1} 
                    id="sidebarUnified" 
                    style={{ width: '280px', borderRight: '1px solid #e3e8ed' }}
                >
                    <div className="offcanvas-header border-bottom bg-light py-3">
                        <div>
                            <h5 className="offcanvas-title fw-bold text-success mb-0">{displayName}</h5>
                            <small className="text-muted">Panel de Control Interno</small>
                        </div>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    
                    <div className="offcanvas-body p-0 d-flex flex-column justify-content-between bg-white">
                        <div className="flex-grow-1 overflow-y-auto pt-2">
                            <NavigationLinks 
                                getLinkClass={getLinkClass} 
                                calendariosOpen={calendariosOpen} 
                                setCalendariosOpen={setCalendariosOpen} 
                            />
                        </div>
                        
                        <div className="p-3 border-top bg-light text-center">
                            <span className="text-muted small fw-medium">Lab Ramos Mejía • 2026</span>
                        </div>
                    </div>
                </div>

                {/* ÁREA DE CONTENIDO CENTRAL */}
                <main className="flex-grow-1 p-0 w-100 overflow-x-hidden">
                    {children}
                </main>
            </div>

            <style>{`
                .hover-bg-light:hover { background-color: #f8f9fa; }
                .nav-link { transition: all 0.2s ease; cursor: pointer; text-decoration: none; }
                .transition-transform { transition: transform 0.3s ease; }
                .rotate-180 { transform: rotate(180deg); }
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