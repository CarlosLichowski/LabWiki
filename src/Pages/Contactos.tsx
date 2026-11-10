// src/Pages/Personal/Contactos/Contactos.tsx

import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, serverTimestamp, setDoc, deleteField } from 'firebase/firestore';
import { db, auth } from '../Credenciales'; 
import { Search, Plus, Trash2, X, Star, Phone, User, Home, Bed, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../css/Contactos.css';

interface Contacto {
    id: string;
    area: string;
    nombre: string;
    interno: string;
    tipo: 'sala' | 'medico' | 'cama';
    userId?: string;
}

// 🔒 DATOS MOCK 100% FICTICIOS PARA MODO DEMO
const MOCK_CONTACTOS_DEMO: Contacto[] = [
    { id: 'demo-1', area: 'Laboratorio Central', nombre: 'Personal Guardias (Demo)', interno: '1001', tipo: 'sala' },
    { id: 'demo-2', area: 'Microbiología', nombre: 'Dra. María González (Demo)', interno: '1002', tipo: 'medico' },
    { id: 'demo-3', area: 'Salud Mental', nombre: 'Dr. Alejandro Pérez (Demo)', interno: '1003', tipo: 'medico' },
    { id: 'demo-4', area: 'Traumatología', nombre: 'Pabellón B - Camas (Demo)', interno: '1004', tipo: 'cama' },
    { id: 'demo-5', area: 'Hematología', nombre: 'Muestra e Insumos (Demo)', interno: '1005', tipo: 'sala' },
];

const Contactos: React.FC = () => {
    const [contactos, setContactos] = useState<Contacto[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    
    const [misFavoritos, setMisFavoritos] = useState<Record<string, any>>({});
    const [nuevo, setNuevo] = useState({ area: '', nombre: '', interno: '', tipo: 'sala' as 'sala' | 'medico' | 'cama' });
    const [loading, setLoading] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    
    const currentUser = auth.currentUser;

    // 🎯 Detección de Modo Demo / Visitante
    const isDemo = 
        !currentUser || 
        currentUser.isAnonymous || 
        currentUser.email === 'testuser@testuser.com' ||
        localStorage.getItem('isDemoMode') === 'true' ||
        localStorage.getItem('userRole') === 'demo' ||
        window.location.search.includes('demo=true');

    useEffect(() => {
        // 🔒 SI ES MODO DEMO: Cargar datos MOCK de prueba y habilitar bandera
        if (isDemo) {
            setPermissionDenied(true);
            setContactos(MOCK_CONTACTOS_DEMO);
            return;
        }

        // 🔓 SI ES USUARIO REAL: Conectar a Firestore
        const q = query(collection(db, 'contactos_internos'), orderBy('area', 'asc'));
        
        const unsubContactos = onSnapshot(
            q, 
            (snapshot) => {
                setPermissionDenied(false);
                setContactos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contacto)));
            },
            (error) => {
                // 🛑 Captura explícita del error permission-denied de Firebase
                if (error.code === 'permission-denied') {
                    console.warn("Firestore access restricted for demo user.");
                    setPermissionDenied(true);
                    setContactos(MOCK_CONTACTOS_DEMO);
                }
            }
        );

        let unsubFavs = () => {};
        if (currentUser) {
            unsubFavs = onSnapshot(
                doc(db, 'usuarios', currentUser.uid), 
                (docSnap) => {
                    if (docSnap.exists()) {
                        setMisFavoritos(docSnap.data().favorites_contactos || {});
                    }
                },
                (error) => {
                    if (error.code === 'permission-denied') {
                        setMisFavoritos({});
                    }
                }
            );
        }

        return () => { 
            unsubContactos(); 
            unsubFavs(); 
        };
    }, [currentUser, isDemo]);

    const toggleFavorito = async (contactoId: string) => {
        if (!currentUser || isDemo) return;
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
        if (isDemo) return;
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

    const handleBorrar = async (contacto: Contacto) => {
        if (isDemo) return;
        const mensaje = contacto.userId 
            ? `¿Desea remover el contacto de ${contacto.nombre}?`
            : "¿Desea remover permanentemente este interno de la guía pública?";

        if (window.confirm(mensaje)) {
            try {
                await deleteDoc(doc(db, 'contactos_internos', contacto.id));
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
        <div className="contactos-page-container">
            
            {/* CABECERA */}
            <header className="contactos-header">
                <div className="contactos-header-text">
                    <h4 className="contactos-header-title">
                        Guía Telefónica Interna
                    </h4>
                    <p className="contactos-header-subtitle">Líneas de comunicación</p>
                </div>

                <div className="contactos-header-actions">
                    <div className="contactos-search-wrapper">
                        <Search className="contactos-search-icon" size={16} />
                        <input 
                            className="contactos-search-input"
                            placeholder="Buscar sector, médico o interno..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                    
                    {!isDemo && (
                        <button 
                            onClick={() => setMostrarForm(!mostrarForm)}
                            className={`contactos-toggle-btn ${mostrarForm ? 'cancel-mode' : 'add-mode'}`}
                        >
                            {mostrarForm ? <X size={15}/> : <Plus size={15}/>}
                            <span>{mostrarForm ? 'Cancelar' : 'Nuevo Interno'}</span>
                        </button>
                    )}
                </div>
            </header>

            {/* 🛑 AVISO DE SEGURIDAD MODO DEMO */}
            {(isDemo || permissionDenied) && (
                <div style={{
                    padding: '1.25rem 1.5rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.75rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: '#991b1b',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                    <Lock size={28} style={{ flexShrink: 0, color: '#dc2626' }} />
                    <div>
                        <h2 style={{ 
                            margin: 0, 
                            fontSize: '1.1rem', 
                            fontWeight: 600, 
                            color: '#991b1b',
                            lineHeight: '1.4'
                        }}>
                            Por motivo de seguridad el usuario demo no puede ver los contactos
                        </h2>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                            Se muestran datos ficticios únicamente con fines de demostración de la interfaz.
                        </p>
                    </div>
                </div>
            )}

            {/* FORMULARIO */}
            {mostrarForm && !isDemo && (
                <div className="contactos-form-card">
                    <span className="contactos-form-title">
                        Registrar Nueva Línea Externa / Interna
                    </span>
                    <form onSubmit={handleGuardar} className="contactos-form-grid">
                        <div className="contactos-form-group">
                            <label className="contactos-label">Área / Sector Técnico</label>
                            <input 
                                placeholder="Ej: Guardia Core" 
                                className="contactos-input" 
                                value={nuevo.area} 
                                onChange={e => setNuevo({...nuevo, area: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="contactos-form-group">
                            <label className="contactos-label">Referencia de Ubicación</label>
                            <input 
                                placeholder="Ej: Mesada de Urgencias" 
                                className="contactos-input" 
                                value={nuevo.nombre} 
                                onChange={e => setNuevo({...nuevo, nombre: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="contactos-form-group">
                            <label className="contactos-label">Número de Interno</label>
                            <input 
                                placeholder="Ej: 4210" 
                                className="contactos-input font-monospace" 
                                value={nuevo.interno} 
                                onChange={e => setNuevo({...nuevo, interno: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="contactos-form-group">
                            <label className="contactos-label">Categoría Operativa</label>
                            <select 
                                className="contactos-select" 
                                value={nuevo.tipo} 
                                onChange={e => setNuevo({...nuevo, tipo: e.target.value as any})}
                            >
                                <option value="sala">📞 Sala / Laboratorio</option>
                                <option value="medico">👨‍⚕️ Personal Médico</option>
                                <option value="cama">🛌 Pabellón / Camas</option>
                            </select>
                        </div>
                        <div className="contactos-form-group contactos-form-submit">
                            <button type="submit" disabled={loading} className="contactos-submit-btn">
                                {loading ? 'Procesando...' : 'Confirmar Línea'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}
            <main className="contactos-content">
                {/* INTERNOS FRECUENTES */}
                {!isDemo && listaFavoritos.length > 0 && !busqueda && (
                    <section className="contactos-section">
                        <span className="contactos-section-title title-favorites">
                            <Star size={12} fill="#f59e0b" className="contactos-star-icon" /> Marcados como Frecuentes
                        </span>
                        <div className="contactos-grid">
                            {listaFavoritos.map(c => (
                                <div className="contactos-grid-item" key={c.id}>
                                    <ContactCard 
                                        contacto={c} 
                                        esFav={true} 
                                        onToggleFav={toggleFavorito} 
                                        onBorrar={handleBorrar} 
                                        isDemo={isDemo}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* DIRECTORIO COMPLETO */}
                <section className="contactos-section">
                    <span className="contactos-section-title">
                        {isDemo ? 'Directorio Telefónico (Vista Demo)' : 'Directorio Telefónico General'}
                    </span>
                    {filtrados.length > 0 ? (
                        <div className="contactos-grid">
                            {filtrados.map(c => (
                                <div className="contactos-grid-item" key={c.id}>
                                    <ContactCard 
                                        contacto={c} 
                                        esFav={!!misFavoritos[c.id]} 
                                        onToggleFav={toggleFavorito} 
                                        onBorrar={handleBorrar} 
                                        isDemo={isDemo}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="contactos-empty-state">
                            <p className="contactos-empty-text">No se encontraron líneas asociadas al parámetro de búsqueda.</p>
                        </div>
                    )}
                </section>
            </main>

            {/* BOTÓN REGRESAR */}
            <footer className="contactos-footer">
                <Link to="/" className="contactos-back-link">
                    <ArrowLeft size={14} /> <span>Volver al Panel Central</span>
                </Link>
            </footer>
        </div>
    );
};

interface ContactCardProps {
    contacto: Contacto;
    esFav: boolean;
    onToggleFav: (id: string) => void;
    onBorrar: (c: Contacto) => void;
    isDemo: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ contacto, esFav, onToggleFav, onBorrar, isDemo }) => {
    const getConfig = () => {
        switch(contacto.tipo) {
            case 'medico': 
                return { icon: <User size={12}/>, typeClass: 'badge-medico' };
            case 'cama': 
                return { icon: <Bed size={12}/>, typeClass: 'badge-cama' };
            case 'sala':
            default: 
                return { icon: <Home size={12}/>, typeClass: 'badge-sala' };
        }
    };

    const config = getConfig();

    return (
        <div className="contact-card">
            <div className="contact-card-body">
                
                <div className="contact-card-header">
                    <span className={`contact-card-badge ${config.typeClass}`}>
                        {config.icon} {contacto.area}
                    </span>
                    
                    {!isDemo && (
                        <button 
                            onClick={() => onToggleFav(contacto.id)} 
                            className={`contact-card-fav-btn ${esFav ? 'is-fav' : ''}`}
                            title={esFav ? "Quitar de favoritos" : "Marcar como favorito"}
                        >
                            <Star size={16} fill={esFav ? "#f59e0b" : "none"} />
                        </button>
                    )}
                </div>

                <h6 className="contact-card-name" title={contacto.nombre}>
                    {contacto.nombre}
                </h6>

                <div className="contact-card-footer">
                    <div className="contact-card-info">
                        <span className="contact-card-label">Interno Directo</span>
                        <div className="contact-card-phone-wrapper">
                            <Phone size={12} className="contact-card-phone-icon" />
                            <span className="contact-card-phone-number font-monospace">{contacto.interno}</span>
                        </div>
                    </div>
                    
                    {!isDemo && (
                        <button 
                            onClick={() => onBorrar(contacto)} 
                            className="contact-card-delete-btn"
                            title="Eliminar registro"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contactos;