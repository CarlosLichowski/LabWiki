// src/Pages/Personal/Insertos/Insertos.tsx
// src/Pages/Personal/Insertos/Insertos.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../Credenciales';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Search, Plus, FileText, Edit3, Trash2, Beaker, TestTube, Info, Tag, ArrowLeft, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Inserto {
    id?: string;
    nombre: string;
    codigo: string;
    descripcionCorta: string;
    metodologia: string;
    requerimientos: string; 
    enlaceDocumento: string; 
    area: string;
}

const Insertos: React.FC = () => {
    const [insertosList, setInsertosList] = useState<Inserto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('Todos');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

    const initialFormState: Inserto = {
        nombre: '', codigo: '', descripcionCorta: '', metodologia: '',
        requerimientos: '', enlaceDocumento: '', area: 'Química'
    };

    const [formData, setFormData] = useState<Inserto>(initialFormState);

    useEffect(() => {
        const q = query(collection(db, 'procedimientos'), orderBy('nombre', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Inserto));
            setInsertosList(docs);
        });
        return () => unsubscribe();
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

    // Encontrar el item enfocado actualmente en pantalla completa
    const focusedItem = useMemo(() => {
        return insertosList.find(item => item.id === focusedItemId) || null;
    }, [insertosList, focusedItemId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const loadingToast = toast.loading('Guardando especificaciones técnicas...');
        try {
            editingId 
                ? await updateDoc(doc(db, 'procedimientos', editingId), { ...formData })
                : await addDoc(collection(db, 'procedimientos'), formData);
            toast.success(editingId ? "Inserto actualizado correctamente" : "Nueva prueba registrada", { id: loadingToast });
            handleCloseModal();
        } catch (error) { 
            toast.error("Error al guardar en el servidor", { id: loadingToast }); 
        }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (window.confirm(`¿Remover de forma definitiva la prueba de "${nombre}"?`)) {
            try {
                await deleteDoc(doc(db, 'procedimientos', id));
                toast.success("Procedimiento eliminado");
            } catch (error) {
                toast.error("Error al procesar la baja");
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
            'Química': '#4f46e5',      // Indigo SaaS
            'Hematología': '#f43f5e',  // Rose
            'Inmunología': '#a855f7',  // Purple
            'Microbiología': '#10b981',// Emerald
            'Orinas': '#f59e0b',       // Amber
            'Citología': '#ec4899'      // Pink
        };
        return colors[area] || '#64748b';
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            
            {/* CABECERA */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 border-bottom pb-3">
                <div>
                    <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2" style={{ letterSpacing: '-0.025em' }}>
                        <Beaker className="text-secondary" size={24} /> Biblioteca de Determinaciones
                    </h4>
                    <p className="text-muted small mb-0">Consultas rápidas de metodologías de trabajo, estabilidad y requerimientos de muestra.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-dark rounded-3 px-4 py-2 shadow-sm fw-semibold btn-sm d-flex align-items-center gap-2 border-0">
                    <Plus size={16} /> Nueva Determinación
                </button>
            </div>

            {/* CONTROL DE BÚSQUEDA (SOFT UI BAR) */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
                <div className="card-body p-2">
                    <div className="row g-2">
                        <div className="col-md-9">
                            <div className="input-group bg-light rounded-3 overflow-hidden align-items-center px-2 border-0">
                                <span className="text-muted opacity-50 px-2"><Search size={16}/></span>
                                <input type="text" className="form-control bg-light border-0 shadow-none py-2 text-dark small" placeholder="Buscar por analito, sigla o principio metodológico..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select bg-light border-0 rounded-3 shadow-none py-2 text-secondary fw-semibold small" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                                <option value="Todos">Todas las Áreas Técnicas</option>
                                {areas.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRILLA PRINCIPAL */}
            <div className="row g-3">
                {filteredInsertos.map((item) => {
                    const itemId = item.id || '';
                    return (
                        <div className="col-md-6 col-xl-4" key={itemId}>
                            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white hover-card d-flex flex-column justify-content-between">
                                <div>
                                    <div style={{ height: '4px', backgroundColor: getAreaColor(item.area) }}></div>
                                    <div className="card-body p-4 pb-0">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge rounded-pill fw-bold" style={{ backgroundColor: `${getAreaColor(item.area)}12`, color: getAreaColor(item.area), fontSize: '0.7rem', border: '1px solid transparent' }}>
                                                {item.area}
                                            </span>
                                            <div className="d-flex gap-1">
                                                <button onClick={() => handleEdit(item)} className="btn btn-sm text-secondary hover-bg rounded-circle p-1.5 border-0 bg-transparent" title="Editar analito"><Edit3 size={14}/></button>
                                                <button onClick={() => item.id && handleEliminar(item.id, item.nombre)} className="btn btn-sm text-danger hover-bg rounded-circle p-1.5 border-0 bg-transparent" title="Remover analito"><Trash2 size={14}/></button>
                                            </div>
                                        </div>

                                        <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '1rem', letterSpacing: '-0.2px' }}>{item.nombre}</h6>
                                        
                                        <div className="d-flex align-items-center text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                                            <Tag size={12} className="me-1 text-primary opacity-60"/> 
                                            ID Catálogo: <span className="font-monospace fw-bold text-primary ms-1">{item.codigo}</span>
                                        </div>

                                        <div className="position-relative mb-2">
                                            <p className="text-secondary small mb-1 lh-base text-truncate-custom m-0">
                                                {item.descripcionCorta || "Sin especificaciones de estabilidad cargadas."}
                                            </p>
                                            <button 
                                                type="button"
                                                onClick={() => setFocusedItemId(itemId)}
                                                className="btn btn-link p-0 text-decoration-none extra-small fw-bold text-primary d-inline-flex align-items-center gap-1 mb-2 mt-1 shadow-none border-0 bg-transparent"
                                            >
                                                Ver detalles completos <ChevronDown size={11} />
                                            </button>
                                        </div>

                                        <div className="p-3 rounded-3 bg-light mb-4 d-flex flex-column gap-2 border">
                                            <div className="d-flex align-items-start gap-2 flex-grow-1">
                                                <div className="text-primary mt-0.5"><Info size={13}/></div>
                                                <div className="text-dark" style={{ fontSize: '0.78rem' }}>
                                                    <span className="text-muted d-block fw-medium small">Metodología</span>
                                                    <strong className="text-truncate-1 text-secondary">{item.metodologia || 'No especificada'}</strong>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-start gap-2 flex-grow-1">
                                                <div className="text-success mt-0.5"><TestTube size={13}/></div>
                                                <div className="text-dark" style={{ fontSize: '0.78rem' }}>
                                                    <span className="text-muted d-block fw-medium small">Muestra / Requerimientos</span>
                                                    <strong className="text-truncate-1 text-secondary">{item.requerimientos || 'Sin requisitos especiales'}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer bg-white border-0 pt-0 p-4">
                                    <button 
                                        onClick={() => item.enlaceDocumento && window.open(item.enlaceDocumento, '_blank', 'noopener,noreferrer')}
                                        className={`btn w-100 rounded-3 py-2 fw-semibold btn-sm d-flex align-items-center justify-content-center transition-all ${item.enlaceDocumento ? 'btn-outline-dark shadow-none' : 'btn-light text-muted border disabled'}`}
                                    >
                                        <FileText size={14} className="me-2"/> 
                                        {item.enlaceDocumento ? 'Abrir Inserto Oficial' : 'Documentación PDF no enlazada'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 🟢 VISTA EN PANTALLA COMPLETA DETALLES (RENDERIZADO FUERA DE LA GRILLA) */}
            {focusedItem && (
                <div className="focused-card-overlay animate__animated animate__fadeIn" onClick={() => setFocusedItemId(null)}>
                    <div className="card focused-card-content border-0 shadow rounded-4 overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
                        <div style={{ height: '5px', backgroundColor: getAreaColor(focusedItem.area) }}></div>
                        
                        <div className="p-4 pb-2 d-flex justify-content-between align-items-start">
                            <div>
                                <span className="badge rounded-pill fw-bold mb-2" style={{ backgroundColor: `${getAreaColor(focusedItem.area)}12`, color: getAreaColor(focusedItem.area), fontSize: '0.7rem' }}>
                                    {focusedItem.area}
                                </span>
                                <h5 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>{focusedItem.nombre}</h5>
                                <div className="d-flex align-items-center text-muted small" style={{ fontSize: '0.8rem' }}>
                                    <Tag size={12} className="me-1 text-primary opacity-70"/> 
                                    Código de Catálogo Interno: <span className="font-monospace fw-bold text-primary ms-1">{focusedItem.codigo}</span>
                                </div>
                            </div>
                            <button className="btn btn-link text-secondary p-1 rounded-circle bg-light border-0 hover-bg transition-all" onClick={() => setFocusedItemId(null)}>
                                <X size={16}/>
                            </button>
                        </div>

                        <div className="card-body p-4 overflow-y-auto text-start" style={{ maxHeight: 'calc(75vh - 120px)' }}>
                            <span className="small fw-bold text-muted text-uppercase tracking-wider mb-2 d-block" style={{ fontSize: '0.65rem' }}>Estabilidad / Rangos / Observaciones</span>
                            <p className="text-secondary small lh-base mb-4 bg-light p-3 rounded-3 border" style={{ whiteSpace: 'pre-wrap', color: '#334155' }}>
                                {focusedItem.descripcionCorta || "Sin descripción de estabilidad detallada."}
                            </p>

                            <div className="row g-3 mb-2">
                                <div className="col-md-6">
                                    <div className="p-3 rounded-3 bg-white border h-100">
                                        <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-semibold small">
                                            <Info size={14}/> Principio del Ensayo
                                        </div>
                                        <span className="text-secondary small fw-medium">{focusedItem.metodologia || 'No especificada'}</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 rounded-3 bg-white border h-100">
                                        <div className="d-flex align-items-center gap-2 mb-2 text-success fw-semibold small">
                                            <TestTube size={14}/> Criterios de Aceptación de Muestra
                                        </div>
                                        <span className="text-secondary small fw-medium">{focusedItem.requerimientos || 'Sin requisitos especiales'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-light border-top d-flex gap-2 justify-content-end">
                            <button type="button" className="btn btn-light border rounded-3 py-2 fw-medium btn-sm px-4 text-secondary" onClick={() => setFocusedItemId(null)}>
                                Cerrar Ventana
                            </button>
                            <button 
                                onClick={() => focusedItem.enlaceDocumento && window.open(focusedItem.enlaceDocumento, '_blank', 'noopener,noreferrer')}
                                className={`btn rounded-3 py-2 fw-semibold btn-sm px-4 d-inline-flex align-items-center justify-content-center gap-2 ${focusedItem.enlaceDocumento ? 'btn-dark' : 'btn-light text-muted border disabled'}`}
                            >
                                <FileText size={14}/> Ver PDF Completo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL FORMULARIO */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.25)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden bg-white">
                            <div className="modal-header border-0 bg-white p-4 pb-2 d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold text-dark mb-0">
                                    {editingId ? '📝 Editar Configuración de Analito' : '✨ Registrar Nueva Determinación Técnica'}
                                </h6>
                                <button className="btn btn-link text-secondary p-1 rounded-circle bg-light border-0" onClick={handleCloseModal}>
                                    <X size={16}/>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body p-4 pt-2">
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label small fw-semibold text-muted mb-1">Nombre Comercial / Analito</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus small" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required placeholder="Ej: Troponina T hs (Stat)" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold text-muted mb-1">Código de Mapeo (Siglas)</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none font-monospace custom-focus small" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required placeholder="TNT-HS" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Área de Trabajo</label>
                                        <select className="form-select bg-light border-0 rounded-3 py-2 text-dark shadow-none small fw-medium" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})}>
                                            {areas.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">URL de Documentación Técnica</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus small" type="url" value={formData.enlaceDocumento} onChange={e => setFormData({...formData, enlaceDocumento: e.target.value})} placeholder="https://elabdoc.roche.com/..." />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-semibold text-muted mb-1">Estabilidad del Reactivo y Muestra / Observaciones Clínicas</label>
                                        <textarea className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus small" rows={4} value={formData.descripcionCorta} onChange={e => setFormData({...formData, descripcionCorta: e.target.value})} placeholder="Ej: Suero estable 24hs a 2-8°C. Rango analítico: 5 - 10000 pg/mL. Interferencias por ictericia grave..."></textarea>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Principio Científico</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus small" value={formData.metodologia} onChange={e => setFormData({...formData, metodologia: e.target.value})} placeholder="Ej: Inmunoensayo tipo Sándwich por quimioluminiscencia" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted mb-1">Tipo de Contenedor / Tubo de Extracción</label>
                                        <input className="form-control bg-light border-0 rounded-3 py-2 text-dark shadow-none custom-focus small" value={formData.requerimientos} onChange={e => setFormData({...formData, requerimientos: e.target.value})} placeholder="Ej: Tubo tapón rojo (Gel separador) o Heparina. Centrifugar 10 min." />
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-4 pt-2">
                                    <button type="button" className="btn btn-light border w-50 rounded-3 py-2 text-secondary btn-sm fw-medium" onClick={handleCloseModal}>Cancelar</button>
                                    <button type="submit" className="btn btn-dark w-50 rounded-3 py-2 text-white btn-sm fw-semibold shadow-none">
                                        {editingId ? 'Confirmar Cambios' : 'Registrar Analito'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* RETORNO */}
            <div className="d-flex justify-content-center mt-4">
                <Link to="/" className="btn btn-link text-decoration-none text-muted d-inline-flex align-items-center gap-2 small border-0 fw-medium">
                    <ArrowLeft size={14} /> <span>Volver al Inicio</span>
                </Link>
            </div>

            {/* HOJA DE ESTILOS */}
            <style>{`
                .hover-card { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); border-color: #f1f5f9 !important; }
                .hover-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04) !important; }
                
                .text-truncate-custom { 
                    display: -webkit-box; 
                    -webkit-line-clamp: 3; 
                    -webkit-box-orient: vertical; 
                    overflow: hidden; 
                    text-overflow: ellipsis;
                    height: 4.2rem; 
                    color: #475569 !important;
                }
                .text-truncate-1 { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .focused-card-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background-color: rgba(15, 23, 42, 0.35); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px;
                }
                .focused-card-content { width: 100%; max-width: 600px; max-height: 80vh; }
                .hover-bg:hover { background-color: #f8fafc !important; }
                .custom-focus:focus { background-color: #fff !important; border: 1px solid #e2e8f0 !important; }
            `}</style>
        </div>
    );
};

export default Insertos;