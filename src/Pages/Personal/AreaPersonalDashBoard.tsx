// src/components/AreaPersonalDashboard.tsx

import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Menu, Home, Folder, HardDrive, Microscope, Star, Clock, Settings, LogOut, ArrowLeft } from 'lucide-react'; // Usamos iconos para que se vea más profesional

const AreaPersonalDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center vh-100">Cargando...</div>;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const displayName = user.displayName || user.email?.split('@')[0] || "Usuario";

    const handleLogout = async () => {
        try { await logout(); } catch (error) { console.error(error); }
    };

    const getLinkClass = (path: string) =>
        `nav-link py-2 px-3 rounded-2 mb-1 d-flex align-items-center ${location.pathname.startsWith(path)
            ? 'active bg-success-subtle text-success fw-bold'
            : 'text-secondary hover-bg-light'}`;

    // COMPONENTE DE ENLACES (Para reutilizar en Sidebar y Menú Móvil)
    const NavigationLinks = () => (
        <div className="nav flex-column p-2">
            <div className="fw-bold text-uppercase text-muted px-3 mt-2 mb-1 small" style={{ fontSize: '0.7rem' }}>General</div>
            <Link to="/personal" className={getLinkClass('/personal')}><Home size={18} className="me-2"/> Inicio</Link>
            <Link to="/personal/ateneos" className={getLinkClass('/personal/ateneos')}><Folder size={18} className="me-2"/> Ateneos</Link>
            <Link to="/personal/equipos" className={getLinkClass('/personal/equipos')}><HardDrive size={18} className="me-2"/> Manual de Equipos</Link>
            <Link to="/personal/analisis" className={getLinkClass('/personal/analisis')}><Microscope size={18} className="me-2"/> Análisis</Link>

            <div className="fw-bold text-uppercase text-muted px-3 mt-3 mb-1 small" style={{ fontSize: '0.7rem' }}>Mi Actividad</div>
            <Link to="/personal/favoritos" className={getLinkClass('/personal/favoritos')}><Star size={18} className="me-2"/> Favoritos</Link>
            <Link to="/personal/historial" className={getLinkClass('/personal/historial')}><Clock size={18} className="me-2"/> Actividad</Link>
            <Link to="/personal/configuracion" className={getLinkClass('/personal/configuracion')}><Settings size={18} className="me-2"/> Configuración</Link>
        </div>
    );

    return (
        <div className="d-flex flex-column bg-light" style={{ minHeight: '100vh' }}>
            
            {/* 1. NAVBAR MÓVIL (Solo visible en < lg) */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom d-lg-none sticky-top shadow-sm">
                <div className="container-fluid">
                    <button 
                        className="navbar-toggler border-0" 
                        type="button" 
                        data-bs-toggle="offcanvas" 
                        data-bs-target="#sidebarMobile"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="navbar-brand fw-bold text-success ms-2">LabWiki</span>
                    <div className="ms-auto text-muted small fw-bold">{displayName}</div>
                </div>
            </nav>

            <div className="d-flex flex-grow-1 flex-row align-items-start">
                
                {/* 2. SIDEBAR ESCRITORIO (Solo visible en >= lg) */}
                <nav className="d-none d-lg-flex flex-column p-0 bg-white shadow-sm border-end sticky-top" 
                     style={{ width: '260px', height: '100vh' }}> 
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
                            Cerrar Sesión <LogOut size={14}/>
                        </button>
                    </div>
                </nav>

                {/* 3. OFFCANVAS MÓVIL (El "Burger Menu" que se desliza) */}
                <div className="offcanvas offcanvas-start d-lg-none" tabIndex={-1} id="sidebarMobile" style={{ width: '280px' }}>
                    <div className="offcanvas-header border-bottom">
                        <h5 className="offcanvas-title fw-bold text-success" id="offcanvasExampleLabel">{displayName}</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
                    </div>
                    <div className="offcanvas-body p-0">
                        <NavigationLinks />
                        <div className="p-3 mt-auto border-top">
                            <Link to="/" className="btn btn-outline-secondary w-100 mb-2">Inicio Público</Link>
                            <button onClick={handleLogout} className="btn btn-danger w-100">Cerrar Sesión</button>
                        </div>
                    </div>
                </div>

                {/* 4. CONTENIDO CENTRAL */}
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
                .nav-link { transition: all 0.2s; }
                @media (max-width: 991px) {
                    main { padding-top: 1rem !important; }
                }
            `}</style>
        </div>
    );
};

export default AreaPersonalDashboard;