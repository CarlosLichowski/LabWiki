import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../Credenciales';
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
import { Search, Plus, FileText, Edit3, Trash2, Microscope, TestTube, Info, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface Analisis {
    id?: string;
    nombre: string;
    codigo: string;
    descripcionCorta: string;
    metodologia: string;
    requerimientos: string;
    enlaceDocumento: string;
    area: string;
}

const AnalisisProcedimientos: React.FC = () => {
    const [analisisList, setAnalisisList] = useState<Analisis[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('Todos');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: Analisis = {
        nombre: '', codigo: '', descripcionCorta: '', metodologia: '',
        requerimientos: '', enlaceDocumento: '', area: 'Química'
    };

    const [formData, setFormData] = useState<Analisis>(initialFormState);

    useEffect(() => {
        const q = query(collection(db, 'procedimientos'), orderBy('nombre', 'asc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Analisis));
            setAnalisisList(docs);
        });
        return () => unsub();
    }, []);

    const areas = ['Química', 'Hematología', 'Inmunología', 'Microbiología', 'Orinas', 'Citología'];

    const filteredAnalisis = useMemo(() => {
        return analisisList.filter(a => {
            const matchArea = selectedArea === 'Todos' || a.area === selectedArea;
            const s = searchTerm.toLowerCase();
            return matchArea && (a.nombre.toLowerCase().includes(s) || a.codigo.toLowerCase().includes(s));
        });
    }, [searchTerm, selectedArea, analisisList]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            editingId 
                ? await updateDoc(doc(db, 'procedimientos', editingId), { ...formData })
                : await addDoc(collection(db, 'procedimientos'), formData);
            toast.success(editingId ? "Actualizado" : "Agregado");
            handleCloseModal();
        } catch (error) { toast.error("Error al procesar"); }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (window.confirm(`¿Eliminar "${nombre}"?`)) {
            await deleteDoc(doc(db, 'procedimientos', id));
            toast.success("Eliminado");
        }
    };

    const handleEdit = (item: Analisis) => {
        setFormData(item);
        setEditingId(item.id || null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    // Función para asignar colores por área
    const getAreaColor = (area: string) => {
        const colors: { [key: string]: string } = {
            'Química': '#0d6efd',
            'Hematología': '#dc3545',
            'Inmunología': '#6610f2',
            'Microbiología': '#198754',
            'Orinas': '#ffc107',
            'Citología': '#d63384'
        };
        return colors[area] || '#6c757d';
    };

    return (
        <div className="container-fluid py-4 bg-light min-vh-100">
            {/* ENCABEZADO */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-0 text-dark d-flex align-items-center">
                        <Microscope className="me-2 text-primary" /> Manual de Procedimientos
                    </h2>
                    <p className="text-muted mb-0">Protocolos estandarizados de laboratorio (POE)</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">
                    <Plus size={20} className="me-2" /> Nueva Prueba
                </button>
            </div>

            {/* BUSCADOR */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-8">
                            <div className="input-group bg-white border rounded-3 overflow-hidden">
                                <span className="input-group-text border-0 bg-transparent text-muted"><Search size={18}/></span>
                                <input type="text" className="form-control border-0 shadow-none" placeholder="Buscar prueba por nombre o código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select className="form-select border rounded-3 shadow-none" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                                <option value="Todos">Filtrar por Área: Todas</option>
                                {areas.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRILLA DE CARTAS */}
            <div className="row g-4">
                {filteredAnalisis.map((item) => (
                    <div className="col-md-6 col-xl-4" key={item.id}>
                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover">
                            {/* Línea de color superior según área */}
                            <div style={{ height: '6px', backgroundColor: getAreaColor(item.area) }}></div>
                            
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="badge rounded-pill fw-medium" style={{ backgroundColor: `${getAreaColor(item.area)}15`, color: getAreaColor(item.area), border: `1px solid ${getAreaColor(item.area)}30` }}>
                                        {item.area}
                                    </span>
                                    <div className="d-flex gap-2">
                                        <button onClick={() => handleEdit(item)} className="btn btn-sm btn-outline-secondary border-0 rounded-circle p-1" title="Editar"><Edit3 size={16}/></button>
                                        <button onClick={() => item.id && handleEliminar(item.id, item.nombre)} className="btn btn-sm btn-outline-danger border-0 rounded-circle p-1" title="Eliminar"><Trash2 size={16}/></button>
                                    </div>
                                </div>

                                <h5 className="fw-bold text-dark mb-1">{item.nombre}</h5>
                                <div className="d-flex align-items-center text-muted small mb-3">
                                    <Tag size={12} className="me-1"/> 
                                    <span className="font-monospace fw-bold text-primary">{item.codigo}</span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-secondary small mb-0" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3em' }}>
                                        {item.descripcionCorta || "Sin descripción disponible."}
                                    </p>
                                </div>

                                <div className="p-3 rounded-3 bg-light mb-4">
                                    <div className="d-flex mb-2">
                                        <div className="me-2 text-primary"><Info size={16}/></div>
                                        <div className="small text-dark"><strong>Metodología:</strong><br/>{item.metodologia}</div>
                                    </div>
                                    <div className="d-flex">
                                        <div className="me-2 text-success"><TestTube size={16}/></div>
                                        <div className="small text-dark"><strong>Muestra:</strong><br/>{item.requerimientos}</div>
                                    </div>
                                </div>

                                <a href={item.enlaceDocumento} target="_blank" rel="noreferrer" 
                                   className={`btn w-100 rounded-3 py-2 fw-bold d-flex align-items-center justify-content-center transition-all ${item.enlaceDocumento ? 'btn-dark' : 'btn-light disabled text-muted border'}`}>
                                    <FileText size={18} className="me-2"/> 
                                    {item.enlaceDocumento ? 'Protocolo Completo' : 'PDF No disponible'}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Estilos adicionales directos */}
            <style>{`
                .card-hover { transition: transform 0.2s ease, shadow 0.2s ease; }
                .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
                .transition-all { transition: all 0.3s ease; }
            `}</style>

            {/* MODAL (Se mantiene la lógica anterior) */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-0 bg-dark text-white p-4">
                                <h5 className="fw-bold mb-0">{editingId ? '📝 Editar Prueba' : '✨ Nueva Prueba de Análisis'}</h5>
                                <button className="btn-close btn-close-white shadow-none" onClick={handleCloseModal}></button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body p-4 bg-white">
                                <div className="row">
                                    <div className="col-md-8 mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Nombre del Análisis</label>
                                        <input className="form-control form-control-lg rounded-3 fs-6" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required placeholder="Ej: Perfil Lipídico" />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Código</label>
                                        <input className="form-control form-control-lg rounded-3 fs-6 font-monospace" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required placeholder="PL-001" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Área Laboratorio</label>
                                        <select className="form-select rounded-3" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})}>
                                            {areas.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Link Documentación (Drive/Dropbox)</label>
                                        <input className="form-control rounded-3" type="url" value={formData.enlaceDocumento} onChange={e => setFormData({...formData, enlaceDocumento: e.target.value})} placeholder="https://..." />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Descripción Breve</label>
                                        <textarea className="form-control rounded-3" rows={2} value={formData.descripcionCorta} onChange={e => setFormData({...formData, descripcionCorta: e.target.value})} placeholder="Describe el objetivo de la prueba..."></textarea>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Metodología / Técnica</label>
                                        <input className="form-control rounded-3" value={formData.metodologia} onChange={e => setFormData({...formData, metodologia: e.target.value})} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-bold text-uppercase text-muted">Tipo de Muestra / Ayuno</label>
                                        <input className="form-control rounded-3" value={formData.requerimientos} onChange={e => setFormData({...formData, requerimientos: e.target.value})} />
                                    </div>
                                </div>
                                <div className="d-flex gap-3 mt-4">
                                    <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1 border" onClick={handleCloseModal}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 flex-grow-1 fw-bold shadow">
                                        {editingId ? 'Actualizar Información' : 'Guardar Procedimiento'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalisisProcedimientos;