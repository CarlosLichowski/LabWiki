// Pages/ProyectosYObjetivos/ProyectosYObjetivos.tsx
import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc 
} from 'firebase/firestore';
import { db } from '../../Credenciales';
import { 
  Plus, Heart, User, Trash2, Lightbulb,
  ArrowLeft, Edit3, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // 🟢 Importamos el hook de autenticación global

interface Proyecto {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  autor: string;
  autorId: string;
  likes: string[]; 
  createdAt: any;
  estado: 'Propuesta' | 'En Marcha' | 'Completado';
}

const ProyectosYObjetivos: React.FC = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = { 
    titulo: '', 
    descripcion: '', 
    categoria: 'Mejora de Procesos',
    estado: 'Propuesta' as 'Propuesta' | 'En Marcha' | 'Completado'
  };
  const [formProy, setFormProy] = useState(initialFormState);
  
  // 🟢 Extraemos 'user' y 'loading' para evitar llamadas asíncronas antes de tiempo
  const { user, loading } = useAuth(); 

  useEffect(() => {
    // Si la autenticación está cargando o no hay usuario activo, evitamos levantar el onSnapshot
    if (loading || !user) return;

    const q = query(collection(db, 'proyectos'), orderBy('createdAt', 'desc'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      setProyectos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Proyecto)));
    }, (error) => {
      // 🟢 Captura el error de permisos de Firebase evitando que rompa la UI de React
      console.error("Firestore interceptado (Permisos insuficientes temporales):", error);
    });

    return () => unsub();
  }, [user, loading]);

  const guardarProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (editingId) {
        const docRef = doc(db, 'proyectos', editingId);
        await updateDoc(docRef, {
          titulo: formProy.titulo,
          descripcion: formProy.descripcion,
          categoria: formProy.categoria,
          estado: formProy.estado
        });
      } else {
        await addDoc(collection(db, 'proyectos'), {
          titulo: formProy.titulo,
          descripcion: formProy.descripcion,
          categoria: formProy.categoria,
          estado: 'Propuesta',
          autor: user.displayName || 'Colega',
          autorId: user.uid,
          likes: [],
          createdAt: serverTimestamp()
        });
      }
      handleCloseModal();
    } catch (err) { 
      console.error("Error al guardar la propuesta: ", err); 
    }
  };

  const handleEdit = (proyecto: Proyecto) => {
    setFormProy({
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
      categoria: proyecto.categoria,
      estado: proyecto.estado
    });
    setEditingId(proyecto.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormProy(initialFormState);
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta propuesta de forma permanente?")) {
      try {
        await deleteDoc(doc(db, 'proyectos', id));
      } catch (err) {
        console.error("Error al eliminar la propuesta: ", err);
      }
    }
  };

  const toggleLike = async (proyectoId: string, yaTieneLike: boolean) => {
    if (!user) return;
    const docRef = doc(db, 'proyectos', proyectoId);
    await updateDoc(docRef, {
      likes: yaTieneLike ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Completado': return 'bg-success text-white';
      case 'En Marcha': return 'bg-warning text-dark';
      default: return 'bg-primary-subtle text-primary';
    }
  };

  // 🟢 Bloqueos preventivos de renderizado (Frenan los errores colaterales de React #310)
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2 small">Cargando entorno de objetivos...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger fw-bold">Acceso no autorizado.</p>
        <p className="text-muted small">Por favor, inicia sesión para ver los proyectos de mejora.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">Proyectos y Objetivos 🚀</h3>
          <p className="text-muted small m-0">Propón mejoras y apoya las ideas de tus colegas.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow" onClick={() => setShowModal(true)}>
          <Plus size={20} className="me-1"/> Nueva Propuesta
        </button>
      </div>

      <div className="row g-3">
        {proyectos.map(p => {
          const yaTieneLike = p.likes?.includes(user.uid || '');
          
          // EVALUACIÓN DE PERMISOS SEGURA: Es autor O pertenece a Laboratorio Central
          const esAutor = user.uid === p.autorId;
          
          // Casteo seguro para que convivan dinámicamente propiedades alternativas si existieran
          const userServicio = (user as any).servicio || (user as any).laboratorio || null;
          const esLaboratorioCentral = userServicio === "Laboratorio Central";
          
          const tienePermisoEdicion = esAutor || esLaboratorioCentral;

          return (
            <div key={p.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden border-top border-4 border-primary">
                <div className="p-3 d-flex flex-column justify-content-between h-100">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className={`badge rounded-pill fw-semibold ${getEstadoBadgeClass(p.estado)}`}>
                        {p.estado}
                      </span>
                      
                      {/* BOTONES ACCESIBLES POR AUTOR O PERSONAL AUTORIZADO */}
                      {tienePermisoEdicion && (
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-light text-secondary rounded-circle p-1 d-flex align-items-center border-0" 
                            onClick={() => handleEdit(p)}
                            title="Editar propuesta"
                          >
                            <Edit3 size={14}/>
                          </button>
                          <button 
                            className="btn btn-sm btn-light text-danger rounded-circle p-1 d-flex align-items-center border-0" 
                            onClick={() => handleEliminar(p.id)}
                            title="Eliminar propuesta"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <h5 className="fw-bold text-dark mb-1">{p.titulo}</h5>
                    <span className="text-muted d-block font-monospace mb-2" style={{ fontSize: '0.75rem' }}>{p.categoria}</span>
                    <p className="text-secondary small" style={{ minHeight: '60px' }}>{p.descripcion}</p>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                    <div className="d-flex align-items-center text-muted small">
                      <div className="bg-light rounded-circle p-1 me-2"><User size={12}/></div>
                      {p.autor}
                    </div>
                    
                    <button 
                      className={`btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 transition-all ${yaTieneLike ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => toggleLike(p.id, yaTieneLike)}
                    >
                      <Heart size={14} fill={yaTieneLike ? "white" : "transparent"}/>
                      {p.likes?.length || 0}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL UNIFICADO */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-2 bg-white">
              <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-1">
                  <Lightbulb className="text-warning" size={20}/>
                  {editingId ? 'Editar Propuesta de Mejora' : 'Nueva Propuesta'}
                </h5>
                <button className="btn-close shadow-none bg-light p-2 rounded-circle border-0 d-flex align-items-center justify-content-center" onClick={handleCloseModal}>
                  <X size={14}/>
                </button>
              </div>
              <form onSubmit={guardarProyecto}>
                <div className="modal-body">
                  <label className="small fw-bold text-muted mb-1">¿Qué quieres mejorar?</label>
                  <input 
                    className="form-control mb-3 shadow-none bg-light border-0 py-2 rounded-3 text-dark" 
                    placeholder="Título breve y conciso" 
                    required 
                    value={formProy.titulo}
                    onChange={e => setFormProy({...formProy, titulo: e.target.value})} 
                  />
                  
                  <div className="row mb-3">
                    <div className={editingId ? "col-md-6" : "col-12"}>
                      <label className="small fw-bold text-muted mb-1">Categoría</label>
                      <select 
                        className="form-select shadow-none bg-light border-0 py-2 rounded-3 text-dark" 
                        value={formProy.categoria}
                        onChange={e => setFormProy({...formProy, categoria: e.target.value})}
                      >
                        <option>Mejora de Procesos</option>
                        <option>Infraestructura</option>
                        <option>Investigación</option>
                        <option>Bienestar Laboral</option>
                      </select>
                    </div>
                    
                    {/* El estado se habilita si se está editando */}
                    {editingId && (
                      <div className="col-md-6">
                        <label className="small fw-bold text-muted mb-1">Estado del Objetivo</label>
                        <select 
                          className="form-select shadow-none bg-light border-0 py-2 rounded-3 text-dark fw-semibold" 
                          value={formProy.estado}
                          onChange={e => setFormProy({...formProy, estado: e.target.value as any})}
                        >
                          <option value="Propuesta">Propuesta</option>
                          <option value="En Marcha">En Marcha</option>
                          <option value="Completado">Completado</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <label className="small fw-bold text-muted mb-1">Detalles de la propuesta</label>
                  <textarea 
                    className="form-control shadow-none bg-light border-0 py-2 rounded-3 text-dark" 
                    rows={4} 
                    placeholder="Describe los alcances e ideas principales de tu propuesta aquí..." 
                    required 
                    value={formProy.descripcion}
                    onChange={e => setFormProy({...formProy, descripcion: e.target.value})}
                  ></textarea>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-none border-0">
                    {editingId ? 'Actualizar Propuesta' : 'Subir Propuesta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-center mt-5">
        <Link 
          to="/" 
          className="btn bg-secondary-subtle text-dark border d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 fw-bold transition-all shadow-sm"
          style={{ textDecoration: 'none' }}
        >
          <ArrowLeft size={16} className="text-success" /> 
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
};

export default ProyectosYObjetivos;