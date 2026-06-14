// src/Pages/Personal/Insertos/Insertos.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../Credenciales';
import { 
    collection, 
    onSnapshot, 
    query, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    orderBy 
} from 'firebase/firestore';
import { Search, Plus, FileText, Edit3, Trash2, Beaker, TestTube, Info, Tag, ArrowLeft, X, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Inserto {
    id?: string;
    nombre: string;
    codigo: string;
    descripcionCorta: string;
    metodologia: string;
    requerimientos: string; // Tipo de muestra / Ayuno
    enlaceDocumento: string; // URL Oficial del inserto
    area: string;
}

const Insertos: React.FC = () => {
    const [insertosList, setInsertosList] = useState<Inserto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('Todos');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // 🟢 CONTROL DE EXPANSIÓN: Almacena el ID de la tarjeta que se muestra centrada en pantalla completa
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

    const initialFormState: Inserto = {
        nombre: '', codigo: '', descripcionCorta: '', metodologia: '',
        requerimientos: '', enlaceDocumento: '', area: 'Química'
    };

    const [formData, setFormData] = useState<Inserto>(initialFormState);

    useEffect(() => {
        const q = query(collection(db, 'procedimientos'), orderBy('nombre', 'asc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Inserto));
            setInsertosList(docs);
        });
        return () => unsub();
    }, []);

    const areas = ['Química', 'Hematología', 'Inmunología', 'Microbiología', 'Orinas', 'Citología'];

    const filteredInsertos = useMemo(() => {
        return insertosList.filter(a => {
            const matchArea = selectedArea === 'Todos' || a.area === selectedArea;
            const s = searchTerm.toLowerCase().trim();
            return matchArea && (
                a.nombre.toLowerCase().includes(s) || 
                a.codigo.toLowerCase().includes(s) ||
                a.metodologia.toLowerCase().includes(s)
            );
        });
    }, [searchTerm, selectedArea, insertosList]);

    const toggleExpand = (id: string) => {
        setExpandedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadingToast = toast.loading('Procesando registro...');
        try {
            editingId 
                ? await updateDoc(doc(db, 'procedimientos', editingId), { ...formData })
                : await addDoc(collection(db, 'procedimientos'), formData);
            toast.success(editingId ? "Inserto actualizado" : "Inserto agregado", { id: loadingToast });
            handleCloseModal();
        } catch (error) { 
            toast.error("Error al guardar en la base de datos", { id: loadingToast }); 
        }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (window.confirm(`¿Estás seguro de eliminar el inserto de "${nombre}"?`)) {
            try {
                await deleteDoc(doc(db, 'procedimientos', id));
                toast.success("Eliminado correctamente");
            } catch (error) {
                toast.error("Error al eliminar");
            }
        }
    };

    const handleEdit = (item: Inserto) => {
        setFormData(item);
        setEditingId(item.id || null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const getAreaColor = (area: string) => {
        const colors: { [key: string]: string } = {
            'Química': '#3b82f6',
            'Hematología': '#ef4444',
            'Inmunología': '#8b5cf6',
            'Microbiología': '#10b981',
            'Orinas': '#f59e0b',
            'Citología': '#ec4899'
        };
        return colors[area] || '#64748b';
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            
            {/* CABECERA MINIMALISTA */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2" style={{ letterSpacing: '-0.02em' }}>
                        <Beaker className="text-primary" size={26} /> Biblioteca de Insertos
                    </h3>
                    <p className="text-muted small mb-0">Consultas rápidas de metodologías, muestras y links oficiales.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary rounded-3 px-4 py-2 shadow-sm fw-medium btn-sm d-flex align-items-center gap-2 border-0">
                    <Plus size={18} /> Nueva Prueba
                </button>
            </div>

            {/* BUSCADOR & FILTROS (SAAS STYLE) */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-body p-3">
                    <div className="row g-2">
                        <div className="col-md-8">
                            <div className="input-group bg-light border border-0 rounded-3 overflow-hidden align-items-center px-2">
                                <span className="text-muted opacity-60 px-2"><Search size={18}/></span>
                                <input type="text" className="form-control bg-light border-0 shadow-none py-2 text-dark" placeholder="Buscar por nombre, siglas o metodología..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ fontSize: '0.9rem' }} />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select className="form-select bg-light border-0 rounded-3 shadow-none py-2 text-secondary fw-medium" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} style={{ fontSize: '0.9rem' }}>
                                <option value="Todos">Todas las Áreas</option>
                                {areas.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRILLA DE INSERTOS */}
            <div className="row g-3">
                {filteredInsertos.map((item) => {
                    const itemId = item.id || '';
                    const isExpanded = !!expandedCards[itemId];
                    const requiereVerMas = (item.descripcionCorta || '').length > 160;

                    return (
                        <div className="col-md-6 col-xl-4" key={itemId}>
                            
                            {/* VISTA 1: TARJETA NORMAL EN LA GRILLA */}
                            <div className="card h-100 border border-light-subtle shadow-sm rounded-4 overflow-hidden bg-white hover-card d-flex flex-column justify-content-between">
                                <div>
                                    <div style={{ height: '4px', backgroundColor: getAreaColor(item.area) }}></div>
                                    
                                    <div className="card-body p-4 pb-0">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge rounded-pill fw-semibold" style={{ backgroundColor: `${getAreaColor(item.area)}12`, color: getAreaColor(item.area), border: `1px solid ${getAreaColor(item.area)}25`, fontSize: '0.75rem' }}>
                                                {item.area}
                                            </span>
                                            <div className="d-flex gap-1">
                                                <button onClick={() => handleEdit(item)} className="btn btn-sm text-secondary hover-bg rounded-circle p-1.5 border-0 bg-transparent" title="Editar"><Edit3 size={15}/></button>
                                                <button onClick={() => item.id && handleEliminar(item.id, item.nombre)} className="btn btn-sm text-danger hover-bg rounded-circle p-1.5 border-0 bg-transparent" title="Eliminar"><Trash2 size={15}/></button>
                                            </div>
                                        </div>

                                        <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{item.nombre}</h5>
                                        
                                        <div className="d-flex align-items-center text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                                            <Tag size={12} className="me-1 text-primary opacity-70"/> 
                                            <span className="font-monospace fw-bold text-primary">{item.codigo}</span>
                                        </div>

                                        {/* TEXTO CON LÍMITE ESTRICTO DE 4 LÍNEAS */}
                                        <div className="position-relative mb-2">
                                            <p className="text-secondary small mb-1 lh-base text-truncate-custom">
                                                {item.descripcionCorta || "Sin descripción corta cargada."}
                                            </p>
                                            
                                            {requiereVerMas && (
                                                <button 
                                                    type="button"
                                                    onClick={() => toggleExpand(itemId)}
                                                    className="btn btn-link p-0 text-decoration-none small fw-bold text-primary d-inline-flex align-items-center gap-1 mb-2 mt-1 shadow-none"
                                                    style={{ fontSize: '0.75rem', outline: 'none' }}
                                                >
                                                    Ver más <ChevronDown size={12} />
                                                </button>
                                            )}
                                        </div>

                                        {/* DETALLES CLÍNICOS RÁPIDOS */}
                                        <div className="p-3 rounded-3 bg-light mb-4 border border-light-subtle d-flex flex-column gap-2.5">
                                            <div className="d-flex align-items-start gap-2 flex-grow-1">
                                                <div className="text-primary mt-0.5"><Info size={14}/></div>
                                                <div className="small text-dark" style={{ fontSize: '0.8rem' }}>
                                                    <span className="text-muted d-block fw-medium">Metodología</span>
                                                    <strong className="text-truncate-1">{item.metodologia || 'No especificada'}</strong>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-start gap-2 flex-grow-1">
                                                <div className="text-success mt-0.5"><TestTube size={14}/></div>
                                                <div className="small text-dark" style={{ fontSize: '0.8rem' }}>
                                                    <span className="text-muted d-block fw-medium">Muestra / Requerimientos</span>
                                                    <strong className="text-truncate-1">{item.requerimientos || 'Sin requisitos especiales'}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer bg-white border-0 pt-0 p-4">
                                    <button 
                                        onClick={() => item.enlaceDocumento && window.open(item.enlaceDocumento, '_blank', 'noopener,noreferrer')}
                                        className={`btn w-100 rounded-3 py-2 fw-semibold btn-sm d-flex align-items-center justify-content-center transition-all ${item.enlaceDocumento ? 'btn-dark shadow-sm' : 'btn-light text-muted border border-light-subtle disabled'}`}
                                    >
                                        <FileText size={16} className="me-2"/> 
                                        {item.enlaceDocumento ? 'Abrir Inserto Oficial' : 'Link no disponible'}
                                    </button>
                                </div>
                            </div>

                            {/* 🟢 VISTA 2: TARJETA EXPANDIDA COMO CAPA MODAL ENFOCADA Y CENTRADA (OVERLAY) */}
                            {isExpanded && (
                                <div className="focused-card-overlay animate__animated animate__fadeIn" onClick={() => toggleExpand(itemId)}>
                                    <div 
                                        className="card focused-card-content border-0 shadow-2xl rounded-4 overflow-hidden bg-white animate__animated animate__zoomIn"
                                        onClick={(e) => e.stopPropagation()} // Previene que se cierre al hacer clic dentro de la tarjeta
                                    >
                                        <div style={{ height: '5px', backgroundColor: getAreaColor(item.area) }}></div>
                                        
                                        {/* CABECERA ENFOCADA */}
                                        <div className="p-4 pb-0 d-flex justify-content-between align-items-start">
                                            <div>
                                                <span className="badge rounded-pill fw-semibold mb-2" style={{ backgroundColor: `${getAreaColor(item.area)}12`, color: getAreaColor(item.area), border: `1px solid ${getAreaColor(item.area)}25`, fontSize: '0.75rem' }}>
                                                    {item.area}
                                                </span>
                                                <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>{item.nombre}</h4>
                                                <div className="d-flex align-items-center text-muted small">
                                                    <Tag size={12} className="me-1 text-primary opacity-70"/> 
                                                    Código Catálogo: <span className="font-monospace fw-bold text-primary ms-1">{item.codigo}</span>
                                                </div>
                                            </div>
                                            
                                            {/* 🟢 BOTÓN SUPERIOR DE CIERRE */}
                                            <button className="btn btn-link text-secondary p-2 rounded-circle bg-light border-0 hover-bg transition-all" onClick={() => toggleExpand(itemId)} title="Cerrar vista completa">
                                                <X size={18}/>
                                            </button>
                                        </div>

                                        {/* CUERPO COMPLETO CON SCROLL INTERNO SI EXCEDIERA EL ALTO */}
                                        <div className="card-body p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 160px)' }}>
                                            <h6 className="fw-bold text-dark small text-uppercase tracking-wider text-muted mb-2">Descripción Completa / Estabilidad</h6>
                                            <p className="text-secondary small lh-base mb-4 bg-light p-3 rounded-3 border border-light-subtle" style={{ whiteSpace: 'pre-wrap' }}>
                                                {item.descripcionCorta || "Sin descripción cargada."}
                                            </p>

                                            {/* DETALLES CLÍNICOS HORIZONTALES PARA MAXIMIZAR EL ESPACIO */}
                                            <div className="row g-3 mb-2">
                                                <div className="col-md-6">
                                                    <div className="p-3 rounded-3 bg-light border border-light-subtle h-100">
                                                        <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-semibold small">
                                                            <Info size={16}/> Metodología / Principio
                                                        </div>
                                                        <span className="text-dark small fw-medium">{item.metodologia || 'No especificada'}</span>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-3 rounded-3 bg-light border border-light-subtle h-100">
                                                        <div className="d-flex align-items-center gap-2 mb-2 text-success fw-semibold small">
                                                            <TestTube size={16}/> Muestra / Requerimientos
                                                        </div>
                                                        <span className="text-dark small fw-medium">{item.requerimientos || 'Sin requisitos especiales'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ACCIONES DEL MODAL */}
                                        <div className="p-4 bg-light border-top d-flex flex-column flex-sm-row gap-2 justify-content-end">
                                            {/* 🟢 BOTÓN INFERIOR DE CIERRE */}
                                            <button type="button" className="btn btn-outline-secondary rounded-3 py-2 fw-medium btn-sm px-4" onClick={() => toggleExpand(itemId)}>
                                                Cerrar Detalles
                                            </button>
                                            <button 
                                                onClick={() => item.enlaceDocumento && window.open(item.enlaceDocumento, '_blank', 'noopener,noreferrer')}
                                                className={`btn rounded-3 py-2 fw-semibold btn-sm px-4 d-inline-flex align-items-center justify-content-center gap-2 ${item.enlaceDocumento ? 'btn-dark shadow-sm' : 'btn-light text-muted border border-light-subtle disabled'}`}
                                            >
                                                <FileText size={15}/> Abrir Inserto Oficial
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* MODAL CONFIGURADO SOFT UI */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
                            <div className="modal-header border-0 bg-white p-4 pb-2 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
                                    {editingId ? '📝 Editar Datos de Inserto' : '✨ Registrar Nuevo Inserto'}
                                </h5>
                                <button className="btn btn-link text-secondary p-1 rounded-circle bg-light border-0" onClick={handleCloseModal}>
                                    <X size={16}/>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body p-4 pt-2">
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label small fw-semibold text-muted mb-1">Nombre de la Prueba</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required placeholder="Ej: Ferritina Gen.4" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold text-muted mb-1">Código / Catálogo</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none font-monospace custom-focus" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required placeholder="FERR4" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Área Técnica</label>
                                        <select className="form-select bg-light border-0 rounded-3 py-2 text-dark shadow-none" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})}>
                                            {areas.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Enlace Oficial de Documentación (Roche web)</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus" type="url" value={formData.enlaceDocumento} onChange={e => setFormData({...formData, enlaceDocumento: e.target.value})} placeholder="https://elabdoc.roche.com/..." />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-semibold text-muted mb-1">Descripción / Estabilidad Corta</label>
                                        <textarea className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus" rows={3} value={formData.descripcionCorta} onChange={e => setFormData({...formData, descripcionCorta: e.target.value})} placeholder="Ej: Estable 7 días a 2-8°C. Rango de medición..."></textarea>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Metodología / Principio</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus" value={formData.metodologia} onChange={e => setFormData({...formData, metodologia: e.target.value})} placeholder="Ej: ECLIA (Inmunoensayo de electroquimioluminiscencia)" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Tipo de Muestra / Condiciones</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus" value={formData.requerimientos} onChange={e => setFormData({...formData, requerimientos: e.target.value})} placeholder="Ej: Suero o Plasma con heparina de litio. Ayuno de 8hs." />
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-4 pt-2">
                                    <button type="button" className="btn btn-light bg-secondary-subtle border-0 w-50 rounded-3 fw-medium py-2 text-dark btn-sm" onClick={handleCloseModal}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary border-0 w-50 rounded-3 fw-medium py-2 text-white btn-sm shadow-none">
                                        {editingId ? 'Actualizar Datos' : 'Guardar Inserto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* BOTÓN INFERIOR DE RETORNO */}
            <div className="d-flex justify-content-center mt-5">
                <Link to="/" className="btn btn-light bg-light text-secondary border-0 d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-semibold transition-all small" style={{ textDecoration: 'none' }}>
                    <ArrowLeft size={14} /> <span>Volver al Inicio</span>
                </Link>
            </div>

            {/* HOJA DE ESTILOS CSS LOCALES */}
            <style>{`
                .hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .hover-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08) !important; }
                
                /* 🟢 TRUNCADO RECTO A 4 RENGLONES */
                .text-truncate-custom { 
                    display: -webkit-box; 
                    -webkit-line-clamp: 4; 
                    -webkit-box-orient: vertical; 
                    overflow: hidden; 
                    text-overflow: ellipsis;
                    height: 5.8rem; /* Forzado de altura uniforme para que mantengan la misma simetría */
                }

                .text-truncate-1 {
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* 🟢 CAPA OSCURA DE FONDO (BACKDROP) */
                .focused-card-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(15, 23, 42, 0.6); /* Color pizarra oscuro traslúcido */
                    backdrop-filter: blur(4px); /* Difumina las cartas de atrás */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1100; /* Por encima de sidebars y barras superiores */
                    padding: 20px;
                }

                /* 🟢 TARJETA CENTRADA EXPANDIDA COMPLETA */
                .focused-card-content {
                    width: 100%;
                    max-width: 720px; /* Ancho cómodo de lectura horizontal */
                    max-height: 85vh;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                }

                .hover-bg:hover { background-color: #f1f5f9 !important; }
                .custom-focus:focus { background-color: #fff !important; border: 1px solid #cbd5e1 !important; }
            `}</style>
        </div>
    );
};

export default Insertos;