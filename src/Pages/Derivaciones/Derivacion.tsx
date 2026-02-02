// src/Pages/Derivaciones/Derivaciones.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../Credenciales';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { 
  Search, MapPin, Beaker, Clock, Plus, Edit2, 
  Trash2, Save, Phone 
} from 'lucide-react';

interface PruebaDerivada {
  id: string;
  nombre: string;
  hospital: string;
  condiciones: string;
  tiempoEntrega: string;
  categoria: string;
  telefono: string; // <-- Nuevo campo
}

const Derivaciones = () => {
  const [pruebas, setPruebas] = useState<PruebaDerivada[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', hospital: '', condiciones: '', tiempoEntrega: '', categoria: 'Rutina', telefono: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'derivaciones'), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PruebaDerivada));
      setPruebas(lista);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await updateDoc(doc(db, 'derivaciones', editandoId), formData);
      } else {
        await addDoc(collection(db, 'derivaciones'), formData);
      }
      cerrarModal();
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta prueba?")) {
      await deleteDoc(doc(db, 'derivaciones', id));
    }
  };

  const abrirModal = (prueba?: PruebaDerivada) => {
    if (prueba) {
      setEditandoId(prueba.id);
      setFormData({ ...prueba });
    } else {
      setEditandoId(null);
      setFormData({ nombre: '', hospital: '', condiciones: '', tiempoEntrega: '', categoria: 'Rutina', telefono: '' });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditandoId(null);
  };

  const pruebasFiltradas = pruebas.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.hospital.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container-fluid position-relative">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white p-2 rounded-3 me-3">
            <Beaker size={24} />
          </div>
          <div>
            <h3 className="fw-bold mb-0">Gestión de Derivaciones</h3>
            <p className="text-muted mb-0 small">Control de centros de referencia y contactos</p>
          </div>
        </div>
        <button onClick={() => abrirModal()} className="btn btn-success d-flex align-items-center rounded-pill px-4 shadow-sm">
          <Plus size={18} className="me-2" /> Agregar Prueba
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-2">
          <div className="input-group border-0">
            <span className="input-group-text bg-white border-0"><Search size={18} className="text-muted" /></span>
            <input 
              type="text" className="form-control border-0 shadow-none" 
              placeholder="Buscar prueba, hospital o categoría..." 
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Análisis</th>
              <th>Destino y Contacto</th>
              <th>Condiciones</th>
              <th>Demora</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-5">Cargando base de datos...</td></tr>
            ) : pruebasFiltradas.length > 0 ? (
              pruebasFiltradas.map((prueba) => (
                <tr key={prueba.id}>
                  <td>
                    <div className="fw-bold text-dark">{prueba.nombre}</div>
                    <span className="badge bg-info-subtle text-info fw-semibold" style={{ fontSize: '0.7rem' }}>{prueba.categoria}</span>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="d-flex align-items-center text-dark fw-medium">
                        <MapPin size={14} className="text-danger me-1" /> {prueba.hospital}
                      </span>
                      {prueba.telefono && (
                        <a href={`tel:${prueba.telefono}`} className="text-decoration-none small d-flex align-items-center text-primary mt-1">
                          <Phone size={12} className="me-1" /> {prueba.telefono}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="text-wrap" style={{ maxWidth: '200px' }}>
                    <small className="text-muted">{prueba.condiciones}</small>
                  </td>
                  <td>
                    <div className="d-flex align-items-center small fw-medium">
                      <Clock size={14} className="me-1 text-secondary" /> {prueba.tiempoEntrega}
                    </div>
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end">
                      <button onClick={() => abrirModal(prueba)} className="btn btn-sm btn-light text-primary me-1 rounded-circle">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleEliminar(prueba.id)} className="btn btn-sm btn-light text-danger rounded-circle">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="text-center py-4 text-muted">No hay registros coincidentes</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-white border-bottom-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark">{editandoId ? 'Actualizar Información' : 'Nueva Derivación'}</h5>
                <button type="button" className="btn-close" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>Nombre del Análisis</label>
                    <input type="text" required className="form-control form-control-lg bg-light border-0" placeholder="Ej: Carga Viral..." value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>Hospital / Laboratorio</label>
                      <input type="text" required className="form-control bg-light border-0" placeholder="Centro receptor" value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>Teléfono Contacto</label>
                      <input type="text" className="form-control bg-light border-0" placeholder="Ej: 011 4XXX-XXXX" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>Categoría</label>
                      <select className="form-select bg-light border-0" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                        <option>Rutina</option>
                        <option>Alta Complejidad</option>
                        <option>Genética</option>
                        <option>Inmunología</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>Tiempo de Respuesta</label>
                      <input type="text" className="form-control bg-light border-0" placeholder="Ej: 72 hs" value={formData.tiempoEntrega} onChange={e => setFormData({...formData, tiempoEntrega: e.target.value})} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-muted" style={{ fontSize: '0.65rem' }}>Condiciones Pre-analíticas</label>
                    <textarea className="form-control bg-light border-0" rows={3} placeholder="Detalles de la muestra, temperatura, etc." value={formData.condiciones} onChange={e => setFormData({...formData, condiciones: e.target.value})}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pb-4 px-4">
                  <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={cerrarModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 shadow-sm">
                    <Save size={18} className="me-2"/> Finalizar
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

export default Derivaciones;