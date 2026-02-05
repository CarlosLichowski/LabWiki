// Pages/Estadisticas/Estadisticas.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../Credenciales';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../Context/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { Activity, Plus, TrendingUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Registro {
  id: string;
  prueba: string;
  valor: number;
  fecha: any;
  usuario: string;
}

const Estadisticas = () => {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState<string>('Glucemia');
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    prueba: 'Glucemia',
    valor: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const q = query(collection(db, 'estadisticas_laboratorio'), orderBy('fecha', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registro));
      setRegistros(docs);
    });
    return () => unsub();
  }, []);

  const listaPruebas = useMemo(() => {
    const defaultPruebas = ['Glucemia', 'Urea', 'Creatinina', 'Ionograma'];
    const cargadas = Array.from(new Set(registros.map(r => r.prueba)));
    return Array.from(new Set([...defaultPruebas, ...cargadas])).sort();
  }, [registros]);

  const datosGrafica = useMemo(() => {
    return registros
      .filter(r => r.prueba === pruebaSeleccionada)
      .map(r => ({
        id: r.id, // Guardamos el ID para referencia
        fecha: r.fecha?.toDate().toLocaleDateString(),
        valor: r.valor,
        usuario: r.usuario
      }));
  }, [registros, pruebaSeleccionada]);

  const valorMedioStr = useMemo(() => {
    if (datosGrafica.length === 0) return "0.00";
    const suma = datosGrafica.reduce((acc, curr) => acc + curr.valor, 0);
    return (suma / datosGrafica.length).toFixed(2);
  }, [datosGrafica]);

  // --- FUNCIÓN PARA ELIMINAR ---
  const handleEliminar = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.")) return;
    
    try {
      await deleteDoc(doc(db, 'estadisticas_laboratorio', id));
      toast.success("Registro eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el registro");
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor) return toast.error("Ingresa un valor numérico");

    try {
      await addDoc(collection(db, 'estadisticas_laboratorio'), {
        prueba: formData.prueba,
        valor: parseFloat(formData.valor),
        fecha: Timestamp.fromDate(new Date(formData.fecha)),
        usuario: user?.displayName || user?.email || "Usuario",
        userId: user?.uid
      });
      toast.success("Resultado guardado");
      setFormData({ ...formData, valor: '' });
      setShowModal(false);
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  return (
    <div className="container-fluid py-4 px-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="bg-success text-white p-3 rounded-3 me-3 shadow-sm">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="fw-bold mb-0">Control Estadístico</h2>
            <p className="text-muted mb-0">Seguimiento de parámetros de laboratorio</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-success rounded-pill px-4 shadow-sm d-flex align-items-center">
          <Plus size={18} className="me-2" /> Nueva Carga
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <label className="form-label fw-bold text-muted small mb-3 text-uppercase">Seleccionar Parámetro</label>
              <select 
                className="form-select border-0 bg-light mb-4 py-2 shadow-none"
                value={pruebaSeleccionada}
                onChange={(e) => setPruebaSeleccionada(e.target.value)}
              >
                {listaPruebas.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <div className="p-3 bg-success-subtle rounded-4 text-center">
                <p className="text-success small fw-bold mb-1">VALOR MEDIO ACTUAL</p>
                <h1 className="display-4 fw-bold text-success mb-0">{valorMedioStr}</h1>
                <p className="text-success small mb-0">basado en {datosGrafica.length} registros</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                <Activity size={20} className="me-2 text-success" />
                Evolución de {pruebaSeleccionada}
              </h5>
              <div style={{ width: '100%', height: 350, minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosGrafica}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="fecha" tick={{fontSize: 11}} />
                    <YAxis tick={{fontSize: 11}} />
                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" />
                    {datosGrafica.length > 0 && (
                      <ReferenceLine y={parseFloat(valorMedioStr)} label={{ position: 'right', value: 'Media', fill: 'red', fontSize: 12 }} stroke="red" strokeDasharray="3 3" />
                    )}
                    <Line type="monotone" dataKey="valor" name={pruebaSeleccionada} stroke="#198754" strokeWidth={3} dot={{ r: 4, fill: '#198754', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABLA DE REGISTROS PARA ELIMINAR --- */}
        <div className="col-12 mt-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Registros recientes de {pruebaSeleccionada}</h6>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 small text-muted">FECHA</th>
                      <th className="border-0 small text-muted text-center">VALOR</th>
                      <th className="border-0 small text-muted text-center">USUARIO</th>
                      <th className="border-0 small text-muted text-end">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosGrafica.slice().reverse().map((item) => (
                      <tr key={item.id}>
                        <td>{item.fecha}</td>
                        <td className="text-center fw-bold">{item.valor}</td>
                        <td className="text-center small text-muted">{item.usuario}</td>
                        <td className="text-end">
                          <button 
                            onClick={() => handleEliminar(item.id)}
                            className="btn btn-outline-danger btn-sm border-0 rounded-circle p-2 shadow-sm"
                            title="Eliminar punto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {datosGrafica.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted small">No hay registros para este parámetro</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CARGA (Sin cambios) */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold mb-0">Cargar Resultado</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleGuardar}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Prueba</label>
                    <div className="input-group">
                      <select className="form-select bg-light border-0 shadow-none" 
                        value={formData.prueba} 
                        onChange={e => setFormData({...formData, prueba: e.target.value})}>
                        {listaPruebas.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button 
                        type="button" 
                        className="btn btn-outline-success"
                        onClick={() => {
                          const p = prompt("Nombre de la nueva prueba:");
                          if (p) {
                            const pUpper = p.charAt(0).toUpperCase() + p.slice(1);
                            setFormData({...formData, prueba: pUpper});
                          }
                        }}
                      >
                        + Nueva
                      </button>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">Valor Numérico</label>
                      <input type="number" step="0.01" required className="form-control bg-light border-0 shadow-none" 
                        value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">Fecha</label>
                      <input type="date" required className="form-control bg-light border-0 shadow-none" 
                        value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="submit" className="btn btn-success w-100 rounded-pill py-2 fw-bold shadow-sm">Guardar Resultado</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estadisticas;