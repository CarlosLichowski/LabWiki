import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../Credenciales';
import { 
    collection, 
    onSnapshot, 
    query, 
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
    Beaker, 
    ArrowLeft, 
    Loader2, 
    Plus, 
    Pencil, 
    Trash2, 
    X, 
    Save,
    Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TarjetaReactivo } from './TarjetaReactivo/TarjetaReactivo';
import '../../css/Insertos.css';

export interface Reactivo {
    id: string;
    analito: string;
    descripcion: string;
    codigos_catalogo: string[];
    url_imagen?: string;
    url_inserto?: string;
    url_catalogo?: string; 
    area?: string;
    realizado_en_laboratorio: boolean;
    proveedor: string; 
    creadoPor?: string;
}

type FiltroEstado = 'en_hospital' | 'no_realizados' | 'todos';

const ANALITOS_QUIMICA_STRICT = new Set([
    'A1C3', 'AAGP', 'AAT', 'ABL2', 'ALBT2', 'ALP', 'ALP2S', 'ALTP2', 'AMYL', 
    'APOAT', 'APOBT2', 'ASTL', 'ASTP2', 'B2MG', 'BILD2', 'BILT3', 'C3c-2', 
    'c4-2', 'ca2', 'carb4', 'ckmb', 'ck', 'chol2', 'cl', 'Crej2', 'AFP', 
    'Anti-CCP', 'CA125', 'CA15-3', 'CA19-9'
]);

const INMUNOLOGIA_KEYWORDS = ['elecsys', 't4', 'tsh', 'troponin', 'ferritin', 'vitamin', 'cortisol'];

const deducirAreaTecnica = (analito: string, descripcion: string): string => {
    if (ANALITOS_QUIMICA_STRICT.has(analito)) return 'Química';

    const textoAnalisis = `${analito} ${descripcion}`.toLowerCase();
    const esInmuno = INMUNOLOGIA_KEYWORDS.some(keyword => textoAnalisis.includes(keyword));
    
    return esInmuno ? 'Inmunología' : 'Química';
};

const auth = getAuth();

const Insertos: React.FC = () => {
    const [reactivosList, setReactivosList] = useState<Reactivo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('Todos');
    const [selectedProveedor, setSelectedProveedor] = useState('Todos'); 
    
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('en_hospital');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Estado del usuario actual
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Estado de Modales (Crear / Editar)
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Reactivo | null>(null);
    const [saving, setSaving] = useState(false);

    // Campos del Formulario
    const [formData, setFormData] = useState({
        analito: '',
        descripcion: '',
        proveedor: 'ROCHE',
        area: 'Química',
        codigos_catalogo: '',
        url_inserto: '',
        url_imagen: '',
        url_catalogo: '',
        realizado_en_laboratorio: true
    });

    const areas = ['Química', 'Inmunología', 'Hematología', 'Hemoterapia', 'Microbiología'];
    
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
            }
        });

        const q = query(collection(db, 'reactivos'));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const docs: Reactivo[] = snapshot.docs.map(d => {
                const data = d.data();
                const analitoName = data.analito || 'Sin Nombre';
                const descripcionText = data.descripcion || '';
                const areaDeducida = data.area || deducirAreaTecnica(analitoName, descripcionText);

                return {
                    id: d.id,
                    analito: analitoName,
                    descripcion: descripcionText,
                    codigos_catalogo: data.codigos_catalogo || [],
                    url_imagen: data.url_imagen || '',
                    url_inserto: data.url_inserto || '', 
                    url_catalogo: data.url_catalogo || '', 
                    area: areaDeducida, 
                    realizado_en_laboratorio: data.realizado_en_laboratorio !== undefined ? data.realizado_en_laboratorio : true,
                    proveedor: data.proveedor ? data.proveedor.toUpperCase().trim() : 'ROCHE',
                    creadoPor: data.creadoPor || ''
                };
            });

            docs.sort((a, b) => a.analito.localeCompare(b.analito));
            setReactivosList(docs);
            setLoading(false);
        }, (error) => {
            console.error("Error al cargar los reactivos:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeSnapshot();
        };
    }, []);

    const proveedoresDisponibles = useMemo(() => {
        const provs = new Set(reactivosList.map(r => r.proveedor));
        return Array.from(provs).sort();
    }, [reactivosList]);

    const filteredReactivos = useMemo(() => {
        const s = searchTerm.toLowerCase().trim();
        return reactivosList.filter(r => {
            if (filtroEstado === 'en_hospital' && !r.realizado_en_laboratorio) return false;
            if (filtroEstado === 'no_realizados' && r.realizado_en_laboratorio) return false;

            const matchArea = selectedArea === 'Todos' || r.area === selectedArea;
            if (!matchArea) return false;

            const matchProveedor = selectedProveedor === 'Todos' || r.proveedor === selectedProveedor;
            if (!matchProveedor) return false;

            if (!s) return true;

            return (
                r.analito.toLowerCase().includes(s) || 
                r.descripcion.toLowerCase().includes(s) ||
                r.codigos_catalogo.some(cod => cod.toLowerCase().includes(s))
            );
        });
    }, [searchTerm, selectedArea, selectedProveedor, reactivosList, filtroEstado]);

    const handleOpenCreateModal = () => {
        if (!currentUserId) {
            alert("Debes iniciar sesión para registrar un nuevo inserto.");
            return;
        }
        setEditingItem(null);
        setFormData({
            analito: '',
            descripcion: '',
            proveedor: 'ROCHE',
            area: 'Química',
            codigos_catalogo: '',
            url_inserto: '',
            url_imagen: '',
            url_catalogo: '',
            realizado_en_laboratorio: true
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (item: Reactivo) => {
        setEditingItem(item);
        setFormData({
            analito: item.analito,
            descripcion: item.descripcion,
            proveedor: item.proveedor,
            area: item.area || 'Química',
            codigos_catalogo: item.codigos_catalogo.join(', '),
            url_inserto: item.url_inserto || '',
            url_imagen: item.url_imagen || '',
            url_catalogo: item.url_catalogo || '',
            realizado_en_laboratorio: item.realizado_en_laboratorio
        });
        setShowModal(true);
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId) {
            alert("Debes estar autenticado para realizar esta acción.");
            return;
        }

        if (!formData.analito.trim()) {
            alert("El nombre del analito es obligatorio.");
            return;
        }

        setSaving(true);

        const codigosArray = formData.codigos_catalogo
            .split(',')
            .map(c => c.trim())
            .filter(c => c.length > 0);

        const payload = {
            analito: formData.analito.trim(),
            descripcion: formData.descripcion.trim(),
            proveedor: formData.proveedor.trim().toUpperCase(),
            area: formData.area,
            codigos_catalogo: codigosArray,
            url_inserto: formData.url_inserto.trim(),
            url_imagen: formData.url_imagen.trim(),
            url_catalogo: formData.url_catalogo.trim(),
            realizado_en_laboratorio: formData.realizado_en_laboratorio,
            updatedAt: serverTimestamp()
        };

        try {
            if (editingItem) {
                const itemRef = doc(db, 'reactivos', editingItem.id);
                await updateDoc(itemRef, payload);
            } else {
                await addDoc(collection(db, 'reactivos'), {
                    ...payload,
                    creadoPor: currentUserId,
                    createdAt: serverTimestamp()
                });
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar el reactivo:", error);
            alert("Ocurrió un error al intentar guardar los datos.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (id: string, analito: string) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar "${analito}"?`)) return;

        try {
            await deleteDoc(doc(db, 'reactivos', id));
        } catch (error) {
            console.error("Error al eliminar el reactivo:", error);
            alert("No posees permisos para eliminar este elemento.");
        }
    };

    return (
        <div className="insertos-container">
            {/* CABECERA */}
            <header className="insertos-header">
                <div className="header-info">
                    <h4 className="header-title">
                        <Beaker size={26} className="header-icon" /> Biblioteca de Reactivos & Ensayos
                    </h4>
                    <p className="header-subtitle">
                         Menú de prestaciones multi-proveedor. Consulta rápida de determinaciones e insertos.
                    </p>
                </div>
                <div className="header-actions">
                    <div className="header-badges">
                        <span className="badge-status badge-success">
                            En Lab: <strong>{reactivosList.filter(r => r.realizado_en_laboratorio).length}</strong>
                        </span>
                        <span className="badge-status badge-total">
                            Total Catálogo: <strong>{reactivosList.length}</strong>
                        </span>
                    </div>
                    {currentUserId && (
                        <button className="btn-add-inserto" onClick={handleOpenCreateModal}>
                            <Plus size={18} /> Nuevo Inserto
                        </button>
                    )}
                </div>
            </header>

            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div className="filters-card">
                <div className="filters-grid">
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Buscar por analito, descripción o código..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>

                    <div className="select-wrapper">
                        <select 
                            className="filter-select" 
                            value={filtroEstado} 
                            onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
                        >
                            <option value="en_hospital">En Hospital</option>
                            <option value="no_realizados">No se hacen</option>
                            <option value="todos">Ver Todos</option>
                        </select>
                    </div>

                    <select 
                        className="filter-select" 
                        value={selectedArea} 
                        onChange={(e) => setSelectedArea(e.target.value)}
                    >
                        <option value="Todos">Todas las Áreas</option>
                        {areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <select 
                        className="filter-select" 
                        value={selectedProveedor} 
                        onChange={(e) => setSelectedProveedor(e.target.value)}
                    >
                        <option value="Todos">Todos los Proveedores</option>
                        {proveedoresDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            {/* GRID DE REACTIVOS / SPINNER DE CARGA */}
            {loading ? (
                <div className="loading-state">
                    <Loader2 size={40} className="animate-spin text-primary" />
                    <span>Cargando catálogo de insertos...</span>
                </div>
            ) : filteredReactivos.length === 0 ? (
                <div className="empty-state">
                    <p>No se encontraron reactivos con los filtros seleccionados.</p>
                </div>
            ) : (
                <main className="reactivos-grid-layout"> 
                    {filteredReactivos.map((item) => {
                        const esDueno = currentUserId && item.creadoPor === currentUserId;
                        return (
                            <div key={item.id} className="reactivo-card-wrapper">
                                <TarjetaReactivo 
                                    item={item} 
                                    areas={areas}
                                    updatingId={updatingId}
                                    setUpdatingId={setUpdatingId}
                                    reactivosList={reactivosList}
                                    setReactivosList={setReactivosList}
                                />
                                {esDueno && (
                                    <div className="card-owner-actions">
                                        <button 
                                            className="btn-card-action btn-card-edit" 
                                            onClick={() => handleOpenEditModal(item)}
                                            title="Editar mi inserto"
                                        >
                                            <Pencil size={13} /> Editar
                                        </button>
                                        <button 
                                            className="btn-card-action btn-card-delete" 
                                            onClick={() => handleDeleteItem(item.id, item.analito)}
                                            title="Eliminar mi inserto"
                                        >
                                            <Trash2 size={13} /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </main>
            )}

            {/* MODAL DE FORMULARIO DE INSERTOS */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h5>{editingItem ? 'Editar Inserto / Reactivo' : 'Cargar Nuevo Inserto'}</h5>
                            <button type="button" className="btn-close-modal" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitForm}>
                            <div className="modal-body">
                                <div className="form-group-custom">
                                    <label>Nombre del Analito *</label>
                                    <input 
                                        type="text" 
                                        className="form-control-custom"
                                        placeholder="Ej: GLUCOSA, TSH, PCR"
                                        value={formData.analito}
                                        onChange={e => setFormData({ ...formData, analito: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group-custom">
                                    <label>Descripción / Principio Activo</label>
                                    <input 
                                        type="text" 
                                        className="form-control-custom"
                                        placeholder="Ej: Determinación cuantitativa de glucosa"
                                        value={formData.descripcion}
                                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    />
                                </div>

                                <div className="form-row-custom">
                                    <div className="form-group-custom">
                                        <label>Proveedor</label>
                                        <input 
                                            type="text" 
                                            className="form-control-custom"
                                            placeholder="Ej: ROCHE, WIENER, ABBOTT"
                                            value={formData.proveedor}
                                            onChange={e => setFormData({ ...formData, proveedor: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-custom">
                                        <label>Área Técnica</label>
                                        <select 
                                            className="form-control-custom"
                                            value={formData.area}
                                            onChange={e => setFormData({ ...formData, area: e.target.value })}
                                        >
                                            {areas.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-custom">
                                    <label>Códigos de Catálogo (separados por coma)</label>
                                    <input 
                                        type="text" 
                                        className="form-control-custom"
                                        placeholder="Ej: 04404483190, 03183807190"
                                        value={formData.codigos_catalogo}
                                        onChange={e => setFormData({ ...formData, codigos_catalogo: e.target.value })}
                                    />
                                </div>

                                <div className="form-group-custom">
                                    <label>URL del Inserto Técnico (PDF / Web)</label>
                                    <input 
                                        type="url" 
                                        className="form-control-custom"
                                        placeholder="https://ejemplo.com/inserto.pdf"
                                        value={formData.url_inserto}
                                        onChange={e => setFormData({ ...formData, url_inserto: e.target.value })}
                                    />
                                </div>

                                <div className="form-group-custom">
                                    <label>URL de Imagen del Reactivo</label>
                                    <input 
                                        type="url" 
                                        className="form-control-custom" 
                                        placeholder="https://ejemplo.com/imagen.png"
                                        value={formData.url_imagen}
                                        onChange={e => setFormData({ ...formData, url_imagen: e.target.value })}
                                    />
                                </div>

                                <div className="form-group-custom checkbox-group">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.realizado_en_laboratorio}
                                            onChange={e => setFormData({ ...formData, realizado_en_laboratorio: e.target.checked })}
                                        />
                                        <span>Se realiza en el laboratorio</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn-secondary-custom" 
                                    onClick={() => setShowModal(false)}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary-custom"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <><Loader2 size={16} className="animate-spin" /> Guardando...</> 
                                    ) : (
                                        <><Save size={16} /> {editingItem ? 'Guardar Cambios' : 'Crear Inserto'}</> 
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ACCIONES DE PIE DE PÁGINA */}
            <footer className="insertos-footer">
                <Link to="/" className="back-panel-link">
                    <ArrowLeft size={14} /> Volver al Panel de Inicio
                </Link>
            </footer>
        </div>
    );
};

export default Insertos;