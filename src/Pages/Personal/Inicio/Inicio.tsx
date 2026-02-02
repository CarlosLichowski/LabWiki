

// src/Pages/Personal/Inicio/Inicio.tsx
// src/Pages/Personal/Inicio/Inicio.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
// Importación corregida añadiendo onSnapshot
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'; 
import { Link } from 'react-router-dom';
import { Folder, Contact, Clock, ArrowRight, Calendar, User } from 'lucide-react';

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

    useEffect(() => {
        setLoading(true);

        // 1. Referencias de consulta
        const qAteneos = query(
            collection(db, 'ateneos_biblioteca'), 
            orderBy('createdAt', 'desc'), 
            limit(5)
        );

        const qContactos = query(
            collection(db, 'contactos_internos'), 
            orderBy('createdAt', 'desc'), 
            limit(5)
        );

        // Variables locales para almacenar los resultados de cada colección
        let ateneosData: Actividad[] = [];
        let contactosData: Actividad[] = [];

        // Función para mezclar, ordenar y actualizar el estado
        const actualizarEstado = () => {
            const mezclados = [...ateneosData, ...contactosData]
                .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
                .slice(0, 6);
            setActividad(mezclados);
            setLoading(false);
        };

        // Escuchar Ateneos
        const unsubAteneos = onSnapshot(qAteneos, (snap) => {
            ateneosData = snap.docs.map(doc => ({
                id: doc.id,
                tipo: 'ateneo',
                titulo: doc.data().titulo || 'Sin título',
                subtitulo: `Subido por ${doc.data().autor || 'Staff'}`,
                fecha: doc.data().createdAt?.toDate() || new Date()
            }));
            actualizarEstado();
        }, (error) => {
            console.error("Error en snapshot ateneos:", error);
            setLoading(false);
        });

        // Escuchar Contactos
        const unsubContactos = onSnapshot(qContactos, (snap) => {
            contactosData = snap.docs.map(doc => ({
                id: doc.id,
                tipo: 'contacto',
                titulo: doc.data().nombre || 'Sin nombre',
                subtitulo: `Nuevo interno en ${doc.data().area || 'Servicio'}`,
                fecha: doc.data().createdAt?.toDate() || new Date()
            }));
            actualizarEstado();
        }, (error) => {
            console.error("Error en snapshot contactos:", error);
            setLoading(false);
        });

        // Limpieza de suscripciones
        return () => {
            unsubAteneos();
            unsubContactos();
        };
    }, [db]);

    return (
        <div className="animate__animated animate__fadeIn">
            {/* Header de Bienvenida */}
            <div className="mb-4 p-4 bg-white rounded-3 shadow-sm border-start border-4 border-success">
                <h3 className="fw-bold text-dark mb-1">¡Hola, {displayName}! 👋</h3>
                <p className="text-muted mb-0">Bienvenido al Panel Personal de LabWiki.</p>
            </div>

            <div className="row g-4">
                {/* LISTA DE ACTIVIDAD */}
                <div className="col-lg-8">
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

                {/* ACCESOS RÁPIDOS */}
                <div className="col-lg-4">
                    <h5 className="fw-bold mb-3">Accesos Directos</h5>
                    <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
                        <Link to="/personal/ateneos" className="btn btn-light border-0 text-start py-3 px-3 rounded-3 mb-2 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <Folder className="text-primary me-3" size={20} />
                                <span className="fw-bold text-dark">Ateneos</span>
                            </div>
                            <ArrowRight size={16} className="text-muted" />
                        </Link>
                        <Link to="/personal/contactos" className="btn btn-light border-0 text-start py-3 px-3 rounded-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <Contact className="text-success me-3" size={20} />
                                <span className="fw-bold text-dark">Guía Interna</span>
                            </div>
                            <ArrowRight size={16} className="text-muted" />
                        </Link>
                    </div>

                    <div className="card bg-success text-white border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex align-items-center mb-3">
                            <Calendar size={24} className="me-2" />
                            <h6 className="m-0 fw-bold">Guardias</h6>
                        </div>
                        <p className="small opacity-75 mb-0">No olvides revisar el calendario de guardias mensual actualizado.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inicio;