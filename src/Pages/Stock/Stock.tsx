import React, { useState, useEffect } from 'react';
import { 
    getFirestore, collection, addDoc, onSnapshot, 
    updateDoc, doc, deleteDoc, query, orderBy 
} from 'firebase/firestore';
import appFirebase from '../../Credenciales';
import { useAuth } from '../../Context/AuthContext';
import { Plus, Minus, Trash2, Search, Beaker, Filter, Settings2 } from 'lucide-react';

const db = getFirestore(appFirebase);

interface Reactivo {
    id: string;
    nombre: string;
    cantidad: number;
    minimoCritico: number;
}

const Stock = () => {
    const { user } = useAuth();
    const [reactivos, setReactivos] = useState<Reactivo[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [soloCriticos, setSoloCriticos] = useState(false);
    const isTestUser = user?.email === "testuser@testuser.com";

    useEffect(() => {
        const q = query(collection(db, 'stock_reactivos'), orderBy('nombre', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs: Reactivo[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                docs.push({ 
                    id: doc.id, 
                    nombre: data.nombre,
                    cantidad: data.cantidad,
                    minimoCritico: data.minimoCritico || 5 
                } as Reactivo);
            });
            setReactivos(docs);
        });
        return () => unsubscribe();
    }, []);

    const agregarReactivo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoNombre.trim() || isTestUser) return;
        try {
            await addDoc(collection(db, 'stock_reactivos'), {
                nombre: nuevoNombre.trim(),
                cantidad: 0,
                minimoCritico: 5,
                fechaCreacion: new Date()
            });
            setNuevoNombre('');
        } catch (error) { console.error(error); }
    };

    const ajustarCantidad = async (id: string, actual: number, cambio: number) => {
        if (isTestUser) return;
        const nuevaCantidad = Math.max(0, actual + cambio);
        await updateDoc(doc(db, 'stock_reactivos', id), { cantidad: nuevaCantidad });
    };

    const cambiarMinimo = async (id: string, nuevoMinimo: number) => {
        if (isTestUser) return;
        const valor = Math.max(0, nuevoMinimo);
        await updateDoc(doc(db, 'stock_reactivos', id), { minimoCritico: valor });
    };

    const eliminarReactivo = async (id: string) => {
        if (isTestUser || !window.confirm("¿Eliminar este reactivo?")) return;
        await deleteDoc(doc(db, 'stock_reactivos', id));
    };

    const reactivosFiltrados = reactivos.filter(r => {
        const coincideNombre = r.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const esCritico = r.cantidad <= r.minimoCritico;
        return soloCriticos ? (coincideNombre && esCritico) : coincideNombre;
    });

    const totalCriticos = reactivos.filter(r => r.cantidad <= r.minimoCritico).length;

    return (
        <div className="container-fluid p-0">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
                <h2 className="text-primary fw-bold mb-0">Control de Inventario</h2>
                <div className="d-flex gap-2">
                    <button 
                        onClick={() => setSoloCriticos(!soloCriticos)}
                        className={`btn btn-sm rounded-pill d-flex align-items-center px-3 transition-all ${soloCriticos ? 'btn-danger shadow' : 'btn-outline-danger'}`}
                    >
                        <Filter size={14} className="me-2"/> 
                        {soloCriticos ? 'Viendo Faltantes' : `Faltantes (${totalCriticos})`}
                    </button>
                    <div className="badge bg-primary-subtle text-primary p-2 px-3 border border-primary-alpha rounded-pill d-flex align-items-center">
                        <Beaker size={14} className="me-2"/> Total: {reactivos.length}
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="input-group shadow-sm">
                        <span className="input-group-text bg-white border-end-0">
                            <Search size={18} className="text-muted"/>
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-start-0" 
                            placeholder="Buscar reactivo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
                {!isTestUser && (
                    <div className="col-md-6">
                        <form onSubmit={agregarReactivo} className="d-flex gap-2">
                            <input 
                                type="text" 
                                className="form-control shadow-sm" 
                                placeholder="Nombre del nuevo reactivo..."
                                value={nuevoNombre}
                                onChange={(e) => setNuevoNombre(e.target.value)}
                            />
                            <button type="submit" className="btn btn-success shadow-sm d-flex align-items-center">
                                <Plus size={18}/>
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4 py-3">Reactivo</th>
                                {/* --- REORDENADO: Mínimo Crítico Primero --- */}
                                <th className="text-center py-3">Mín. Crítico</th>
                                <th className="text-center py-3">Stock Actual</th>
                                <th className="text-end pe-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reactivosFiltrados.length > 0 ? (
                                reactivosFiltrados.map((r) => {
                                    const esCritico = r.cantidad <= r.minimoCritico;
                                    return (
                                        <tr key={r.id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{r.nombre}</div>
                                                {esCritico && <small className="text-danger fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>¡Reponer Urgente!</small>}
                                            </td>
                                            
                                            {/* --- COLUMNA 1: Configuración de Mínimo Crítico --- */}
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <Settings2 size={14} className="text-muted me-2"/>
                                                    <input 
                                                        type="number" 
                                                        className="form-control form-control-sm text-center shadow-none" 
                                                        style={{ width: '60px', backgroundColor: '#f8f9fa' }}
                                                        value={r.minimoCritico}
                                                        onChange={(e) => cambiarMinimo(r.id, parseInt(e.target.value) || 0)}
                                                        disabled={isTestUser}
                                                    />
                                                </div>
                                            </td>

                                            {/* --- COLUMNA 2: Visualización de Stock Actual --- */}
                                            <td className="text-center">
                                                <span className={`badge rounded-pill fs-6 px-3 ${esCritico ? 'bg-danger animate-pulse' : 'bg-success'}`}>
                                                    {r.cantidad} uds.
                                                </span>
                                            </td>

                                            <td className="text-end pe-4">
                                                <div className="btn-group shadow-sm">
                                                    <button onClick={() => ajustarCantidad(r.id, r.cantidad, -1)} className="btn btn-white border" disabled={isTestUser || r.cantidad === 0}>
                                                        <Minus size={14} className="text-danger"/>
                                                    </button>
                                                    <button onClick={() => ajustarCantidad(r.id, r.cantidad, 1)} className="btn btn-white border" disabled={isTestUser}>
                                                        <Plus size={14} className="text-success"/>
                                                    </button>
                                                </div>
                                                {!isTestUser && (
                                                    <button onClick={() => eliminarReactivo(r.id)} className="btn btn-link text-muted ms-2 p-0">
                                                        <Trash2 size={18}/>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-5">
                                        <div className="text-muted">
                                            <Search size={40} className="mb-3 opacity-25"/>
                                            <p className="mb-0">No se encontraron resultados.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
                .transition-all { transition: all 0.3s ease; }
                .btn-white { background: white; border: 1px solid #dee2e6; }
                .btn-white:hover:not(:disabled) { background: #f8f9fa; }
            `}</style>
        </div>
    );
};

export default Stock;