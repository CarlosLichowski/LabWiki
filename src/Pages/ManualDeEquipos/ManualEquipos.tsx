// src/pages/Personal/ManualDeEquipos/ManualEquipos.tsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, Cpu, HardDrive, ShieldAlert, Layers, HelpCircle, Activity, AlbumIcon } from 'lucide-react';
import '../../css/DetalleEquipo.css';

interface EquipoConfig {
    id: string;
    nombre: string;
    icono: React.ComponentType<{ size?: number; className?: string }>;
    descripcion: string;
}

const equiposDisponibles: EquipoConfig[] = [
    { id: 'cobas6000', nombre: 'Cobas 6000', icono: Cpu, descripcion: 'Plataforma integrada de química clínica e inmunodiagnóstico.' },
    { id: 'cobas411', nombre: 'Cobas e411', icono: Activity, descripcion: 'Analizador de inmunoensayos por electroquimioluminiscencia (ECL).' },
    { id: 'vidas', nombre: 'VIDAS 3', icono: Layers, descripcion: 'Sistema de inmunoensayo automatizado multiparamétrico.' },
    { id: 'lauraxl', nombre: 'LauraXl (Orina)', icono: HardDrive, descripcion: 'Analizador automatizado para la química y sedimento urinario.' },
    { id: 'proteinograma', nombre: 'Proteinogramas (SPEP)', icono: ShieldAlert, descripcion: 'Documentación y soporte para electroforesis de proteínas capilar.' },
    { id: 'StaCompactMax', nombre: 'StaCompactMax',  icono: AlbumIcon, descripcion: 'Autoanalizador de Coagulograma'}
];

const ManualEquipos: React.FC = () => {
    const location = useLocation();

    const getLinkClass = (path: string) => {
        const isActive = location.pathname.endsWith(path);
        return `nav-link d-flex align-items-center gap-2 px-3 py-2.5 rounded-3 transition-all small border-0 ${
            isActive 
            ? 'bg-white text-dark fw-bold shadow-sm border border-light' 
            : 'text-secondary bg-transparent hover-bg-light'
        }`;
    };

    const isIndex = location.pathname === '/equipos' || location.pathname === '/equipos/';

    return (
        <div className="container-fluid py-4 bg-light min-vh-100 animate__animated animate__fadeIn">
            
            {/* CABECERA DE LA SECCIÓN */}
            <div className="d-flex flex-column mb-4 border-bottom pb-3">
                <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <HardDrive className="text-secondary" size={24} /> Documentación Técnica & Manuales de Instrumentos
                </h4>
                <p className="text-muted small mb-0">
                     Guías de operación, solución de errores frecuentes y fichas de mantenimiento de equipos.
                </p>
            </div>

            {/* 🟢 A. MENÚ DE EQUIPOS SUPERIOR (CONDICIONAL) 🟢 */}
            {/* Solo se renderiza si ya hay un equipo seleccionado para evitar la duplicación visual */}
            {!isIndex && (
                <div className="bg-secondary-subtle p-1.5 rounded-4 mb-4 d-inline-block w-100 border border-light shadow-sm animate__animated animate__fadeInDown animate__faster">
                    <ul className="nav nav-pills d-flex flex-wrap gap-1 border-0">
                        {equiposDisponibles.map((equipo) => {
                            const IconoComponente = equipo.icono;
                            return (
                                <li className="nav-item flex-grow-1 flex-md-grow-0" key={equipo.id}>
                                    <Link 
                                        to={`/equipos/${equipo.id}`} 
                                        className={getLinkClass(equipo.id)}
                                    >
                                        <IconoComponente size={16} className="opacity-75 text-primary" />
                                        <span>{equipo.nombre}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* 🟢 B. ÁREA DE CONTENIDO DINÁMICO 🟢 */}
            <div className="p-1">
                {isIndex ? (
                    <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 text-center">
                        <div className="d-inline-flex p-3 bg-light rounded-circle text-primary mx-auto mb-3 border">
                            <HelpCircle size={32} />
                        </div>
                        <h5 className="fw-bold text-dark mb-2">Bienvenido a la Central de Equipos</h5>
                        <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: '500px' }}>
                            Por favor, seleccioná un instrumento a continuación para acceder a sus manuales de usuario, procesos de calibración y flujos de trabajo específicos.
                        </p>
                        
                        {/* Selector rápido por Tarjetas (Dashboard Principal) */}
                        <div className="row g-3 justify-content-center text-start mt-2">
                            {equiposDisponibles.map((equipo) => {
                                const CardIcon = equipo.icono;
                                return (
                                    <div className="col-md-6 col-lg-4" key={`dash-${equipo.id}`}>
                                        <Link 
                                            to={`/equipos/${equipo.id}`}
                                            className="card h-100 border rounded-3 p-3 text-decoration-none bg-light hover-card transition-all d-flex flex-row align-items-start gap-3"
                                        >
                                            <div className="p-2 bg-white rounded-2 border text-primary mt-1 shadow-sm">
                                                <CardIcon size={18} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-1 small">{equipo.nombre}</h6>
                                                <p className="text-muted extra-small mb-0 lh-sm">{equipo.descripcion}</p>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <Outlet />
                    </div>
                )}
            </div>

            {/* BOTÓN INFERIOR DE RETORNO */}
            <div className="d-flex justify-content-center mt-5">
                <Link 
                    to="/" 
                    className="btn bg-white hover-bg-light text-secondary border d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 small fw-semibold shadow-sm transition-all text-decoration-none"
                >
                    <ArrowLeft size={14} /> 
                    <span>Volver al Panel de Inicio</span>
                </Link>
            </div>
            
        </div>
    );
};

export default ManualEquipos;