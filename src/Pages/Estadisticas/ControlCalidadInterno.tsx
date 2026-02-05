
// Pages/Estadisticas/ControlCalidadInterno.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../Credenciales';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, where, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../Context/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { ShieldCheck, Plus, Layers, Tag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Lote {
  id: string;
  nombre: string;
  prueba: string;
  media: number;
  sd: number;
  activo: boolean;
}

interface PuntoControl {
  id: string;
  loteId: string;
  valor: number;
  fecha: any;
  usuario: string;
}

const ControlCalidadInterno = () => {
  const { user } = useAuth();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [puntos, setPuntos] = useState<PuntoControl[]>([]);
  const [loteSeleccionado, setLoteSeleccionado] = useState<Lote | null>(null);
  
  const [showModalLote, setShowModalLote] = useState(false);
  const [nuevoValor, setNuevoValor] = useState('');

  // 1. Escuchar Lotes disponibles
  useEffect(() => {
    const q = query(collection(db, 'lotes_control'), orderBy('activo', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lote));
      setLotes(docs);
      if (docs.length > 0 && !loteSeleccionado) setLoteSeleccionado(docs[0]);
    });
    return () => unsub();
  }, []);

  // 2. Escuchar Puntos del lote seleccionado
  useEffect(() => {
    if (!loteSeleccionado) return;
    const q = query(
      collection(db, 'control_calidad'), 
      where('loteId', '==', loteSeleccionado.id),
      orderBy('fecha', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setPuntos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PuntoControl)));
    });
    return () => unsub();
  }, [loteSeleccionado]);

  // --- FUNCIÓN PARA ELIMINAR PUNTO ---
  const handleEliminarPunto = async (id: string) => {
    if (!window.confirm("¿Eliminar este resultado de control? Esto afectará la gráfica de Levey-Jennings.")) return;
    try {
      await deleteDoc(doc(db, 'control_calidad', id));
      toast.success("Punto eliminado");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleCrearLote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await addDoc(collection(db, 'lotes_control'), {
        nombre: formData.get('nombre'),
        prueba: formData.get('prueba'),
        media: parseFloat(formData.get('media') as string),
        sd: parseFloat(formData.get('sd') as string),
        activo: true,
        fechaCreacion: Timestamp.now()
      });
      toast.success("Nuevo lote configurado");
      setShowModalLote(false);
    } catch (error) {
      toast.error("Error al crear lote");
    }
  };

  const handleGuardarPunto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loteSeleccionado) return toast.error("Selecciona un lote primero");

    try {
      await addDoc(collection(db, 'control_calidad'), {
        loteId: loteSeleccionado.id,
        valor: parseFloat(nuevoValor),
        fecha: Timestamp.now(),
        usuario: user?.email || "Usuario"
      });
      toast.success("Valor registrado");
      setNuevoValor('');
    } catch (error) {
      toast.error("Error al guardar punto");
    }
  };

  const datosGrafica = useMemo(() => {
    return puntos.map(p => ({
      id: p.id,
      fecha: p.fecha?.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
      valor: p.valor,
      usuario: p.usuario
    }));
  }, [puntos]);

  const estadoControl = useMemo(() => {
    if (puntos.length === 0 || !loteSeleccionado) return { msg: 'Sin datos', color: 'text-muted', bg: 'bg-light' };
    const ultimo = puntos[puntos.length - 1].valor;
    const diff = Math.abs(ultimo - loteSeleccionado.media);
    if (diff > loteSeleccionado.sd * 3) return { msg: 'FUERA DE CONTROL (3SD)', color: 'text-danger', bg: 'bg-danger-subtle' };
    if (diff > loteSeleccionado.sd * 2) return { msg: 'ADVERTENCIA (2SD)', color: 'text-warning', bg: 'bg-warning-subtle' };
    return { msg: 'DENTRO DE CONTROL', color: 'text-success', bg: 'bg-success-subtle' };
  }, [puntos, loteSeleccionado]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold d-flex align-items-center mb-0">
          <ShieldCheck className="me-2 text-primary" size={32} />
          Control de Calidad Interno
        </h2>
        <button onClick={() => setShowModalLote(true)} className="btn btn-outline-primary rounded-pill px-4 shadow-sm">
          <Layers size={18} className="me-2" /> Gestionar Lotes
        </button>
      </div>

      <div className="row g-4">
        {/* PANEL LATERAL */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <label className="small fw-bold text-muted mb-2 text-uppercase">Lote Activo</label>
              <select 
                className="form-select border-0 bg-light py-2 mb-4 shadow-none"
                value={loteSeleccionado?.id}
                onChange={(e) => setLoteSeleccionado(lotes.find(l => l.id === e.target.value) || null)}
              >
                {lotes.map(l => (
                  <option key={l.id} value={l.id}>{l.prueba} - {l.nombre}</option>
                ))}
              </select>

              {loteSeleccionado && (
                <div className="p-3 bg-light rounded-3 mb-4">
                  <div className="small text-muted mb-2 fw-bold">CONFIGURACIÓN:</div>
                  <div className="d-flex justify-content-between small">
                    <span>Media: <strong>{loteSeleccionado.media}</strong></span>
                    <span>SD: <strong>{loteSeleccionado.sd}</strong></span>
                  </div>
                </div>
              )}

              <form onSubmit={handleGuardarPunto}>
                <label className="small fw-bold mb-2 text-uppercase">Registrar Resultado</label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                  <input type="number" step="0.01" className="form-control border-0 bg-light" placeholder="0.00" 
                    value={nuevoValor} onChange={e => setNuevoValor(e.target.value)} required />
                  <button className="btn btn-primary border-0"><Plus size={18} /></button>
                </div>
              </form>
            </div>
          </div>

          <div className={`card border-0 shadow-sm rounded-4 p-4 text-center ${estadoControl.bg} ${estadoControl.color}`}>
            <h6 className="fw-bold mb-1 small">ESTADO ACTUAL</h6>
            <span className="fw-bold small">{estadoControl.msg}</span>
          </div>
        </div>

        {/* GRÁFICA */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Gráfica Levey-Jennings</h5>
              {loteSeleccionado && <span className="badge bg-primary rounded-pill px-3"><Tag size={12} className="me-1"/> {loteSeleccionado.nombre}</span>}
            </div>

            <div style={{ width: '100%', height: 400, minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosGrafica} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="fecha" tick={{fontSize: 12}} />
                  <YAxis 
                    tick={{fontSize: 12}}
                    domain={loteSeleccionado ? [
                      Number((loteSeleccionado.media - (loteSeleccionado.sd * 4)).toFixed(2)), 
                      Number((loteSeleccionado.media + (loteSeleccionado.sd * 4)).toFixed(2))
                    ] : ['auto', 'auto']} 
                  />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  
                  {loteSeleccionado && (
                    <>
                      <ReferenceLine y={loteSeleccionado.media} stroke="#212529" strokeWidth={2} label={{position: 'right', value: 'Media', fontSize: 11, fill: '#212529'}} />
                      <ReferenceLine y={loteSeleccionado.media + (loteSeleccionado.sd * 2)} stroke="#fd7e14" strokeDasharray="5 5" label={{position: 'right', value: '+2SD', fontSize: 10, fill: '#fd7e14'}} />
                      <ReferenceLine y={loteSeleccionado.media - (loteSeleccionado.sd * 2)} stroke="#fd7e14" strokeDasharray="5 5" label={{position: 'right', value: '-2SD', fontSize: 10, fill: '#fd7e14'}} />
                      <ReferenceLine y={loteSeleccionado.media + (loteSeleccionado.sd * 3)} stroke="#dc3545" label={{position: 'right', value: '+3SD', fontSize: 10, fill: '#dc3545'}} />
                      <ReferenceLine y={loteSeleccionado.media - (loteSeleccionado.sd * 3)} stroke="#dc3545" label={{position: 'right', value: '-3SD', fontSize: 10, fill: '#dc3545'}} />
                    </>
                  )}

                  <Line type="monotone" dataKey="valor" stroke="#0d6efd" strokeWidth={3} dot={{ r: 5, fill: '#0d6efd', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} animationDuration={500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLA DE GESTIÓN DE PUNTOS */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0 small fw-bold text-muted">FECHA</th>
                      <th className="py-3 border-0 small fw-bold text-muted">VALOR</th>
                      <th className="py-3 border-0 small fw-bold text-muted">USUARIO</th>
                      <th className="px-4 py-3 border-0 small fw-bold text-muted text-end">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosGrafica.slice().reverse().map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 small">{p.fecha}</td>
                        <td className="fw-bold text-primary">{p.valor}</td>
                        <td className="small text-muted">{p.usuario?.split('@')[0]}</td>
                        <td className="px-4 text-end">
                          <button onClick={() => handleEliminarPunto(p.id)} className="btn btn-link text-danger p-0 border-0 shadow-none">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {datosGrafica.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted small">No hay resultados registrados para este lote.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL NUEVO LOTE */}
      {showModalLote && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <form onSubmit={handleCrearLote}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="fw-bold">Configurar Lote de Control</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModalLote(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="small fw-bold">Nombre/ID del Lote</label>
                    <input name="nombre" placeholder="Ej: BIORAD-2026-A" className="form-control bg-light border-0 shadow-none" required />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold">Prueba / Analito</label>
                    <input name="prueba" placeholder="Ej: Glucemia" className="form-control bg-light border-0 shadow-none" required />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="small fw-bold">Media de Inserto</label>
                      <input name="media" type="number" step="0.0001" className="form-control bg-light border-0 shadow-none" required />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="small fw-bold">SD de Inserto</label>
                      <input name="sd" type="number" step="0.0001" className="form-control bg-light border-0 shadow-none" required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold">Crear Lote</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlCalidadInterno;