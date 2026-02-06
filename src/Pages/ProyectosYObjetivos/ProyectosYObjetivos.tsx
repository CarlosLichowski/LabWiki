//Pages/ProyectosYObjetivos/ProyectosYObjetivos.tsx
import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc 
} from 'firebase/firestore';
import { db, auth } from '../../Credenciales';
import { 
  Plus, Heart, User, Trash2, Target, TrendingUp, Lightbulb, ChevronRight
} from 'lucide-react';

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
  const [nuevoProy, setNuevoProy] = useState({ titulo: '', descripcion: '', categoria: 'Mejora de Procesos' });
  
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'proyectos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setProyectos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Proyecto)));
    });
    return () => unsub();
  }, []);

  const crearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'proyectos'), {
        ...nuevoProy,
        autor: user?.displayName || 'Colega',
        autorId: user?.uid,
        likes: [],
        estado: 'Propuesta',
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setNuevoProy({ titulo: '', descripcion: '', categoria: 'Mejora de Procesos' });
    } catch (err) { console.error(err); }
  };

  const toggleLike = async (proyectoId: string, yaTieneLike: boolean) => {
    if (!user) return;
    const docRef = doc(db, 'proyectos', proyectoId);
    await updateDoc(docRef, {
      likes: yaTieneLike ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

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
          const yaTieneLike = p.likes?.includes(user?.uid || '');
          return (
            <div key={p.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden border-top border-4 border-primary">
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={`badge rounded-pill ${p.estado === 'Completado' ? 'bg-success' : 'bg-primary-subtle text-primary'}`}>
                      {p.estado}
                    </span>
                    {user?.uid === p.autorId && (
                      <button className="btn btn-sm btn-light text-danger rounded-circle" onClick={() => { if(confirm("¿Eliminar propuesta?")) deleteDoc(doc(db, 'proyectos', p.id)) }}>
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                  
                  <h5 className="fw-bold text-dark">{p.titulo}</h5>
                  <p className="text-muted small" style={{minHeight: '60px'}}>{p.descripcion}</p>

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

      {/* MODAL MÁS LIMPIO */}
      {showModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg p-2">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold"><Lightbulb className="text-warning me-2"/>Nueva Idea</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={crearProyecto}>
                <div className="modal-body">
                  <label className="small fw-bold text-muted mb-1">¿Qué quieres mejorar?</label>
                  <input className="form-control mb-3 shadow-sm" placeholder="Título breve" required onChange={e => setNuevoProy({...nuevoProy, titulo: e.target.value})} />
                  
                  <label className="small fw-bold text-muted mb-1">Categoría</label>
                  <select className="form-select mb-3 shadow-sm" onChange={e => setNuevoProy({...nuevoProy, categoria: e.target.value})}>
                    <option>Mejora de Procesos</option>
                    <option>Infraestructura</option>
                    <option>Investigación</option>
                    <option>Bienestar Laboral</option>
                  </select>

                  <label className="small fw-bold text-muted mb-1">Detalles de la propuesta</label>
                  <textarea className="form-control shadow-sm" rows={4} placeholder="Describe tu idea aquí..." required onChange={e => setNuevoProy({...nuevoProy, descripcion: e.target.value})}></textarea>
                </div>
                <div className="modal-footer border-0">
                  <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold py-2">Subir Propuesta</button>
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