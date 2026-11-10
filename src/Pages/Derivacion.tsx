import React, { useState, useEffect } from 'react';
import { db } from '../Credenciales';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  Search, MapPin, Beaker, Clock, Plus, Edit2, 
  Trash2, Save, Phone, ArrowLeft, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import '../css/Derivaciones.css';

interface PruebaDerivada {
  id: string;
  nombre: string;
  hospital: string;
  condiciones: string;
  tiempoEntrega: string;
  categoria: string;
  telefono: string;
  creadoPor?: string;
}

const Derivaciones = () => {
  const auth = getAuth();
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
        const usuarioActual = auth.currentUser?.displayName || auth.currentUser?.email || 'Sistema';
        const datosConUsuario = { ...formData, creadoPor: usuarioActual };
        await addDoc(collection(db, 'derivaciones'), datosConUsuario);
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
      setFormData({
        nombre: prueba.nombre, hospital: prueba.hospital, condiciones: prueba.condiciones,
        tiempoEntrega: prueba.tiempoEntrega, categoria: prueba.categoria, telefono: prueba.telefono
      });
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
    <div className="derivaciones-container">
      
      {/* HEADER */}
      <header className="derivaciones-header">
        <div className="derivaciones-header__brand">
          <div className="derivaciones-header__icon-box">
            <Beaker size={20} />
          </div>
          <div>
            <h3 className="derivaciones-header__title">Derivaciones</h3>
            <p className="derivaciones-header__subtitle">Centros de referencia y contactos</p>
          </div>
        </div>
        <button onClick={() => abrirModal()} className="btn-add-prueba">
          <Plus size={18} /> 
          <span className="btn-text-desktop">Agregar Prueba</span>
          <span className="btn-text-mobile">Agregar</span>
        </button>
      </header>

      {/* BUSCADOR */}
      <div className="search-card">
        <div className="search-card__wrapper">
          <Search size={16} className="search-card__icon" />
          <input 
            type="text" 
            className="search-card__input" 
            placeholder="Buscar por nombre, hospital o categoría..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <div className="loading-spinner-box">
          <div className="custom-spinner"></div>
        </div>
      ) : (
        <>
          {/* TABLA ESCRITORIO */}
          <div className="desktop-table-view">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Análisis</th>
                  <th>Destino</th>
                  <th>Condiciones</th>
                  <th>Demora</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pruebasFiltradas.map((prueba) => (
                  <tr key={prueba.id}>
                    <td>
                      <div className="table-row-title">{prueba.nombre}</div>
                      <div className="table-badge-group">
                        <span className={`badge-category badge-${prueba.categoria.toLowerCase().replace(/\s+/g, '-')}`}>
                          {prueba.categoria}
                        </span>
                        {prueba.creadoPor && (
                          <span className="user-traceability" title="Agregado por">
                            <User size={10} /> {prueba.creadoPor}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-row-medium">
                        <MapPin size={12} className="icon-map" /> {prueba.hospital}
                      </div>
                      {prueba.telefono && (
                        <a href={`tel:${prueba.telefono}`} className="table-link-phone">
                          <Phone size={10} /> {prueba.telefono}
                        </a>
                      )}
                    </td>
                    <td className="table-cell-wrap">
                      {prueba.condiciones}
                    </td>
                    <td>
                      <span className="table-cell-time">
                        <Clock size={12} /> {prueba.tiempoEntrega}
                      </span>
                    </td>
                    <td className="text-right">
                      <button onClick={() => abrirModal(prueba)} className="action-btn btn-edit"><Edit2 size={14} /></button>
                      <button onClick={() => handleEliminar(prueba.id)} className="action-btn btn-delete"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VISTA MÓVIL (CARDS) */}
          <div className="mobile-cards-view">
            {pruebasFiltradas.map((prueba) => (
              <div key={prueba.id} className="mobile-card">
                <div className="mobile-card__header">
                  <div className="mobile-card__header-info">
                    <h6 className="mobile-card__title">{prueba.nombre}</h6>
                    <div className="mobile-card__badges">
                      <span className="badge-category">{prueba.categoria}</span>
                      {prueba.creadoPor && (
                        <span className="user-traceability">
                          <User size={10} /> {prueba.creadoPor}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mobile-card__actions">
                    <button onClick={() => abrirModal(prueba)} className="action-btn btn-edit"><Edit2 size={14} /></button>
                    <button onClick={() => handleEliminar(prueba.id)} className="action-btn btn-delete"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="mobile-card__body">
                  <div className="mobile-info-row">
                    <MapPin size={14} className="icon-map" /> 
                    <span className="truncate-text">{prueba.hospital}</span>
                  </div>
                  {prueba.telefono && (
                    <a href={`tel:${prueba.telefono}`} className="mobile-info-row phone-link">
                      <Phone size={14} /> {prueba.telefono}
                    </a>
                  )}
                  
                  <div className="mobile-card__conditions">
                    <div className="conditions-title">Condiciones</div>
                    <p className="conditions-text">{prueba.condiciones}</p>
                  </div>

                  <div className="mobile-card__footer">
                    <Clock size={12} />
                    <span>Entrega: {prueba.tiempoEntrega}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL (CSS Puro - Flexbox Overlay) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-wrapper">
            <div className="modal-header-custom">
              <h6 className="modal-title-custom">{editandoId ? 'Editar Prueba' : 'Nueva Prueba'}</h6>
              <button type="button" className="modal-close-btn" onClick={cerrarModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label-custom">ANÁLISIS</label>
                <input type="text" required className="form-control-custom" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label-custom">DESTINO</label>
                  <input type="text" required className="form-control-custom" value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label-custom">TELÉFONO</label>
                  <input type="text" className="form-control-custom" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label-custom">CATEGORÍA</label>
                  <select className="form-select-custom" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                    <option>Rutina</option>
                    <option>Alta Complejidad</option>
                    <option>Genética</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label-custom">DEMORA</label>
                  <input type="text" className="form-control-custom" value={formData.tiempoEntrega} onChange={e => setFormData({...formData, tiempoEntrega: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label-custom">CONDICIONES</label>
                <textarea className="form-control-custom" rows={2} value={formData.condiciones} onChange={e => setFormData({...formData, condiciones: e.target.value})}></textarea>
              </div>

              <button type="submit" className="modal-btn-submit">
                <Save size={16} /> Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER ACCIONES */}
      <div className="footer-actions">
        <Link to="/" className="btn-back-home">
          <ArrowLeft size={16} /> 
          <span>Volver al Inicio</span>
        </Link>
      </div>
      
    </div>
  );
};

export default Derivaciones;