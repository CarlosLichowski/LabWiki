// src/Pages/Personal/Inicio/Inicio.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'; 
import { Link } from 'react-router-dom';
import { 
    Folder, Contact, Clock, User, 
    Beaker, Microscope, Database, BarChart3 
} from 'lucide-react';

interface Actividad {
    id: string;
    tipo: 'ateneo' | 'contacto';
    titulo: string;
    subtitulo: string;
    fecha: Date;
}

const Inicio: React.FC = () => {
    const { user, db } = useAuth();
    const [actividad, setActividad] = useState<Actividad[]>([]);
    const [loading, setLoading] = useState(true);

    const displayName = user?.displayName || user?.email?.split('@')[0] || "Colega";

    // Configuración de los 6 botones (5 pedidos + Guía)
    const atajosRapidos = [
        { label: 'Ateneos', icon: <Folder size={24} />, path: '/personal/ateneos', color: 'text-primary', bg: 'bg-primary-subtle' },
        { label: 'Derivaciones', icon: <Beaker size={24} />, path: '/personal/derivaciones', color: 'text-warning', bg: 'bg-warning-subtle' },
        { label: 'Análisis', icon: <Microscope size={24} />, path: '/personal/analisis', color: 'text-danger', bg: 'bg-danger-subtle' },
        { label: 'Stock', icon: <Database size={24} />, path: '/personal/stock', color: 'text-info', bg: 'bg-info-subtle' },
        { label: 'Estadísticas', icon: <BarChart3 size={24} />, path: '/personal/estadisticas', color: 'text-success', bg: 'bg-success-subtle' },
        { label: 'Guía', icon: <Contact size={24} />, path: '/personal/contactos', color: 'text-secondary', bg: 'bg-light' },
    ];

    useEffect(() => {
        setLoading(true);
        const qAteneos = query(collection(db, 'ateneos_biblioteca'), orderBy('createdAt', 'desc'), limit(5));
        const qContactos = query(collection(db, 'contactos_internos'), orderBy('createdAt', 'desc'), limit(5));

        let ateneosData: Actividad[] = [];
        let contactosData: Actividad[] = [];

        const actualizarEstado = () => {
            const mezclados = [...ateneosData, ...contactosData]
                .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
                .slice(0, 8); // Aumentado a 8 para aprovechar el espacio
            setActividad(mezclados);
            setLoading(false);
        };

        const unsubAteneos = onSnapshot(qAteneos, (snap) => {
            ateneosData = snap.docs.map(doc => ({
                id: doc.id,
                tipo: 'ateneo',
                titulo: doc.data().titulo || 'Sin título',
                subtitulo: `Subido por ${doc.data().autor || 'Staff'}`,
                fecha: doc.data().createdAt?.toDate() || new Date()
            }));
            actualizarEstado();
        });

        const unsubContactos = onSnapshot(qContactos, (snap) => {
            contactosData = snap.docs.map(doc => ({
                id: doc.id,
                tipo: 'contacto',
                titulo: doc.data().nombre || 'Sin nombre',
                subtitulo: `Nuevo interno en ${doc.data().area || 'Servicio'}`,
                fecha: doc.data().createdAt?.toDate() || new Date()
            }));
            actualizarEstado();
        });

        return () => { unsubAteneos(); unsubContactos(); };
    }, [db]);

    return (
        <div className="animate__animated animate__fadeIn">
            {/* Header de Bienvenida */}
            <div className="mb-4 p-4 bg-white rounded-4 shadow-sm border-start border-4 border-success">
                <h3 className="fw-bold text-dark mb-1">¡Hola, {displayName}! 👋</h3>
                <p className="text-muted mb-0">Bienvenido al Panel Personal de LabWiki.</p>
            </div>

            {/* --- SECCIÓN DE ACCESOS DIRECTOS --- */}
            <div className="mb-5">
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                    <span className="bg-success rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{width: '24px', height: '24px'}}>
                        <div className="bg-white rounded-circle" style={{width: '8px', height: '8px'}}></div>
                    </span>
                    Accesos Directos
                </h5>
                <div className="row g-2 g-md-3">
                    {atajosRapidos.map((atajo, index) => (
                        <div key={index} className="col-4 col-md-2">
                            <Link to={atajo.path} className="text-decoration-none">
                                <div className={`card border-0 ${atajo.bg} h-100 shadow-sm rounded-4 transition-all hover-up p-2 p-md-3 text-center`}>
                                    <div className={`${atajo.color} mb-2`}>
                                        {atajo.icon}
                                    </div>
                                    <span className="fw-bold text-dark" style={{ fontSize: '0.75rem' }}>{atajo.label}</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className="row g-4">
                {/* LISTA DE ACTIVIDAD (Ocupando todo el ancho disponible) */}
                <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5 className="fw-bold m-0 d-flex align-items-center">
                            <Clock size={20} className="me-2 text-success"/> Lo último subido
                        </h5>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="list-group list-group-flush">
                            {loading ? (
                                <div className="p-5 text-center">
                                    <div className="spinner-border text-success spinner-border-sm me-2"></div> 
                                    Cargando novedades...
                                </div>
                            ) : actividad.length > 0 ? (
                                actividad.map((item) => (
                                    <div key={item.id} className="list-group-item list-group-item-action border-0 border-bottom p-3">
                                        <div className="d-flex align-items-center">
                                            <div className={`p-3 rounded-3 me-3 ${item.tipo === 'ateneo' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'}`}>
                                                {item.tipo === 'ateneo' ? <Folder size={20}/> : <User size={20}/>}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <h6 className="mb-0 fw-bold text-dark">{item.titulo}</h6>
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                        {item.fecha.toLocaleDateString()}
                                                    </small>
                                                </div>
                                                <p className="mb-0 text-muted small">{item.subtitulo}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-5 text-center text-muted">Aún no hay actividad registrada.</div>
                            )}
                        </div>
                        <div className="card-footer bg-white border-0 py-3 text-center">
                             <span className="text-muted small">Actualizado en tiempo real</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-up:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
                .list-group-item-action:hover {
                    background-color: #f8f9fa;
                }
            `}</style>
        </div>
    );
};

export default Inicio;