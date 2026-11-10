// Pages/ProyectosYObjetivos/ProyectosYObjetivos.tsx
import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc 
} from 'firebase/firestore';
import { db } from '../Credenciales';
import { 
  Plus, Heart, User, Trash2, Lightbulb,
  ArrowLeft, Edit3, X, Target, ShieldAlert, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import '../css/ProyectosYObjetivos.css';

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
  
  const { user, loading } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;

    const q = query(collection(db, 'proyectos'), orderBy('createdAt', 'desc'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      setProyectos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Proyecto)));
    }, (error) => {
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
          titulo: formProy.titulo.trim(),
          descripcion: formProy.descripcion.trim(),
          categoria: formProy.categoria,
          estado: formProy.estado
        });
      } else {
        await addDoc(collection(db, 'proyectos'), {
          titulo: formProy.titulo.trim(),
          descripcion: formProy.descripcion.trim(),
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

  const handleEliminar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const formatearFecha = (timestamp: any) => {
    if (!timestamp) return 'RECIENTE';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  if (loading) {
    return (
      <div className="proy-loading-container">
        <div className="proy-spinner" role="status"></div>
        <p className="proy-loading-text">Cargando entorno de objetivos...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="proy-restricted-wrapper">
        <div className="proy-restricted-card">
          <ShieldAlert size={48} className="proy-restricted-icon" />
          <h4 className="proy-restricted-title">Acceso no autorizado</h4>
          <p className="proy-restricted-desc">Por favor, inicia sesión para ver los proyectos de mejora.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="proy-portal-wrapper proy-fade-in">
      {/* HERO BANNER PRINCIPAL */}
      <div className="proy-hero-banner">
        <div className="proy-hero-overlay"></div>
        <div className="proy-hero-content">
          <h1 className="proy-hero-title">Proyectos & Objetivos Estratégicos</h1>
          <p className="proy-hero-desc">
            Propón iniciativas de mejora, impulsa el desarrollo del laboratorio y apoya las ideas del equipo de trabajo.
          </p>
          <button className="btn-proy-hero-action" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nueva Propuesta
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="proy-main-container">
        <div className="proy-grid-layout">
          
          {/* ÁREA DE CONTENIDO */}
          <main className="proy-content-area">
            <div className="proy-content-header">
              <h3 className="proy-section-title">Iniciativas del Equipo</h3>
              <span className="proy-section-subtitle">TOTAL — {proyectos.length} PROPUESTAS</span>
            </div>

            {proyectos.length === 0 ? (
              <div className="proy-vacio-card">
                <Target size={40} className="proy-vacio-icon" />
                <p className="proy-vacio-text-bold">Aún no se registraron proyectos o propuestas.</p>
                <p className="proy-vacio-text-light">¡Comenzá compartiendo una idea de mejora para tu área!</p>
              </div>
            ) : (
              <div className="proy-list-container">
                {proyectos.map(p => {
                  const yaTieneLike = p.likes?.includes(user.uid || '');
                  const esAutor = user.uid === p.autorId;
                  const userServicio = (user as any).servicio || (user as any).laboratorio || null;
                  const esLaboratorioCentral = userServicio === "Laboratorio Central";
                  const tienePermisoEdicion = esAutor || esLaboratorioCentral;

                  return (
                    <article key={p.id} className="proy-list-item">
                      
                      {/* Meta Superior: Categoría + Estado + Fecha */}
                      <div className="proy-item-meta-header">
                        <span className="proy-category-tag">
                          {p.categoria.toUpperCase()}
                        </span>
                        <span className={`proy-status-badge status-${p.estado.toLowerCase().replace(' ', '-')}`}>
                          {p.estado}
                        </span>
                        <span className="proy-item-date">{formatearFecha(p.createdAt)}</span>
                      </div>

                      {/* Fila Central: Título + Botones de Acción (Editar/Eliminar) */}
                      <div className="proy-item-middle">
                        <h4 className="proy-item-title">{p.titulo}</h4>
                        <div className="proy-actions-wrapper">
                          {tienePermisoEdicion && (
                            <button 
                              className="btn-proy-action edit" 
                              onClick={() => handleEdit(p)}
                              title="Editar propuesta"
                            >
                              <Edit3 size={15}/>
                            </button>
                          )}
                          <button 
                            className="btn-proy-action delete" 
                            onClick={(e) => handleEliminar(p.id, e)}
                            title="Eliminar propuesta"
                          >
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </div>

                      {/* Descripción */}
                      <p className="proy-item-description">{p.descripcion}</p>

                      {/* Pie: Autor + Botón de Likes alineados */}
                      <div className="proy-item-footer">
                        <span className="proy-item-author">
                          <User size={13} className="proy-author-icon" />
                          {p.autor}
                        </span>

                        <button 
                          className={`btn-proy-like ${yaTieneLike ? 'liked' : ''}`}
                          onClick={() => toggleLike(p.id, yaTieneLike)}
                        >
                          <Heart size={14} fill={yaTieneLike ? "#ef4444" : "none"}/>
                          <span>{p.likes?.length || 0}</span>
                        </button>
                      </div>

                    </article>
                  );
                })}
              </div>
            )}

            {/* BOTÓN REGRESAR */}
            <div className="proy-back-wrapper">
              <button 
                onClick={() => navigate('/')}
                className="btn-proy-back"
              >
                <ArrowLeft size={16} /> 
                <span>VOLVER AL PANEL PRINCIPAL</span>
              </button>
            </div>
          </main>

          {/* BARRA LATERAL (SIDEBAR) */}
          <aside className="proy-sidebar-area">
            <div className="proy-sidebar-widget">
              <h4 className="proy-sidebar-title">
                <BookOpen size={16} /> Guía de Propuestas
              </h4>
              <ul className="proy-guides-list">
                <li>
                  <h5>1. Identificá el Problema</h5>
                  <p>Fundamentá claramente qué cuello de botella o falla buscás resolver.</p>
                </li>
                <li>
                  <h5>2. Estimá el Impacto</h5>
                  <p>Mencioná los beneficios directos en calidad, tiempo o costos.</p>
                </li>
                <li>
                  <h5>3. Colaboración Colectiva</h5>
                  <p>Usá el botón de apoyo (❤️) para medir las prioridades del equipo.</p>
                </li>
              </ul>
            </div>
          </aside>

        </div>
      </div>

      {/* MODAL NUEVA/EDITAR PROPUESTA */}
      {showModal && (
        <div className="proy-modal-backdrop">
          <div className="proy-modal-dialog">
            <div className="proy-modal-content">
              <div className="proy-modal-header">
                <h5 className="proy-modal-title">
                  <Lightbulb className="proy-modal-title-icon" size={20}/>
                  {editingId ? 'Editar Propuesta' : 'Nueva Propuesta'}
                </h5>
                <button className="btn-proy-close" onClick={handleCloseModal}>
                  <X size={14}/>
                </button>
              </div>

              <form onSubmit={guardarProyecto}>
                <div className="proy-modal-body">
                  <div className="proy-form-group">
                    <label className="proy-form-label">¿QUÉ QUERÉS MEJORAR?</label>
                    <input 
                      type="text"
                      className="proy-form-input" 
                      placeholder="Título breve y conciso" 
                      required 
                      value={formProy.titulo}
                      onChange={e => setFormProy({...formProy, titulo: e.target.value})} 
                    />
                  </div>

                  <div className="proy-form-row">
                    <div className="proy-form-group">
                      <label className="proy-form-label">CATEGORÍA</label>
                      <select 
                        className="proy-form-select" 
                        value={formProy.categoria}
                        onChange={e => setFormProy({...formProy, categoria: e.target.value})}
                      >
                        <option>Mejora de Procesos</option>
                        <option>Infraestructura</option>
                        <option>Investigación</option>
                        <option>Bienestar Laboral</option>
                      </select>
                    </div>

                    {editingId && (
                      <div className="proy-form-group">
                        <label className="proy-form-label">ESTADO DEL OBJETIVO</label>
                        <select 
                          className="proy-form-selectHighlight" 
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

                  <div className="proy-form-group">
                    <label className="proy-form-label">DETALLES DE LA PROPUESTA</label>
                    <textarea 
                      className="proy-form-textarea" 
                      rows={4} 
                      placeholder="Describí los alcances e ideas principales de tu propuesta..." 
                      required 
                      value={formProy.descripcion}
                      onChange={e => setFormProy({...formProy, descripcion: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className="proy-modal-footer">
                  <button type="submit" className="btn-proy-submit">
                    {editingId ? 'Actualizar Propuesta' : 'Subir Propuesta'}
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

export default ProyectosYObjetivos;