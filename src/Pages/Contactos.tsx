// src/Pages/Personal/Contactos/Contactos.tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, setDoc, deleteField } from 'firebase/firestore';
import { db, auth } from '../Credenciales'; 
import { Search, Plus, Trash2, X, Star, Phone, User, Home, Bed, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Contacto {
    id: string;
    area: string;
    nombre: string;
    interno: string;
    tipo: 'sala' | 'medico' | 'cama';
}

const Contactos: React.FC = () => {
    const [contactos, setContactos] = useState<Contacto[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [misFavoritos, setMisFavoritos] = useState<Record<string, any>>({});
    const [nuevo, setNuevo] = useState({ area: '', nombre: '', interno: '', tipo: 'sala' });
    const [loading, setLoading] = useState(false);
    
    const currentUser = auth.currentUser;

    useEffect(() => {
        const q = query(collection(db, 'contactos_internos'), orderBy('area', 'asc'));
        const unsubContactos = onSnapshot(q, (snapshot) => {
            setContactos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contacto)));
        });

        let unsubFavs = () => {};
        if (currentUser) {
            unsubFavs = onSnapshot(doc(db, 'usuarios', currentUser.uid), (docSnap) => {
                if (docSnap.exists()) {
                    setMisFavoritos(docSnap.data().favorites_contactos || {});
                }
            });
        }
        return () => { unsubContactos(); unsubFavs(); };
    }, [currentUser]);

    const toggleFavorito = async (contactoId: string) => {
        if (!currentUser) return;
        const userRef = doc(db, 'usuarios', currentUser.uid);
        const esFavorito = !!misFavoritos[contactoId];
        try {
            await setDoc(userRef, {
                favorites_contactos: { [contactoId]: esFavorito ? deleteField() : true }
            }, { merge: true });
        } catch (err) { console.error("Error favoritos:", err); }
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevo.area.trim() || !nuevo.nombre.trim() || !nuevo.interno.trim()) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'contactos_internos'), {
                area: nuevo.area.trim(),
                nombre: nuevo.nombre.trim(),
                interno: nuevo.interno.trim(),
                tipo: nuevo.tipo,
                createdAt: serverTimestamp()
            });
            setNuevo({ area: '', nombre: '', interno: '', tipo: 'sala' });
            setMostrarForm(false);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    const handleBorrar = async (id: string) => {
        if (window.confirm("¿Desea remover permanentemente este interno de la guía pública?")) {
            try {
                await deleteDoc(doc(db, 'contactos_internos', id));
            } catch (err) { console.error(err); }
        }
    };

    const filtrados = contactos.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.area.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.interno.includes(busqueda)
    );

    const listaFavoritos = filtrados.filter(c => !!misFavoritos[c.id]);

    return (
        <div className="container-fluid py-4 bg-light min-vh-100 px-3">
            
            {/* CABECERA MINIMALISTA */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 border-bottom pb-3">
                <div>
                    <h4 className="fw-bold mb-1 text-dark tracking-tight" style={{ letterSpacing: '-0.025em' }}>
                        Guía Telefónica Interna
                    </h4>
                    <p className="text-muted small mb-0">Directorio centralizado de internos y líneas de comunicación directa del servicio.</p>
                </div>

                <div className="d-flex gap-2 align-items-center w-100 w-md-auto">
                    <div className="position-relative flex-grow-1 flex-md-grow-0" style={{ minWidth: '240px' }}>
                        <Search className="position-absolute start-0 top-50 translate-middle-y ms-2.5 text-muted opacity-50" size={16} />
                        <input 
                            className="form-control bg-white border border-light-subtle ps-5 rounded-3 py-2 text-dark small shadow-none"
                            placeholder="Buscar sector, médico o interno..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setMostrarForm(!mostrarForm)}
                        className={`btn btn-sm d-flex align-items-center gap-1.5 fw-semibold px-3 py-2 rounded-3 ${mostrarForm ? 'btn-light border' : 'btn-dark border-0'}`}
                    >
                        {mostrarForm ? <X size={15}/> : <Plus size={15}/>}
                        <span>{mostrarForm ? 'Cancelar' : 'Nuevo Interno'}</span>
                    </button>
                </div>
            </div>

            {/* FORMULARIO */}
            {mostrarForm && (
                <div className="card border-0 shadow-sm p-4 rounded-4 mb-4 bg-white animate__animated animate__fadeInDown">
                    <span className="small fw-bold text-muted text-uppercase tracking-wider mb-3 d-block" style={{ fontSize: '0.65rem' }}>Registrar Nueva Línea Externa / Interna</span>
                    <form onSubmit={handleGuardar} className="row g-2">
                        <div className="col-md-3">
                            <label className="form-label extra-small fw-semibold text-secondary mb-1">Área / Sector Técnico</label>
                            <input placeholder="Ej: Guardia Core" className="form-control bg-light border-0 py-2 rounded-3 text-dark shadow-none small" value={nuevo.area} onChange={e => setNuevo({...nuevo, area: e.target.value})} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label extra-small fw-semibold text-secondary mb-1">Referencia de Ubicación</label>
                            <input placeholder="Ej: Mesada de Urgencias" className="form-control bg-light border-0 py-2 rounded-3 text-dark shadow-none small" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label extra-small fw-semibold text-secondary mb-1">Número de Interno</label>
                            <input placeholder="Ej: 4210" className="form-control bg-light border-0 py-2 rounded-3 font-monospace fw-bold text-dark shadow-none small" value={nuevo.interno} onChange={e => setNuevo({...nuevo, interno: e.target.value})} required />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label extra-small fw-semibold text-secondary mb-1">Categoría Operativa</label>
                            <select className="form-select bg-light border-0 py-2 rounded-3 text-dark shadow-none small fw-medium" value={nuevo.tipo} onChange={e => setNuevo({...nuevo, tipo: e.target.value as any})}>
                                <option value="sala">📞 Sala / Laboratorio</option>
                                <option value="medico">👨‍⚕️ Personal Médico</option>
                                <option value="cama">🛌 Pabellón / Camas</option>
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button type="submit" disabled={loading} className="btn btn-dark border-0 w-100 py-2 rounded-3 fw-semibold small shadow-none">
                                {loading ? 'Procesando...' : 'Confirmar Línea'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}
            <div className="mt-2">
                {/* INTERNOS FRECUENTES */}
                {listaFavoritos.length > 0 && !busqueda && (
                    <div className="mb-4">
                        <span className="small fw-bold text-muted text-uppercase tracking-wider mb-3 d-flex align-items-center gap-1.5" style={{ fontSize: '0.65rem', color: '#b45309' }}>
                            <Star size={12} fill="#f59e0b" className="text-warning" /> Marcados como Frecuentes
                        </span>
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
                            {listaFavoritos.map(c => (
                                <div className="col" key={c.id}>
                                    <ContactCard contacto={c} esFav={true} onToggleFav={toggleFavorito} onBorrar={handleBorrar} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DIRECTORIO COMPLETO */}
                <span className="small fw-bold text-muted text-uppercase tracking-wider mb-3 d-block" style={{ fontSize: '0.65rem' }}>Directorio Telefónico General</span>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
                    {filtrados.length > 0 ? (
                        filtrados.map(c => (
                            <div className="col" key={c.id}>
                                <ContactCard contacto={c} esFav={!!misFavoritos[c.id]} onToggleFav={toggleFavorito} onBorrar={handleBorrar} />
                            </div>
                        ))
                    ) : (
                        <div className="col-12 w-100 text-center py-5 bg-white rounded-4 border border-2 border-dashed">
                            <p className="text-muted small mb-0">No se encontraron líneas asociadas al parámetro de búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTÓN REGRESAR */}
            <div className="d-flex justify-content-center mt-5">
                <Link to="/" className="btn btn-link text-decoration-none text-muted d-inline-flex align-items-center gap-2 small border-0 fw-medium">
                    <ArrowLeft size={14} /> <span>Volver al Panel Central</span>
                </Link>
            </div>

            <style>{`
                .extra-small { font-size: 0.65rem; }
                .ms-2.5 { margin-left: 0.7rem !important; }
                .tracking-tight { letter-spacing: -0.025em; }
                .font-monospace { font-family: 'JetBrains Mono', monospace !important; letter-spacing: -0.5px; }
            `}</style>
        </div>
    );
};

const ContactCard = ({ contacto, esFav, onToggleFav, onBorrar }: any) => {
    const getConfig = () => {
        switch(contacto.tipo) {
            case 'medico': return { icon: <User size={12}/>, color: '#0284c7', bg: '#f0f9ff' };
            case 'cama': return { icon: <Bed size={12}/>, color: '#10b981', bg: '#ecfdf5' };
            default: return { icon: <Home size={12}/>, color: '#6366f1', bg: '#f5f3ff' };
        }
    };

    const config = getConfig();

    return (
        <div className="card h-100 border-0 shadow-sm rounded-4 position-relative card-contact-ui overflow-hidden bg-white">
            <div className="card-body p-4 d-flex flex-column justify-content-between">
                
                <div className="d-flex justify-content-between align-items-start mb-2.5">
                    <span className="badge rounded-2 px-2.5 py-1.5 d-flex align-items-center gap-1.5 fw-bold text-uppercase" style={{ backgroundColor: config.bg, color: config.color, fontSize: '0.68rem' }}>
                        {config.icon} {contacto.area}
                    </span>
                    <button 
                        onClick={() => onToggleFav(contacto.id)} 
                        className={`btn btn-sm rounded-circle p-1.5 border-0 bg-transparent shadow-none transition-all ${esFav ? 'text-warning' : 'text-muted opacity-30 hover-opacity'}`}
                    >
                        <Star size={16} fill={esFav ? "#f59e0b" : "none"} />
                    </button>
                </div>

                <h6 className="fw-bold text-dark mb-4 text-truncate" style={{ fontSize: '0.92rem' }} title={contacto.nombre}>{contacto.nombre}</h6>

                <div className="d-flex align-items-center justify-content-between border-top pt-2.5 mt-auto">
                    <div>
                        <span className="d-block text-muted text-uppercase fw-bold opacity-60" style={{ fontSize: '8px', letterSpacing: '0.3px' }}>Interno Directo</span>
                        <div className="d-flex align-items-center gap-1 mt-0.5">
                            <Phone size={12} className="text-secondary opacity-50" />
                            <span className="h4 fw-bold font-monospace text-dark m-0" style={{ fontSize: '1.25rem' }}>{contacto.interno}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => onBorrar(contacto.id)} 
                        className="btn btn-link text-danger p-1.5 border-0 bg-transparent btn-delete-contact opacity-0 shadow-none"
                        title="Eliminar registro"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <style>{`
                .card-contact-ui { transition: transform 0.2s ease, box-shadow 0.2s ease; border: 1px solid #f1f5f9 !important; }
                .card-contact-ui:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15,23,42,0.03) !important; border-color: #e2e8f0 !important; }
                .card-contact-ui:hover .btn-delete-contact { opacity: 0.6 !important; }
                .card-contact-ui:hover .btn-delete-contact:hover { opacity: 1 !important; }
                .hover-opacity:hover { opacity: 0.8 !important; }
                .mb-2.5 { margin-bottom: 0.65rem !important; }
                .pt-2.5 { padding-top: 0.65rem !important; }
            `}</style>
        </div>
    );
};

export default Contactos;