// Pages/Estadisticas/Estadisticas.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../Credenciales';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  Timestamp, deleteDoc, doc, updateDoc 
} from 'firebase/firestore';
import { useAuth } from '../../Context/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { 
   Plus, TrendingUp, Trash2, 
  Calculator, EyeOff, MessageSquare, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Registro {
  id: string;
  prueba: string;
  valor: number;
  fecha: any;
  usuario: string;
  excluido?: boolean;
  comentario?: string;
}

const Estadisticas = () => {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState<string>('Glucemia');
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    prueba: 'Glucemia',
    valor: '',
    fecha: new Date().toISOString().split('T')[0],
    comentario: ''
  });

  // 1. ESCUCHA DE DATOS EN TIEMPO REAL
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

  const datosFiltrados = useMemo(() => {
    return registros.filter(r => r.prueba === pruebaSeleccionada);
  }, [registros, pruebaSeleccionada]);

  // 2. CÁLCULOS ESTADÍSTICOS (Solo toma puntos NO excluidos)
  const stats = useMemo(() => {
    const puntosValidos = datosFiltrados.filter(r => !r.excluido);
    
    if (puntosValidos.length === 0) return { media: 0, sd: 0, max: 0, min: 0, cv: 0, n: 0 };

    const valores = puntosValidos.map(r => r.valor);
    const n = valores.length;
    const media = valores.reduce((a, b) => a + b, 0) / n;
    const varianza = n > 1 ? valores.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (n - 1) : 0;
    const sd = Math.sqrt(varianza);

    return {
      media: parseFloat(media.toFixed(2)),
      sd: parseFloat(sd.toFixed(3)),
      max: parseFloat((media + (sd * 2)).toFixed(2)),
      min: parseFloat((media - (sd * 2)).toFixed(2)),
      cv: parseFloat((media !== 0 ? (sd / media) * 100 : 0).toFixed(2)),
      n
    };
  }, [datosFiltrados]);

  // 3. PREPARACIÓN DE DATOS PARA LA GRÁFICA (Separación de Series)
  const datosGrafica = useMemo(() => {
    return datosFiltrados.map(r => ({
      id: r.id,
      fecha: r.fecha?.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
      valorLinea: !r.excluido ? r.valor : null, // Serie continua
      valorExcluido: r.excluido ? r.valor : null, // Serie de puntos sueltos
      excluido: r.excluido || false,
      comentario: r.comentario || "",
      valorReal: r.valor,
      usuario: r.usuario
    }));
  }, [datosFiltrados]);

  // 4. FUNCIONES DE ACCIÓN
  const toggleExcluir = async (id: string, estadoActual: boolean) => {
    try {
      await updateDoc(doc(db, 'estadisticas_laboratorio', id), {
        excluido: !estadoActual
      });
      toast.success(estadoActual ? "Punto reintegrado" : "Punto excluido del cálculo");
    } catch (e) { toast.error("Error al actualizar"); }
  };

  const handleEliminar = async (id: string) => {
    if (!window.confirm("¿Eliminar definitivamente este registro?")) return;
    try {
      await deleteDoc(doc(db, 'estadisticas_laboratorio', id));
      toast.success("Registro eliminado");
    } catch (e) { toast.error("Error al eliminar"); }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor) return toast.error("Ingrese un valor válido");

    try {
      await addDoc(collection(db, 'estadisticas_laboratorio'), {
        prueba: formData.prueba,
        valor: parseFloat(formData.valor),
        fecha: Timestamp.fromDate(new Date(formData.fecha + "T12:00:00")),
        comentario: formData.comentario,
        usuario: user?.displayName || user?.email || "Usuario",
        excluido: false
      });
      setShowModal(false);
      setFormData({ ...formData, valor: '', comentario: '' });
      toast.success("Resultado cargado con éxito");
    } catch (e) { toast.error("Error al guardar"); }
  };

  return (
    <div className="container-fluid py-4 px-3 text-dark bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white p-3 rounded-4 me-3 shadow-sm">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="fw-bold mb-0">Gestión de Calidad Interna</h2>
            <p className="text-muted mb-0 small text-uppercase fw-bold">Análisis Levey-Jennings & Westgard</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary rounded-pill px-4 shadow-sm fw-bold">
          <Plus size={18} className="me-2" /> Cargar Control Diario
        </button>
      </div>

      <div className="row g-4">
        {/* PANEL DE ESTADÍSTICAS */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
              <label className="form-label fw-bold text-muted small text-uppercase">Parámetro</label>
              <select className="form-select border-0 bg-light mb-4 py-2 shadow-none fw-bold"
                value={pruebaSeleccionada} onChange={(e) => setPruebaSeleccionada(e.target.value)}>
                {listaPruebas.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <div className="p-3 bg-white border rounded-4 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted">Media Real (X):</span>
                  <span className="fw-bold text-success">{stats.media}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted">Desvío (SD):</span>
                  <span className="fw-bold">{stats.sd}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small text-muted">CV %:</span>
                  <span className="fw-bold text-primary">{stats.cv}%</span>
                </div>
              </div>

              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="p-2 bg-danger-subtle rounded-3">
                    <small className="text-danger d-block fw-bold">+2SD</small>
                    <span className="fw-bold">{stats.max}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 bg-danger-subtle rounded-3">
                    <small className="text-danger d-block fw-bold">-2SD</small>
                    <span className="fw-bold">{stats.min}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 bg-white">
            <div className="card-body p-3 d-flex align-items-center">
              <div className="bg-light p-2 rounded-3 me-3"><Calculator size={20} /></div>
              <div>
                <small className="text-muted d-block">Muestras (n)</small>
                <h5 className="fw-bold mb-0">{stats.n} registros válidos</h5>
              </div>
            </div>
          </div>
        </div>

        {/* GRÁFICA PROFESIONAL */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
               <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosGrafica} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{fontSize: 11}} />
                    <YAxis 
                      tick={{fontSize: 11}} 
                      domain={[
                        (dataMin: number) => Math.min(dataMin, stats.min - stats.sd), 
                        (dataMax: number) => Math.max(dataMax, stats.max + stats.sd)
                      ]} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border-0 shadow-lg rounded-4">
                              <p className="fw-bold mb-1 text-primary">{data.fecha}</p>
                              <p className="h4 fw-bold mb-1">{data.valorReal}</p>
                              {data.excluido && <span className="badge bg-secondary mb-2">Excluido de Estadística</span>}
                              {data.comentario && (
                                <div className="mt-2 p-2 bg-light rounded-3 small">
                                  <MessageSquare size={12} className="me-1" /> {data.comentario}
                                </div>
                              )}
                              <p className="text-muted mb-0 mt-2 small">Op: {data.usuario}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    
                    {stats.n > 0 && (
                      <>
                        <ReferenceLine y={stats.media} stroke="#198754" strokeWidth={2} label={{value: 'MEDIA', position: 'right', fill: '#198754', fontSize: 10}} />
                        <ReferenceLine y={stats.max} stroke="#dc3545" strokeDasharray="5 5" label={{value: '+2SD', position: 'right', fill: '#dc3545', fontSize: 10}} />
                        <ReferenceLine y={stats.min} stroke="#dc3545" strokeDasharray="5 5" label={{value: '-2SD', position: 'right', fill: '#dc3545', fontSize: 10}} />
                      </>
                    )}

                    {/* LÍNEA DE TENDENCIA (Se corta si hay exclusión) */}
                    <Line 
                      type="monotone" 
                      dataKey="valorLinea" 
                      name="Valor de Control" 
                      stroke="#0d6efd" 
                      strokeWidth={3}
                      connectNulls={false}
                      dot={{ r: 5, fill: '#0d6efd', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />

                    {/* PUNTOS EXCLUIDOS (Aparecen sueltos) */}
                    <Line 
                      type="monotone" 
                      dataKey="valorExcluido" 
                      name="Excluido / Outlier" 
                      stroke="transparent"
                      dot={{ r: 6, fill: '#6c757d', stroke: '#fff', strokeWidth: 2 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE REGISTROS */}
        <div className="col-12 mt-2">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-white border-bottom">
                  <tr>
                    <th className="px-4 py-3 small text-muted text-uppercase">Fecha</th>
                    <th className="py-3 small text-muted text-uppercase text-center">Resultado</th>
                    <th className="py-3 small text-muted text-uppercase">Comentarios / Acción Correctiva</th>
                    <th className="py-3 small text-muted text-uppercase text-center">Estado de Control</th>
                    <th className="px-4 py-3 small text-muted text-uppercase text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {datosGrafica.slice().reverse().map((item) => {
                    const fueraDeRango = item.valorReal > stats.max || item.valorReal < stats.min;
                    return (
                      <tr key={item.id} className={item.excluido ? "bg-light opacity-75" : ""}>
                        <td className="px-4 fw-bold">{item.fecha}</td>
                        <td className="text-center">
                          <span className={`h6 mb-0 fw-bold ${fueraDeRango && !item.excluido ? 'text-danger' : ''}`}>
                            {item.valorReal}
                          </span>
                        </td>
                        <td>
                          {item.comentario ? 
                            <span className="small text-dark"><MessageSquare size={14} className="me-2 text-muted"/>{item.comentario}</span> : 
                            <span className="text-muted small fst-italic">Sin observaciones</span>
                          }
                        </td>
                        <td className="text-center">
                          {item.excluido ? 
                            <span className="badge bg-secondary-subtle text-secondary border px-3">OBVIADO</span> : 
                            (fueraDeRango ? 
                              <span className="badge bg-danger-subtle text-danger border px-3"><AlertCircle size={12} className="me-1"/> FUERA 2SD</span> : 
                              <span className="badge bg-success-subtle text-success border px-3">DENTRO</span>
                            )
                          }
                        </td>
                        <td className="px-4 text-end">
                          <button 
                            onClick={() => toggleExcluir(item.id, item.excluido)} 
                            className={`btn btn-sm border-0 me-2 ${item.excluido ? 'text-primary' : 'text-warning'}`}
                            title={item.excluido ? "Reintegrar" : "Excluir de estadística"}
                          >
                            <EyeOff size={18} />
                          </button>
                          <button onClick={() => handleEliminar(item.id)} className="btn btn-sm text-danger border-0">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CARGA */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 p-4">
                <h5 className="fw-bold mb-0">Nuevo Control: {pruebaSeleccionada}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleGuardar}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">ANALITO</label>
                      <select className="form-select bg-light border-0 py-2 shadow-none fw-bold" value={formData.prueba} onChange={e => setFormData({...formData, prueba: e.target.value})}>
                        {listaPruebas.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">RESULTADO</label>
                      <input type="number" step="0.0001" required className="form-control bg-light border-0 py-2 shadow-none fw-bold" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} placeholder="0.00" />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">FECHA</label>
                      <input type="date" className="form-control bg-light border-0 py-2 shadow-none" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">COMENTARIO / OBSERVACIONES</label>
                      <textarea className="form-control bg-light border-0 py-2 shadow-none" rows={3} placeholder="Opcional: Indique si hubo cambio de reactivo, mantenimiento, etc." value={formData.comentario} onChange={e => setFormData({...formData, comentario: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="submit" className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow">Guardar Resultado</button>
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