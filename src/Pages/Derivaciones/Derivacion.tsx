
// src/Pages/Derivaciones/Derivaciones.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../Credenciales';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { 
  Search, MapPin, Beaker, Clock, Plus, Edit2, 
  Trash2, Save, Phone 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PruebaDerivada {
  id: string;
  nombre: string;
  hospital: string;
  condiciones: string;
  tiempoEntrega: string;
  categoria: string;
  telefono: string;
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
    const loader = toast.loading('Guardando...');
    try {
      if (editandoId) {
        await updateDoc(doc(db, 'derivaciones', editandoId), formData);
        toast.success('Actualizado', { id: loader });
      } else {
        await addDoc(collection(db, 'derivaciones'), formData);
        toast.success('Agregado', { id: loader });
      }
      cerrarModal();
    } catch (error) {
      toast.error('Error al guardar', { id: loader });
    }
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Eliminar esta prueba?")) {
      try {
        await deleteDoc(doc(db, 'derivaciones', id));
        toast.success('Eliminado');
      } catch (error) {
        toast.error('Error al eliminar');
      }
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
    p.hospital.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container-fluid py-2 py-md-3 px-2 px-md-4">
      {/* HEADER OPTIMIZADO */}
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 gap-2">
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white p-2 rounded-3 me-2">
            <Beaker size={20} />
          </div>
          <div>
            <h3 className="fw-bold mb-0 h5 h4-md">Derivaciones</h3>
            <p className="text-muted mb-0 d-none d-sm-block" style={{ fontSize: '0.75rem' }}>Centros de referencia y contactos</p>
          </div>
        </div>
        <button 
          onClick={() => abrirModal()} 
          className="btn btn-success d-flex align-items-center rounded-pill px-3 py-2 shadow-sm border-0"
          style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={18} className="me-1" /> 
          <span className="d-none d-sm-inline">Agregar Prueba</span>
          <span className="d-inline d-sm-none">Agregar</span>
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="card shadow-sm border-0 mb-3 rounded-3">
        <div className="card-body p-1 p-md-2">
          <div className="input-group border-0">
            <span className="input-group-text bg-white border-0">
              <Search size={16} className="text-muted" />
            </span>
            <input 
              type="text" className="form-control border-0 shadow-none py-2" 
              style={{ fontSize: '0.9rem' }}
              placeholder="Buscar por nombre, hospital o categoría..." 
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
        </div>
      ) : (
        <>
          {/* TABLA ESCRITORIO */}
          <div className="d-none d-md-block table-responsive bg-white rounded shadow-sm border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 small">Análisis</th>
                  <th className="small">Destino</th>
                  <th className="small">Condiciones</th>
                  <th className="small">Demora</th>
                  <th className="text-end pe-4 small">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pruebasFiltradas.map((prueba) => (
                  <tr key={prueba.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{prueba.nombre}</div>
                      <span className="badge bg-info-subtle text-info" style={{ fontSize: '0.65rem' }}>{prueba.categoria}</span>
                    </td>
                    <td>
                      <div className="small fw-medium text-dark">
                        <MapPin size={12} className="text-danger me-1" /> {prueba.hospital}
                      </div>
                      {prueba.telefono && (
                        <a href={`tel:${prueba.telefono}`} className="text-decoration-none extra-small d-flex align-items-center text-primary mt-1">
                          <Phone size={10} className="me-1" /> {prueba.telefono}
                        </a>
                      )}
                    </td>
                    <td className="text-wrap small text-muted" style={{ maxWidth: '200px' }}>
                      {prueba.condiciones}
                    </td>
                    <td className="small text-secondary">
                      <Clock size={12} className="me-1" /> {prueba.tiempoEntrega}
                    </td>
                    <td className="text-end pe-4">
                      <button onClick={() => abrirModal(prueba)} className="btn btn-sm btn-light text-primary me-1 rounded-circle"><Edit2 size={14} /></button>
                      <button onClick={() => handleEliminar(prueba.id)} className="btn btn-sm btn-light text-danger rounded-circle"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL */}
          <div className="d-md-none">
            {pruebasFiltradas.map((prueba) => (
              <div key={prueba.id} className="card border-0 shadow-sm mb-2 rounded-3 overflow-hidden">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div style={{ maxWidth: '70%' }}>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{prueba.nombre}</h6>
                      <span className="badge bg-primary-subtle text-primary mt-1" style={{fontSize: '0.65rem'}}>{prueba.categoria}</span>
                    </div>
                    <div className="d-flex gap-1">
                      <button onClick={() => abrirModal(prueba)} className="btn btn-light btn-sm text-primary p-2 rounded-3 border">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleEliminar(prueba.id)} className="btn btn-light btn-sm text-danger p-2 rounded-3 border">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex align-items-center text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                      <MapPin size={14} className="text-danger me-2 flex-shrink-0" /> 
                      <span className="text-truncate">{prueba.hospital}</span>
                    </div>
                    {prueba.telefono && (
                      <a href={`tel:${prueba.telefono}`} className="text-decoration-none d-flex align-items-center text-primary fw-medium" style={{ fontSize: '0.85rem' }}>
                        <Phone size={14} className="me-2 flex-shrink-0" /> {prueba.telefono}
                      </a>
                    )}
                  </div>
                  <div className="bg-light p-2 rounded-2 mb-2">
                    <div className="fw-bold text-muted mb-1" style={{fontSize: '0.6rem', textTransform: 'uppercase'}}>Condiciones</div>
                    <p className="mb-0 text-dark" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>{prueba.condiciones}</p>
                  </div>
                  <div className="d-flex align-items-center pt-1 border-top mt-2">
                    <Clock size={12} className="me-1 text-primary" />
                    <span className="fw-bold text-secondary" style={{ fontSize: '0.75rem' }}>Entrega: {prueba.tiempoEntrega}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block p-2" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h6 className="modal-title fw-bold text-dark">{editandoId ? 'Editar Prueba' : 'Nueva Prueba'}</h6>
                <button type="button" className="btn-close shadow-none" onClick={cerrarModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-2 px-3">
                  <div className="mb-2">
                    <label className="form-label extra-small fw-bold text-muted mb-1">ANÁLISIS</label>
                    <input type="text" required className="form-control form-control-sm bg-light border-0 py-2" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div className="row g-2">
                    <div className="col-6 mb-2">
                      <label className="form-label extra-small fw-bold text-muted mb-1">DESTINO</label>
                      <input type="text" required className="form-control form-control-sm bg-light border-0 py-2" value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label extra-small fw-bold text-muted mb-1">TELÉFONO</label>
                      <input type="text" className="form-control form-control-sm bg-light border-0 py-2" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-6 mb-2">
                      <label className="form-label extra-small fw-bold text-muted mb-1">CATEGORÍA</label>
                      <select className="form-select form-select-sm bg-light border-0 py-2" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                        <option>Rutina</option>
                        <option>Alta Complejidad</option>
                        <option>Genética</option>
                      </select>
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label extra-small fw-bold text-muted mb-1">DEMORA</label>
                      <input type="text" className="form-control form-control-sm bg-light border-0 py-2" value={formData.tiempoEntrega} onChange={e => setFormData({...formData, tiempoEntrega: e.target.value})} />
                    </div>
                  </div>
                  <div className="mb-0">
                    <label className="form-label extra-small fw-bold text-muted mb-1">CONDICIONES</label>
                    <textarea className="form-control form-control-sm bg-light border-0" rows={2} value={formData.condiciones} onChange={e => setFormData({...formData, condiciones: e.target.value})}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-3 justify-content-center">
                  <button type="submit" className="btn btn-primary rounded-pill px-4 w-100 shadow-sm mx-3 py-2 fw-bold">
                    <Save size={16} className="me-2"/> Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .extra-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default Derivaciones;