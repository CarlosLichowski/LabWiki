// Components/AreaPersonalDashboard/AreaPersonalDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import appFirebase from '../Credenciales';
import { 
    Menu, Home, Folder, HardDrive, LogOut, 
    Contact, Calendar, ChevronDown, Target, ShieldCheck, 
    Beaker, Eye, FileText, X, BarChart3, Activity
} from 'lucide-react';
import '../css/AreaPersonalDashboard.css';

const db = getFirestore(appFirebase);

// --- 1. LINKS DE NAVEGACIÓN ---
const NavigationLinks: React.FC<{ 
    getLinkClass: (p: string) => string, 
    calendariosOpen: boolean, 
    setCalendariosOpen: (v: boolean) => void 
}> = ({ getLinkClass, calendariosOpen, setCalendariosOpen }) => (
    <div className="dash-nav-list">
        <div className="dash-nav-section-title">General</div>
        <Link to="/" className={getLinkClass('/')}>
            <Home size={18} className="dash-nav-icon"/> Inicio
        </Link>

        <div className="dash-nav-section-title">Ateneos</div>
        <Link to="/ateneos" className={getLinkClass('/ateneos')}>
            <Folder size={18} className="dash-nav-icon"/> Ateneos y Cursos
        </Link>

        <div className="dash-nav-section-title">Laboratorio</div>
        <Link to="/derivaciones" className={getLinkClass('/derivaciones')}>
            <Beaker size={18} className="dash-nav-icon"/> Derivaciones
        </Link>
        <Link to="/equipos" className={getLinkClass('/equipos')}>
            <HardDrive size={18} className="dash-nav-icon"/> Manual de Equipos
        </Link>
        <Link to="/insertos" className={getLinkClass('/insertos')}>
            <FileText size={18} className="dash-nav-icon"/> Determinaciones e Insertos 
        </Link>
        <Link to="/contactos" className={getLinkClass('/contactos')}>
            <Contact size={18} className="dash-nav-icon"/> Contactos
        </Link>
        <Link to="/pase" className={getLinkClass('/pase')}>
            <Contact size={18} className="dash-nav-icon"/> Pase De Turno
        </Link>
        <Link to="/Innovacion" className={getLinkClass('/Innovacion')}>
            <Contact size={18} className="dash-nav-icon"/> Innovaciones y Nuevas Metodicas
        </Link>

        <div className="dash-nav-section-title">Organización</div>
        <button 
            onClick={(e) => {
                e.preventDefault();
                setCalendariosOpen(!calendariosOpen);
            }}
            className="dash-nav-dropdown-btn"
        >
            <Calendar size={18} className="dash-nav-icon"/> 
            <span>Calendarios</span>
            <ChevronDown size={14} className={`dash-arrow-icon ${calendariosOpen ? 'rotate-180' : ''}`} />
        </button>
        {calendariosOpen && (
            <div className="dash-nav-submenu">
                <Link to="/calendario-guardias" className={getLinkClass('/calendario-guardias')}>
                    <span className="dash-submenu-dot">•</span> Guardias
                </Link>
                <Link to="/calendario-vacaciones" className={getLinkClass('/calendario-vacaciones')}>
                    <span className="dash-submenu-dot">•</span> Vacaciones
                </Link>
            </div>
        )}

        <div className="dash-nav-section-title">Planificación</div>
        <Link to="/proyectos" className={getLinkClass('/proyectos')}>
            <Target size={18} className="dash-nav-icon icon-primary"/> Proyectos
        </Link>

        <div className="dash-nav-section-title">Normativas</div>
        <Link to="/bioseguridad" className={getLinkClass('/bioseguridad')}>
            <ShieldCheck size={18} className="dash-nav-icon icon-success"/> Bioseguridad
        </Link>

        <div className="dash-nav-section-title">Estadísticas & Auditoría</div>
        <Link to="/Estadisticas" className={getLinkClass('/Estadisticas')}>
            <BarChart3 size={18} className="dash-nav-icon icon-primary" /> Menú Estadísticas
        </Link>
        <Link to="/estadisticas/cobas" className={getLinkClass('/estadisticas/cobas')}>
            <Activity size={18} className="dash-nav-icon" style={{ color: '#2563eb' }} /> Control Roche Cobas
        </Link>
    </div>
);

// --- 2. DASHBOARD PRINCIPAL ---
const AreaPersonalDashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const [calendariosOpen, setCalendariosOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Estado para guardar el nombre real traído de Firestore
    const [nombreReal, setNombreReal] = useState<string>('');

    const isTestUser = user?.email === "testuser@testuser.com";

    // Traer el nombre real de Firestore si existe
    useEffect(() => {
        const obtenerNombreFirestore = async () => {
            if (user && !isTestUser) {
                try {
                    const docRef = doc(db, 'usuarios', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().nombre) {
                        setNombreReal(docSnap.data().nombre);
                    }
                } catch (error) {
                    console.error("Error obteniendo nombre de Firestore:", error);
                }
            }
        };
        obtenerNombreFirestore();
    }, [user, isTestUser]);

    // Se ejecuta al cambiar de ruta: cierra el sidebar automáticamente siempre
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    if (loading) return <div className="dash-loading-screen">Cargando...</div>;
    if (!user) return <Navigate to="/login" replace />;

    // Prioridad del nombre a mostrar: 1. Modo test, 2. Nombre de Firestore, 3. displayName de Auth, 4. Recorte de Email, 5. "Usuario"
    const displayName = isTestUser 
        ? "Visitante (Demo)" 
        : (nombreReal || user.displayName || user.email?.split('@')[0] || "Usuario");

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return `dash-nav-link ${isActive ? 'active' : ''}`;
    };

    return (
        <div className={`dash-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            {isTestUser && (
                <div className="dash-banner-demo">
                    <Eye size={14} /> MODO LECTURA. Edición deshabilitada.
                </div>
            )}

            {/* BARRA SUPERIOR (TOPBAR) */}
            <nav className="dash-topbar">
                <div className="dash-topbar-left">
                    <button 
                        className="dash-menu-toggle" 
                        type="button" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        aria-label="Alternar menú"
                    >
                        <Menu size={22} />
                    </button>
                    
                    <Link to="/" className="dash-brand">
                        LabRamos
                    </Link>
                </div>
                
                <div className="dash-topbar-right">
                    <span className="dash-user-name">{displayName}</span>
                    <button onClick={() => logout()} className="dash-logout-btn">
                        <LogOut size={14} /> <span>Salir</span>
                    </button>
                </div>
            </nav>

            {/* CUERPO PRINCIPAL DEL LAYOUT */}
            <div className="dash-layout-body">
                
                {/* BACKDROP / CORTINA OSCURA PARA CERRAR HACIENDO CLIC FUERA */}
                {isSidebarOpen && (
                    <div className="dash-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* BARRA LATERAL (SIDEBAR) */}
                <aside className={`dash-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="dash-sidebar-header">
                        <div className="dash-sidebar-profile">
                            <h5 className="dash-profile-title">{displayName}</h5>
                            <small className="dash-profile-subtitle">Panel de Control Interno</small>
                        </div>
                        <button type="button" className="dash-sidebar-close" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="dash-sidebar-body">
                        <NavigationLinks 
                            getLinkClass={getLinkClass} 
                            calendariosOpen={calendariosOpen} 
                            setCalendariosOpen={setCalendariosOpen} 
                        />
                    </div>
                    
                    <div className="dash-sidebar-footer">
                        <span>Lab Ramos Mejía • 2026</span>
                    </div>
                </aside>

                {/* ÁREA DE CONTENIDO DINÁMICO */}
                <main className="dash-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AreaPersonalDashboard;
